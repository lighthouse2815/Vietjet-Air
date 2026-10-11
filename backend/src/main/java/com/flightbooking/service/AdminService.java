package com.flightbooking.service;
import com.flightbooking.dto.request.AdminRequests.*;
import com.flightbooking.entity.*;
import com.flightbooking.exception.BusinessException;
import com.flightbooking.repository.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service @RequiredArgsConstructor
public class AdminService {
    private final BookingRepository bookings;private final BookingService bookingService;
    private final RefundRequestRepository refunds;private final BookingChangeService changes;
    private final SupportTicketRepository tickets;private final SupportService support;
    private final MailMessageRepository mail;private final ShopOrderRepository orders;private final ShopService shop;
    private final ShopProductRepository products;private final AncillaryServiceRepository ancillaries;
    private final PromotionCodeRepository promotions;private final ContentItemRepository content;
    private final FlightRepository flights;private final FlightService flightService;
    private final AirportRepository airports;private final FlightFareRepository fares;private final FareClassRepository classes;
    private final BookingSegmentRepository segments;private final FlightSeedService seed;
    public record MailView(Long id,String recipient,String subject,String body,Instant createdAt) {}
    public record PromotionView(Long id,String code,int percent,BigDecimal maxDiscount,LocalDate expiresOn) {}
    public record ContentView(Long id,String category,String title,String description,String image,String target,int sortOrder,Map<String,Object> details) {}
    @Transactional(readOnly=true)
    public Object list(String resource,int page,int size) {
        if(page<0||size<1||size>100)throw BusinessException.badRequest("Trang không âm; kích thước từ 1 đến 100");
        Pageable paging=PageRequest.of(page,size,Sort.by(Sort.Direction.DESC,"id"));
        return switch(resource) {
            case "bookings" -> bookings.findAll(paging).stream().map(bookingService::view).toList();
            case "refunds" -> refunds.findAll(paging).stream().map(changes::view).toList();
            case "tickets" -> tickets.findAll(paging).stream().map(support::view).toList();
            case "orders" -> orders.findAll(paging).stream().map(shop::view).toList();
            case "mail" -> mail.findAll(paging).stream().map(m->new MailView(m.getId(),m.getRecipient(),m.getSubject(),m.getBody(),m.getCreatedAt())).toList();
            case "flights" -> flightService.views(flights.findByDepartureTimeAfterOrderByDepartureTimeAsc(Instant.now(),PageRequest.of(page,size)));
            case "catalog" -> Map.of("products",products.findAll().stream().map(shop::view).toList(),"ancillaries",ancillaries.findAll().stream().map(ContentService::view).toList(),
                "promotions",promotions.findAll().stream().map(p->new PromotionView(p.getId(),p.getCode(),p.getPercent(),p.getMaxDiscount(),p.getExpiresOn())).toList(),
                "content",content.findAll().stream().map(c->new ContentView(c.getId(),c.getCategory(),c.getTitle(),c.getDescription(),c.getImage(),c.getTarget(),c.getSortOrder(),c.getDetails())).toList());
            default -> throw BusinessException.notFound("Không có danh mục quản trị này");
        };
    }
    @Transactional
    public ShopService.ProductView product(Long id,Product input) {
        ShopProduct p=id==null?new ShopProduct():products.findLocked(id).orElseThrow(()->BusinessException.notFound("Không tìm thấy sản phẩm"));
        p.setName(input.name().trim());p.setDescription(input.description().trim());p.setPrice(input.price());p.setStock(input.stock());p.setActive(input.active());return shop.view(products.save(p));
    }
    @Transactional
    public com.flightbooking.dto.response.Responses.ServiceView ancillary(Long id,Ancillary input) {
        AncillaryService a=id==null?new AncillaryService():ancillaries.findById(id).orElseThrow(()->BusinessException.notFound("Không tìm thấy dịch vụ"));
        a.setCode(input.code());a.setName(input.name().trim());a.setCategory(input.category());a.setDescription(input.description().trim());a.setPrice(input.price());return ContentService.view(ancillaries.save(a));
    }
    @Transactional
    public PromotionView promotion(Long id,Promotion input) {
        PromotionCode p=id==null?new PromotionCode():promotions.findById(id).orElseThrow(()->BusinessException.notFound("Không tìm thấy khuyến mại"));p.setCode(input.code());p.setPercent(input.percent());p.setMaxDiscount(input.maxDiscount());p.setExpiresOn(input.expiresOn());promotions.save(p);return new PromotionView(p.getId(),p.getCode(),p.getPercent(),p.getMaxDiscount(),p.getExpiresOn());
    }
    @Transactional
    public ContentView content(Long id,Content input) {
        if(!input.image().isEmpty()&&!input.image().matches("/assets/(?:[a-zA-Z0-9_-]+/)*[a-zA-Z0-9_-][a-zA-Z0-9._-]*"))throw BusinessException.badRequest("Ảnh phải thuộc thư mục assets của web");
        if(!input.target().matches("/[a-zA-Z0-9/_?#=&%.-]*")&&!input.category().equals("FAQ")&&!input.category().equals("DESTINATION"))throw BusinessException.badRequest("Liên kết phải là đường dẫn nội bộ");
        if(input.details()!=null) validateDetails(input.details(),0);
        if(input.category().equals("PAGE")) content.findByCategoryAndTarget("PAGE",input.target()).filter(c->!c.getId().equals(id))
            .ifPresent(c->{throw BusinessException.conflict("Trang đã có nội dung quản trị");});
        ContentItem c=id==null?new ContentItem():content.findById(id).orElseThrow(()->BusinessException.notFound("Không tìm thấy nội dung"));c.setCategory(input.category());c.setTitle(input.title().trim());c.setDescription(input.description().trim());c.setImage(input.image());c.setTarget(input.target());c.setSortOrder(input.sortOrder());if(input.details()!=null)c.setDetails(input.details());content.save(c);return new ContentView(c.getId(),c.getCategory(),c.getTitle(),c.getDescription(),c.getImage(),c.getTarget(),c.getSortOrder(),c.getDetails());
    }
    private void validateDetails(Object value,int depth) {
        if(depth>8)throw BusinessException.badRequest("Cấu hình nội dung không hợp lệ");
        if(value instanceof Map<?,?> map) {
            if(map.size()>50)throw BusinessException.badRequest("Cấu hình nội dung không hợp lệ");
            for(var entry:map.entrySet()) {
                if(entry.getValue() instanceof String text) {
                    String key=entry.getKey().toString();
                    if(List.of("image","mobileImage","logo","src","titleImage","footerImage","desktopImage").contains(key)
                        && !text.matches("/assets/(?:[a-zA-Z0-9_-]+/)*[a-zA-Z0-9_-][a-zA-Z0-9._-]*"))throw BusinessException.badRequest("Ảnh phải thuộc thư mục assets của web");
                    if(key.equals("source") && (!text.startsWith("https://") || java.net.URI.create(text).getHost()==null))throw BusinessException.badRequest("Liên kết nhà cung cấp phải dùng HTTPS");
                    if(key.equals("target") && (!text.startsWith("/")&&!text.startsWith("#") || text.startsWith("//")))throw BusinessException.badRequest("Liên kết phải là đường dẫn nội bộ");
                }
                validateDetails(entry.getValue(),depth+1);
            }
        } else if(value instanceof List<?> list) {
            if(list.size()>100)throw BusinessException.badRequest("Cấu hình nội dung không hợp lệ");
            list.forEach(item->validateDetails(item,depth+1));
        } else if(value instanceof String text && text.length()>4000)throw BusinessException.badRequest("Cấu hình nội dung không hợp lệ");
    }
    @Transactional
    public com.flightbooking.dto.response.Responses.FlightView flight(Long id,FlightEdit input) {
        if(input.origin().equals(input.destination())||!input.arrivalTime().isAfter(input.departureTime()))throw BusinessException.badRequest("Tuyến hoặc giờ bay không hợp lệ");
        Flight f=id==null?new Flight():flights.findLocked(id).orElseThrow(()->BusinessException.notFound("Không tìm thấy chuyến bay"));
        long occupied=id==null?0:segments.reservedCount(id,Instant.now());
        if(occupied>input.capacity())throw BusinessException.conflict("Sức chứa không được thấp hơn số chỗ đang giữ");
        if(occupied>0&&(!f.getOrigin().getCode().equals(input.origin())||!f.getDestination().getCode().equals(input.destination())||!f.getDepartureTime().equals(input.departureTime())||!f.getArrivalTime().equals(input.arrivalTime())||!f.getFlightNumber().equals(input.flightNumber())))throw BusinessException.conflict("Chuyến đã có booking: giữ nguyên tuyến, số hiệu và lịch bay");
        f.setFlightNumber(input.flightNumber());f.setOrigin(airports.findByCode(input.origin()).orElseThrow(()->BusinessException.badRequest("Sân bay không hợp lệ")));f.setDestination(airports.findByCode(input.destination()).orElseThrow(()->BusinessException.badRequest("Sân bay không hợp lệ")));f.setDepartureTime(input.departureTime());f.setArrivalTime(input.arrivalTime());f.setAircraft(input.aircraft());f.setCapacity(input.capacity());flights.saveAndFlush(f);
        if(id==null)seed.initializeSeats(f);f.setCapacity(input.capacity());
        Map<String,BigDecimal> prices=Map.of("ECO",input.ecoPrice(),"DELUXE",input.deluxePrice(),"SKYBOSS",input.skybossPrice(),"BUSINESS",input.businessPrice());
        for(FareClass c:classes.findAllByOrderByIdAsc()){FlightFare fare=fares.findByFlightIdAndFareClassCode(f.getId(),c.getCode()).orElseGet(FlightFare::new);fare.setFlight(f);fare.setFareClass(c);fare.setPrice(prices.get(c.getCode()));fares.save(fare);}fares.flush();return flightService.view(f);
    }
}
