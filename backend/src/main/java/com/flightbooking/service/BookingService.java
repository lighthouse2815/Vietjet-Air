package com.flightbooking.service;

import com.flightbooking.dto.request.BookingRequests.*;
import com.flightbooking.dto.response.Responses.*;
import com.flightbooking.entity.*;
import com.flightbooking.enums.*;
import com.flightbooking.repository.*;
import com.flightbooking.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.*;
import java.util.*;

@Service
@RequiredArgsConstructor
public class BookingService {
    private final BookingRepository bookings;
    private final FlightRepository flights;
    private final FlightFareRepository fares;
    private final FlightSeatRepository seats;
    private final AncillaryServiceRepository services;
    private final UserAccountRepository users;
    private final CheckInRepository checkIns;
    private final PaymentRepository payments;
    private final FlightService flightService;
    private final PricingService pricing;
    @Value("${app.hold-minutes}") private int holdMinutes;
    private static final SecureRandom RANDOM=new SecureRandom();
    private static final String ALPHABET="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    @Transactional(readOnly=true)
    public PriceView quote(CreateBooking input) { return PricingService.view(prepare(input).booking()); }

    @Transactional
    public BookingView create(CreateBooking input,Long userId) {
        lockFlights(input.segments().stream().map(SegmentInput::flightId).toList());
        Prepared prepared=prepare(input);Booking booking=prepared.booking();
        booking.setCode(newCode());booking.setAccessToken(UUID.randomUUID());booking.setStatus(BookingStatus.PENDING);
        booking.setCreatedAt(Instant.now());booking.setExpiresAt(Instant.now().plusSeconds(holdMinutes*60L));
        if(userId!=null) booking.setUser(users.findById(userId).orElseThrow(()->BusinessException.notFound("Không tìm thấy tài khoản")));
        bookings.saveAndFlush(booking);
        for(SelectedSeat selection:prepared.seats()) {
            selection.seat().setBooking(booking);selection.seat().setPassengerIndex(selection.passengerIndex());
        }
        return view(booking);
    }
    private record SelectedSeat(FlightSeat seat,int passengerIndex) {}
    private record Prepared(Booking booking,List<SelectedSeat> seats) {}

