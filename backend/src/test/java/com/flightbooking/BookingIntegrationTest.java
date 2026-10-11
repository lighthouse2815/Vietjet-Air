package com.flightbooking;

import com.flightbooking.dto.request.BookingRequests.*;
import com.flightbooking.dto.response.Responses.*;
import com.flightbooking.enums.*;
import com.flightbooking.exception.BusinessException;
import com.flightbooking.repository.*;
import com.flightbooking.service.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.support.TransactionTemplate;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@Testcontainers
@AutoConfigureMockMvc
class BookingIntegrationTest {
    @Container static PostgreSQLContainer<?> db=new PostgreSQLContainer<>("postgres:17-alpine");
    @DynamicPropertySource static void properties(DynamicPropertyRegistry p) {
        p.add("spring.datasource.url",db::getJdbcUrl);p.add("spring.datasource.username",db::getUsername);p.add("spring.datasource.password",db::getPassword);
        p.add("app.jwt-secret",()->"integration-test-only-secret-with-at-least-32-bytes");p.add("app.seed-days",()->3);
    }
    @Autowired BookingService bookings;
    @Autowired FlightService flights;
    @Autowired PaymentService payments;
    @Autowired CheckInService checkIn;
    @Autowired BookingRepository bookingRepo;
    @Autowired FlightRepository flightRepo;
    @Autowired FlightFareRepository fareRepo;
    @Autowired AncillaryServiceRepository extrasRepo;
    @Autowired PaymentRepository paymentRepo;
    @Autowired BookingExpiryService expiry;
    @Autowired TransactionTemplate tx;
    @Autowired RateLimitService limits;
    @Autowired MockMvc http;
    private Long flightId;
    @BeforeEach void chooseFlight(){
        flightId=flights.search("SGN","HAN",LocalDate.now(FlightService.ZONE).plusDays(1),1).getFirst().id();
        Long back=flights.search("HAN","SGN",LocalDate.now(FlightService.ZONE).plusDays(2),1).getFirst().id();
        tx.executeWithoutResult(s->{
            fareRepo.findByFlightIdAndFareClassCode(flightId,"ECO").orElseThrow().setPrice(new BigDecimal("490000"));
            fareRepo.findByFlightIdAndFareClassCode(flightId,"DELUXE").orElseThrow().setPrice(new BigDecimal("890000"));
            fareRepo.findByFlightIdAndFareClassCode(back,"ECO").orElseThrow().setPrice(new BigDecimal("590000"));
        });
    }
    private CreateBooking input(Long flight,String seat,String promo) {
        return new CreateBooking(List.of(new SegmentInput(flight,"ECO",seat==null?List.of():List.of(new SeatInput(0,seat)),List.of())),
            List.of(new PassengerInput(PassengerType.ADULT,"MR","NGUYEN","VAN DEMO",LocalDate.of(1990,1,1),"Việt Nam")),"demo@example.com","0901234567",promo);
    }
    private BookingView create(String seat){return bookings.create(input(flightId,seat,""),null);}

