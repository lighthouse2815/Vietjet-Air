package com.flightbooking.service;
import com.flightbooking.dto.request.CommerceRequests.*;
import com.flightbooking.dto.request.ChangeRequests.Pay;
import com.flightbooking.entity.*;
import com.flightbooking.enums.BookingStatus;
import com.flightbooking.exception.BusinessException;
import com.flightbooking.repository.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service @RequiredArgsConstructor
public class ShopService {
    private final ShopProductRepository products;
    private final ShopOrderRepository orders;
    private final UserAccountRepository users;
    private final BookingService bookings;
    private final VoucherService vouchers;
    private final LoyaltyService loyalty;
    public record ProductView(Long id,String name,String description,BigDecimal price,int stock,boolean active) {}
    public record ItemView(Long productId,String name,int quantity,BigDecimal price) {}
    public record OrderView(Long id,String status,String delivery,String bookingCode,BigDecimal total,Instant expiresAt,List<ItemView> items) {}
    @Transactional(readOnly=true)
    public List<ProductView> products() {return products.findByActiveTrueOrderByIdAsc().stream().map(this::view).toList();}
    @Transactional(readOnly=true)
    public List<OrderView> list(Long id) {return orders.findByUserIdOrderByIdDesc(id,PageRequest.of(0,100)).stream().map(this::view).toList();}
    @Transactional
    public OrderView create(Long userId,CreateOrder input) {
        Booking deliveryBooking=null;
        if(input.delivery().equals("ON_BOARD")){
            if(input.bookingCode()==null||input.bookingToken()==null)throw BusinessException.badRequest("Chọn booking đã xác nhận để nhận hàng theo chuyến");
            var found=bookings.get(input.bookingCode(),input.bookingToken());deliveryBooking=bookings.locked(found.id(),input.bookingToken());
        }
        UserAccount u=users.findLocked(userId).orElseThrow();var old=orders.findByRequestKey(input.requestKey());
        if(old.isPresent()){if(!old.get().getUser().getId().equals(userId)||!old.get().getDelivery().equals(input.delivery())||!old.get().getItems().stream().map(i->new OrderItem(i.getProduct().getId(),i.getQuantity())).toList().equals(input.items()))throw BusinessException.conflict("Mã yêu cầu đã dùng");return view(old.get());}
        if(input.items().stream().map(OrderItem::productId).distinct().count()!=input.items().size())throw BusinessException.badRequest("Mỗi sản phẩm chỉ có một dòng trong giỏ");
        ShopOrder o=new ShopOrder();o.setUser(u);o.setDelivery(input.delivery());o.setStatus("PENDING");o.setRequestKey(input.requestKey());o.setCreatedAt(Instant.now());o.setExpiresAt(Instant.now().plusSeconds(900));
        if(input.delivery().equals("ON_BOARD")) {
            if(input.bookingCode()==null||input.bookingToken()==null)throw BusinessException.badRequest("Chọn booking đã xác nhận để nhận hàng theo chuyến");
            Booking entity=deliveryBooking;
            if(entity.getStatus()!=BookingStatus.CONFIRMED||entity.getSegments().stream().anyMatch(s->!s.getFlight().getDepartureTime().isAfter(Instant.now())))throw BusinessException.conflict("Booking không còn đủ điều kiện nhận hàng");
            bookings.noPendingRefund(entity);o.setBooking(entity);
        }
        Map<Long,ShopProduct> locked=new HashMap<>();input.items().stream().map(OrderItem::productId).sorted().forEach(id->locked.put(id,products.findLocked(id).orElseThrow(()->BusinessException.notFound("Không tìm thấy sản phẩm"))));
        BigDecimal total=BigDecimal.ZERO;
        for(OrderItem item:input.items()) {
            ShopProduct p=locked.get(item.productId());if(!p.isActive()||p.getStock()<item.quantity())throw BusinessException.conflict("Sản phẩm hết hàng hoặc không mở bán: "+p.getName());
            p.setStock(p.getStock()-item.quantity());ShopOrderItem line=new ShopOrderItem();line.setOrder(o);line.setProduct(p);line.setName(p.getName());line.setQuantity(item.quantity());line.setPrice(p.getPrice());o.getItems().add(line);total=total.add(p.getPrice().multiply(BigDecimal.valueOf(item.quantity())));
        }
        o.setTotal(total);return view(orders.saveAndFlush(o));
    }
    @Transactional
    public OrderView pay(Long userId,Long id,Pay input) {
        ShopOrder o=owned(userId,id);if(vouchers.replayed("SHOP",id,input))return view(o);
        if(o.getStatus().equals("PAID")&&input.outcome().equals("SUCCESS"))return view(o);
        if(!List.of("PENDING","FAILED").contains(o.getStatus())||!o.getExpiresAt().isAfter(Instant.now()))throw BusinessException.conflict("Đơn đã hết hạn hoặc đã xử lý");
        if(o.getBooking()!=null && o.getBooking().getStatus()!=BookingStatus.CONFIRMED)throw BusinessException.conflict("Booking nhận hàng không còn được xác nhận");
        if(input.outcome().equals("SUCCESS")){o.setStatus("PAID");loyalty.award(userId,"SHOP:"+id,o.getTotal(),"Mua hàng nội bộ #"+id);}
        else if(input.outcome().equals("CANCELLED")){restock(o);o.setStatus("CANCELLED");}else o.setStatus("FAILED");
        vouchers.receipt("SHOP",id,input,o.getTotal());return view(o);
    }
    @Transactional
    public OrderView cancel(Long userId,Long id) {ShopOrder o=owned(userId,id);return cancel(o);}
    private OrderView cancel(ShopOrder o) {
        if(List.of("CANCELLED","EXPIRED").contains(o.getStatus()))return view(o);
        if(o.getStatus().equals("FULFILLED"))throw BusinessException.conflict("Đơn đã giao không thể hủy");
        if(o.getStatus().equals("PAID"))loyalty.reverse("SHOP:"+o.getId());restock(o);o.setStatus("CANCELLED");return view(o);
    }
    @Transactional
    public OrderView fulfill(Long id) {
        ShopOrder o=orders.findLocked(id).orElseThrow(()->BusinessException.notFound("Không tìm thấy đơn"));
        if(o.getStatus().equals("FULFILLED"))return view(o);
        if(!o.getStatus().equals("PAID"))throw BusinessException.conflict("Chỉ giao đơn đã thanh toán");
        if(o.getBooking()!=null && o.getBooking().getStatus()!=BookingStatus.CONFIRMED)throw BusinessException.conflict("Booking nhận hàng đã hủy");
        o.setStatus("FULFILLED");return view(o);
    }
    @Scheduled(fixedDelay=60000) @Transactional
    public void expire() {for(Long id:orders.expired(Instant.now())){ShopOrder o=orders.findLocked(id).orElseThrow();if(List.of("PENDING","FAILED").contains(o.getStatus())&&!o.getExpiresAt().isAfter(Instant.now())){restock(o);o.setStatus("EXPIRED");}}}
    private void restock(ShopOrder o) {o.getItems().stream().sorted(Comparator.comparing(i->i.getProduct().getId())).forEach(i->{ShopProduct p=products.findLocked(i.getProduct().getId()).orElseThrow();p.setStock(Math.addExact(p.getStock(),i.getQuantity()));});}
    private ShopOrder owned(Long userId,Long id) {ShopOrder o=orders.findLocked(id).orElseThrow(()->BusinessException.notFound("Không tìm thấy đơn"));if(!o.getUser().getId().equals(userId))throw AccountService.forbidden();return o;}
    public ProductView view(ShopProduct p) {return new ProductView(p.getId(),p.getName(),p.getDescription(),p.getPrice(),p.getStock(),p.isActive());}
    public OrderView view(ShopOrder o) {String status=List.of("PENDING","FAILED").contains(o.getStatus())&&!o.getExpiresAt().isAfter(Instant.now())?"EXPIRED":o.getStatus();return new OrderView(o.getId(),status,o.getDelivery(),o.getBooking()==null?null:o.getBooking().getCode(),o.getTotal(),o.getExpiresAt(),o.getItems().stream().map(i->new ItemView(i.getProduct().getId(),i.getName(),i.getQuantity(),i.getPrice())).toList());}
}