    private Prepared prepare(CreateBooking input) {
        validatePassengers(input);
        if(input.segments().stream().map(SegmentInput::flightId).distinct().count()!=input.segments().size())
            throw BusinessException.badRequest("Không thể chọn trùng chuyến bay trong hành trình");
        Booking booking=new Booking();booking.setContactEmail(input.contactEmail().trim());booking.setContactPhone(input.contactPhone().trim());
        for(int i=0;i<input.passengers().size();i++) {
            PassengerInput p=input.passengers().get(i);Passenger passenger=new Passenger();passenger.setBooking(booking);passenger.setPassengerIndex(i);
            passenger.setType(p.type());passenger.setTitle(p.title());passenger.setLastName(p.lastName().trim());passenger.setFirstName(p.firstName().trim());
            passenger.setDateOfBirth(p.dateOfBirth());passenger.setNationality(p.nationality());booking.getPassengers().add(passenger);
        }
        int seated=(int)booking.getPassengers().stream().filter(p->p.getType()!=PassengerType.INFANT).count();
        List<SelectedSeat> selected=new ArrayList<>();BigDecimal seatAmount=BigDecimal.ZERO;
        for(int i=0;i<input.segments().size();i++) {
            SegmentInput segment=input.segments().get(i);Flight flight=flightService.entity(segment.flightId());
            if(!flight.getDepartureTime().isAfter(Instant.now().plusSeconds(3600))) throw BusinessException.conflict("Chuyến bay đã khởi hành hoặc sắp đóng đặt chỗ");
            if(flightService.remaining(flight)<seated) throw BusinessException.conflict("Không còn đủ ghế cho toàn bộ hành khách");
            FlightFare fare=fares.findByFlightIdAndFareClassCode(flight.getId(),segment.fareCode()).orElseThrow(()->BusinessException.badRequest("Hạng vé không hợp lệ"));
            BookingSegment s=new BookingSegment();s.setBooking(booking);s.setFlight(flight);s.setFareClass(fare.getFareClass());s.setUnitPrice(fare.getPrice());s.setSeatedPassengers(seated);s.setSegmentIndex(i);booking.getSegments().add(s);
            Set<Integer> assignedPassengers=new HashSet<>();Set<String> assignedSeats=new HashSet<>();
            for(SeatInput seatInput:segment.seats()) {
                validatePassengerIndex(booking,seatInput.passengerIndex());
                if(!assignedPassengers.add(seatInput.passengerIndex()) || !assignedSeats.add(seatInput.seatNumber())) throw BusinessException.badRequest("Một hành khách chỉ chọn một ghế trên mỗi chặng");
                FlightSeat seat=availableSeat(flight.getId(),seatInput.seatNumber());
                seatAmount=seatAmount.add(pricing.seatPrice(fare.getFareClass(),seat));selected.add(new SelectedSeat(seat,seatInput.passengerIndex()));
            }
            Set<String> categories=new HashSet<>();
            for(ExtraInput extra:segment.extras()) {
                validatePassengerIndex(booking,extra.passengerIndex());
                AncillaryService service=services.findById(extra.serviceId()).orElseThrow(()->BusinessException.badRequest("Dịch vụ không tồn tại"));
                if(!categories.add(extra.passengerIndex()+":"+service.getCategory())) throw BusinessException.badRequest("Chỉ chọn một gói trong mỗi nhóm dịch vụ cho hành khách/chặng");
                BookingAncillary ancillary=new BookingAncillary();ancillary.setBooking(booking);ancillary.setFlight(flight);ancillary.setService(service);ancillary.setPassengerIndex(extra.passengerIndex());ancillary.setPrice(service.getPrice());booking.getAncillaries().add(ancillary);
            }
        }
        validateJourney(booking);
        pricing.calculate(booking,seatAmount,input.promotionCode());
        return new Prepared(booking,selected);
    }
    private void validatePassengers(CreateBooking input) {
        long adults=input.passengers().stream().filter(p->p.type()==PassengerType.ADULT).count();
        long infants=input.passengers().stream().filter(p->p.type()==PassengerType.INFANT).count();
        if(adults<1||infants>adults) throw BusinessException.badRequest("Cần ít nhất một người lớn; số em bé không vượt số người lớn");
        LocalDate date=flightService.entity(input.segments().getFirst().flightId()).getDepartureTime().atZone(FlightService.ZONE).toLocalDate();
        for(PassengerInput p:input.passengers()) {
            int age=Period.between(p.dateOfBirth(),date).getYears();
            boolean valid=switch(p.type()){case ADULT->age>=12;case CHILD->age>=2&&age<12;case INFANT->age>=0&&age<2;};
            if(!valid || p.dateOfBirth().isAfter(LocalDate.now(FlightService.ZONE))) throw BusinessException.badRequest("Ngày sinh không phù hợp với loại hành khách");
            if(!List.of("MR","MS","MSTR","MISS").contains(p.title())) throw BusinessException.badRequest("Danh xưng không hợp lệ");
        }
    }
    private void validateJourney(Booking booking) {
        if(booking.getSegments().size()==2) {
            Flight out=booking.getSegments().get(0).getFlight(), back=booking.getSegments().get(1).getFlight();
            if(!out.getOrigin().getId().equals(back.getDestination().getId()) || !out.getDestination().getId().equals(back.getOrigin().getId()) || !back.getDepartureTime().isAfter(out.getArrivalTime()))
                throw BusinessException.badRequest("Chặng về phải đảo chiều và khởi hành sau khi chặng đi đến nơi");
        }
    }
    public void validatePassengerIndex(Booking b,int index) {
        if(index<0 || index>=b.getPassengers().size() || b.getPassengers().get(index).getType()==PassengerType.INFANT)
            throw BusinessException.badRequest("Hành khách không hợp lệ hoặc em bé không có ghế/dịch vụ riêng");
    }
    public FlightSeat availableSeat(Long flightId,String seatNumber) {
        FlightSeat seat=seats.findByFlightIdAndSeatNumber(flightId,seatNumber).orElseThrow(()->BusinessException.badRequest("Ghế không tồn tại"));
        if(seat.isBlocked() || (seat.getBooking()!=null && (seat.getBooking().getStatus()==BookingStatus.CONFIRMED || (seat.getBooking().getStatus()==BookingStatus.PENDING && seat.getBooking().getExpiresAt().isAfter(Instant.now())))))
            throw BusinessException.conflict("Ghế "+seatNumber+" đã được giữ hoặc không khả dụng");
        return seat;
    }
    public void lockFlights(List<Long> ids) {
        ids.stream().distinct().sorted().forEach(id->flights.findLocked(id).orElseThrow(()->BusinessException.notFound("Không tìm thấy chuyến bay")));
    }
    public Booking locked(Long id,String token) {
        Booking b=bookings.findLocked(id).orElseThrow(()->BusinessException.notFound("Không tìm thấy booking"));authorize(b,token);return b;
    }
    public void authorize(Booking b,String token) {
        if(token==null||!b.getAccessToken().toString().equals(token)) throw new BusinessException(HttpStatus.FORBIDDEN,"BOOKING_ACCESS_DENIED","Cần thông tin tra cứu hoặc token truy cập booking hợp lệ");
    }
    @Transactional(readOnly=true)
    public BookingView get(String code,String token) {
        Booking b=bookings.findByCode(code.toUpperCase(Locale.ROOT)).orElseThrow(()->BusinessException.notFound("Không tìm thấy booking"));authorize(b,token);return view(b);
    }
    @Transactional(readOnly=true)
    public BookingView lookup(Lookup input) {
        Booking b=bookings.findByCode(input.bookingCode().trim().toUpperCase(Locale.ROOT)).orElseThrow(()->BusinessException.notFound("Thông tin đặt chỗ không khớp"));
        boolean match=b.getPassengers().stream().anyMatch(p->AirportService.normalize(p.getLastName()).equals(AirportService.normalize(input.lastName())) && AirportService.normalize(p.getFirstName()).equals(AirportService.normalize(input.firstName())));
        if(!match) throw BusinessException.notFound("Thông tin đặt chỗ không khớp");
        return view(b);
    }
    @Transactional
    public BookingView cancel(Long id,String token) {
        Booking b=locked(id,token);lockFlights(b.getSegments().stream().map(s->s.getFlight().getId()).toList());
        if(b.getStatus()==BookingStatus.CANCELLED||b.getStatus()==BookingStatus.EXPIRED)return view(b);
        if(!checkIns.findByBookingId(id).isEmpty()) throw BusinessException.conflict("Không thể hủy booking đã check-in trong demo");
        if(b.getSegments().stream().anyMatch(s->!s.getFlight().getDepartureTime().isAfter(Instant.now())))throw BusinessException.conflict("Không thể hủy chuyến đã khởi hành");
        b.setStatus(BookingStatus.CANCELLED);releaseSeats(b);return view(b);
    }
    public void releaseSeats(Booking b) {for(FlightSeat seat:seats.findByBookingId(b.getId())) {seat.setBooking(null);seat.setPassengerIndex(null);}}
    public BookingView view(Booking b) {
        List<FlightSeat> assigned=seats.findByBookingId(b.getId());
        String effectiveStatus=b.getStatus()==BookingStatus.PENDING&&b.getExpiresAt().isBefore(Instant.now())?"EXPIRED":b.getStatus().name();
        return new BookingView(b.getId(),b.getCode(),b.getAccessToken(),effectiveStatus,b.getContactEmail(),b.getContactPhone(),b.getCreatedAt(),b.getExpiresAt(),
                b.getSegments().stream().map(s->new SegmentView(s.getSegmentIndex(),flightService.view(s.getFlight()),FlightService.fareView(s.getFareClass(),s.getUnitPrice()),assigned.stream().filter(seat->seat.getFlight().getId().equals(s.getFlight().getId())).map(seat->FlightService.seatView(seat,b.getId())).toList())).toList(),
                b.getPassengers().stream().map(p->new PassengerView(p.getPassengerIndex(),p.getType().name(),p.getTitle(),p.getLastName(),p.getFirstName(),p.getDateOfBirth(),p.getNationality())).toList(),
                b.getAncillaries().stream().map(a->new ExtraView(a.getFlight().getId(),a.getPassengerIndex(),ContentService.view(a.getService()),a.getPrice())).toList(),PricingService.view(b),
                checkIns.findByBookingId(b.getId()).stream().map(c->new BoardingPassView(c.getFlight().getId(),c.getPassengerIndex(),c.getSeatNumber(),c.getBoardingCode(),c.getCheckedInAt())).toList(),
                payments.findFirstByBookingIdOrderByCreatedAtDescIdDesc(b.getId()).map(Payment::getStatus).orElse("UNPAID"));
    }
    private String newCode() {StringBuilder code=new StringBuilder();for(int i=0;i<8;i++)code.append(ALPHABET.charAt(RANDOM.nextInt(ALPHABET.length())));return code.toString();}
}