    @Test void serverCalculatesPriceAndKeepsSnapshotAfterFareChanges(){
        BookingView b=bookings.create(input(flightId,"3A","DEMO10"),null);
        assertThat(b.price().baseAmount()).isEqualByComparingTo("490000");
        assertThat(b.price().taxAmount()).isEqualByComparingTo("120000");
        assertThat(b.price().extrasAmount()).isEqualByComparingTo("60000");
        assertThat(b.price().discountAmount()).isEqualByComparingTo("49000");
        assertThat(b.price().totalAmount()).isEqualByComparingTo("621000");
        tx.executeWithoutResult(s->{var fare=fareRepo.findByFlightIdAndFareClassCode(flightId,"ECO").orElseThrow();fare.setPrice(new BigDecimal("999000"));});
        try{assertThat(bookings.get(b.code(),b.accessToken().toString()).price().totalAmount()).isEqualByComparingTo("621000");}
        finally{tx.executeWithoutResult(s->fareRepo.findByFlightIdAndFareClassCode(flightId,"ECO").orElseThrow().setPrice(new BigDecimal("490000")));bookings.cancel(b.id(),b.accessToken().toString());}
    }
    @Test void rejectsInvalidRoutesDatesAndReturnsEmptyForUnseededDate(){
        assertThatThrownBy(()->flights.search("SGN","SGN",LocalDate.now(FlightService.ZONE).plusDays(1),1)).isInstanceOf(BusinessException.class);
        assertThatThrownBy(()->flights.search("XXX","HAN",LocalDate.now(FlightService.ZONE).plusDays(1),1)).isInstanceOf(BusinessException.class);
        assertThatThrownBy(()->flights.search("SGN","HAN",LocalDate.now(FlightService.ZONE).minusDays(1),1)).isInstanceOf(BusinessException.class);
        assertThat(flights.search("SGN","HAN",LocalDate.now(FlightService.ZONE).plusDays(100),1)).isEmpty();
    }
    @Test void failedPaymentCanRetryAndRepeatedSuccessCreatesOnePayment(){
        BookingView b=create(null);String token=b.accessToken().toString();UUID key=UUID.randomUUID();
        assertThat(payments.pay(new DemoPayment(b.id(),UUID.randomUUID(),"FAILED"),token).status()).isEqualTo("FAILED");
        assertThat(bookings.get(b.code(),token).status()).isEqualTo("PENDING");
        PaymentView first=payments.pay(new DemoPayment(b.id(),key,"SUCCESS"),token);
        assertThat(payments.pay(new DemoPayment(b.id(),key,"SUCCESS"),token).id()).isEqualTo(first.id());
        assertThat(payments.pay(new DemoPayment(b.id(),UUID.randomUUID(),"SUCCESS"),token).id()).isEqualTo(first.id());
        assertThat(bookings.get(b.code(),token).status()).isEqualTo("CONFIRMED");
        assertThatThrownBy(()->payments.pay(new DemoPayment(b.id(),key,"FAILED"),token)).isInstanceOf(BusinessException.class);
        bookings.cancel(b.id(),token);
    }
    @Test void lookupRequiresMatchingNameAndAccessToken(){
        BookingView b=create(null);String token=b.accessToken().toString();
        assertThat(bookings.lookup(new Lookup(b.code(),"Nguyễn","Văn Demo")).id()).isEqualTo(b.id());
        assertThatThrownBy(()->bookings.lookup(new Lookup(b.code(),"WRONG","NAME"))).isInstanceOf(BusinessException.class);
        assertThatThrownBy(()->bookings.get(b.code(),null)).isInstanceOf(BusinessException.class);
        assertThatThrownBy(()->bookings.cancel(b.id(),UUID.randomUUID().toString())).isInstanceOf(BusinessException.class);
        bookings.cancel(b.id(),token);
    }
    @Test void pendingBookingCannotCheckInAndConfirmedCheckInIsIdempotent(){
        BookingView b=create("4A");String token=b.accessToken().toString();var request=new CheckInInput(b.id(),flightId,0,"4A",true);
        assertThatThrownBy(()->checkIn.complete(request,token)).isInstanceOf(BusinessException.class);
        payments.pay(new DemoPayment(b.id(),UUID.randomUUID(),"SUCCESS"),token);
        BookingView checked=checkIn.complete(request,token);
        assertThat(checked.boardingPasses()).hasSize(1);
        assertThat(checkIn.complete(request,token).boardingPasses()).hasSize(1);
        assertThatThrownBy(()->checkIn.complete(new CheckInInput(b.id(),flightId,0,"4B",true),token)).isInstanceOf(BusinessException.class);
        assertThatThrownBy(()->bookings.cancel(b.id(),token)).isInstanceOf(BusinessException.class);
    }
    @Test void expiredHoldCannotBePaidAndReleasesSeat(){
        BookingView b=create("5A");String token=b.accessToken().toString();
        tx.executeWithoutResult(s->bookingRepo.findById(b.id()).orElseThrow().setExpiresAt(Instant.now().minusSeconds(30)));
        assertThatThrownBy(()->payments.pay(new DemoPayment(b.id(),UUID.randomUUID(),"SUCCESS"),token)).isInstanceOf(BusinessException.class);
        expiry.expire();assertThat(bookings.get(b.code(),token).status()).isEqualTo("EXPIRED");
        BookingView next=create("5A");bookings.cancel(next.id(),next.accessToken().toString());
    }
    @Test void simultaneousBookingsCannotReserveSameSeat() throws Exception {
        try(ExecutorService pool=Executors.newFixedThreadPool(2)) {
            CountDownLatch start=new CountDownLatch(1);List<Future<BookingView>> futures=new ArrayList<>();
            for(int i=0;i<2;i++)futures.add(pool.submit(()->{start.await();try{return create("6A");}catch(BusinessException e){assertThat(e.getStatus().value()).isEqualTo(409);return null;}}));
            start.countDown();List<BookingView> successes=new ArrayList<>();for(var f:futures){BookingView b=f.get(20,TimeUnit.SECONDS);if(b!=null)successes.add(b);}
            assertThat(successes).hasSize(1);var b=successes.getFirst();bookings.cancel(b.id(),b.accessToken().toString());
        }
    }
    @Test void lastCapacityCannotBeOverbookedConcurrently() throws Exception {
        Long id=flights.search("SGN","HAN",LocalDate.now(FlightService.ZONE).plusDays(2),1).getLast().id();
        tx.executeWithoutResult(s->flightRepo.findById(id).orElseThrow().setCapacity(1));
        try(ExecutorService pool=Executors.newFixedThreadPool(2)) {
            CountDownLatch start=new CountDownLatch(1);List<Future<BookingView>> futures=new ArrayList<>();
            for(int i=0;i<2;i++)futures.add(pool.submit(()->{start.await();try{return bookings.create(input(id,null,""),null);}catch(BusinessException e){return null;}}));
            start.countDown();List<BookingView> successes=new ArrayList<>();for(var f:futures){BookingView b=f.get(20,TimeUnit.SECONDS);if(b!=null)successes.add(b);}
            assertThat(successes).hasSize(1);assertThat(flights.get(id).remainingSeats()).isZero();var b=successes.getFirst();bookings.cancel(b.id(),b.accessToken().toString());
        }finally{tx.executeWithoutResult(s->flightRepo.findById(id).orElseThrow().setCapacity(71));}
    }
    @Test void roundTripAndAncillariesArePersistedAndPriced(){
        Long back=flights.search("HAN","SGN",LocalDate.now(FlightService.ZONE).plusDays(2),1).getFirst().id();
        Long baggage=extrasRepo.findAllByOrderByIdAsc().getFirst().getId();
        CreateBooking base=input(flightId,null,"");
        CreateBooking request=new CreateBooking(List.of(new SegmentInput(flightId,"DELUXE",List.of(new SeatInput(0,"7A")),List.of(new ExtraInput(baggage,0))),new SegmentInput(back,"ECO",List.of(),List.of())),base.passengers(),base.contactEmail(),base.contactPhone(),"");
        BookingView b=bookings.create(request,null);
        assertThat(b.segments()).hasSize(2);assertThat(b.extras()).hasSize(1);assertThat(b.price().baseAmount()).isEqualByComparingTo("1480000");
        assertThat(b.price().taxAmount()).isEqualByComparingTo("240000");assertThat(b.price().extrasAmount()).isEqualByComparingTo("200000");assertThat(b.price().totalAmount()).isEqualByComparingTo("1920000");
        bookings.cancel(b.id(),b.accessToken().toString());
    }
    @Test void lookupLimiterRejectsSixteenthAttempt(){for(int i=0;i<15;i++)limits.check("test","integration");assertThatThrownBy(()->limits.check("test","integration")).isInstanceOf(BusinessException.class);}
    @Test void missingSearchParametersReturnClientError() throws Exception {
        http.perform(get("/api/flights/search")).andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_REQUEST"));
    }
    @Test void malformedBookingAndCheckInRequestsAreValidated() throws Exception {
        http.perform(post("/api/bookings").contentType("application/json").content("{}"))
            .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        http.perform(post("/api/check-in/complete").contentType("application/json").content("{\"bookingId\":1,\"flightId\":1,\"passengerIndex\":0,\"seatNumber\":\"3A\",\"acceptedConditions\":false}"))
            .andExpect(status().isBadRequest());
    }
    @Test void childInfantAndPromotionValidationCannotBeBypassed(){
        CreateBooking base=input(flightId,null,"");
        CreateBooking invalid=new CreateBooking(base.segments(),List.of(new PassengerInput(PassengerType.INFANT,"MSTR","TEST","BABY",LocalDate.now(FlightService.ZONE).minusMonths(6),"Việt Nam")),base.contactEmail(),base.contactPhone(),"");
        assertThatThrownBy(()->bookings.create(invalid,null)).isInstanceOf(BusinessException.class);
        assertThatThrownBy(()->bookings.create(input(flightId,null,"FAKE_PROMO"),null)).isInstanceOf(BusinessException.class);
        CreateBooking ageWrong=new CreateBooking(base.segments(),List.of(new PassengerInput(PassengerType.ADULT,"MR","TEST","ADULT",LocalDate.now(FlightService.ZONE).minusYears(5),"Việt Nam")),base.contactEmail(),base.contactPhone(),"");
        assertThatThrownBy(()->bookings.create(ageWrong,null)).isInstanceOf(BusinessException.class);
    }
    @Test void cancelledPaymentReleasesCapacityAndSeats(){
        int before=flights.get(flightId).remainingSeats();BookingView b=create("9A");
        assertThat(flights.get(flightId).remainingSeats()).isEqualTo(before-1);
        payments.pay(new DemoPayment(b.id(),UUID.randomUUID(),"CANCELLED"),b.accessToken().toString());
        assertThat(bookings.get(b.code(),b.accessToken().toString()).status()).isEqualTo("CANCELLED");
        assertThat(flights.get(flightId).remainingSeats()).isEqualTo(before);
        assertThat(flights.seatViews(flightId).stream().filter(s->s.seatNumber().equals("9A")).findFirst().orElseThrow().status()).isEqualTo("AVAILABLE");
    }
    @Test void confirmedBookingOutsideWindowCannotCheckIn(){
        Long id=flights.search("SGN","DAD",LocalDate.now(FlightService.ZONE).plusDays(1),1).getFirst().id();
        BookingView b=bookings.create(input(id,null,""),null);String token=b.accessToken().toString();payments.pay(new DemoPayment(b.id(),UUID.randomUUID(),"SUCCESS"),token);
        Instant original=tx.execute(s->flightRepo.findById(id).orElseThrow().getDepartureTime());
        tx.executeWithoutResult(s->flightRepo.findById(id).orElseThrow().setDepartureTime(Instant.now().plusSeconds(30)));
        try {assertThatThrownBy(()->checkIn.complete(new CheckInInput(b.id(),id,0,"3A",true),token)).isInstanceOf(BusinessException.class);}
        finally{tx.executeWithoutResult(s->flightRepo.findById(id).orElseThrow().setDepartureTime(original));bookings.cancel(b.id(),token);}
    }
}
