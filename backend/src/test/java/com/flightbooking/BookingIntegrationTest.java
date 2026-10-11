package com.flightbooking;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.NullNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.flightbooking.dto.request.BookingRequests.*;
import com.flightbooking.dto.response.Responses.*;
import com.flightbooking.enums.*;
import com.flightbooking.exception.BusinessException;
import com.flightbooking.repository.*;
import com.flightbooking.service.*;
import jakarta.persistence.EntityManagerFactory;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import org.hibernate.SessionFactory;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.support.TransactionTemplate;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.*;

@SpringBootTest
@Testcontainers
@AutoConfigureMockMvc
class BookingIntegrationTest {
    @Container static PostgreSQLContainer<?> db = new PostgreSQLContainer<>("postgres:17-alpine");
    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry p) {
        p.add("spring.datasource.url", db::getJdbcUrl);
        p.add("spring.datasource.username", db::getUsername);
        p.add("spring.datasource.password", db::getPassword);
        p.add("app.jwt-secret", () -> "integration-test-only-secret-with-at-least-32-bytes");
        p.add("app.seed-days", () -> 3);
        p.add("spring.jpa.properties.hibernate.generate_statistics", () -> true);
        p.add("logging.level.org.hibernate.stat", () -> "OFF");
        p.add("logging.level.org.hibernate.engine.internal.StatisticalLoggingSessionEventListener",
            () -> "OFF");
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
    @Autowired AuthService auth;
    @Autowired ObjectMapper json;
    @Autowired EntityManagerFactory entityManagerFactory;
    @Autowired AdminService admin;
    @Autowired VoucherService vouchers;
    @Autowired LoyaltyService loyalty;
    @Autowired ShopService shop;
    @Autowired ShopProductRepository productRepo;
    @Autowired UserAccountRepository userRepo;
    @Autowired BookingChangeService changes;
    @Autowired AccountService accounts;
    @Autowired SupportService support;
    @Autowired SavedTravelerRepository travelerRepo;
    @Autowired MailMessageRepository mailRepo;
    private Long flightId;
    @BeforeEach
    void chooseFlight() {
        flightId =
            flights.search("SGN", "HAN", LocalDate.now(FlightService.ZONE).plusDays(1), 1).getFirst().id();
        Long back =
            flights.search("HAN", "SGN", LocalDate.now(FlightService.ZONE).plusDays(2), 1).getFirst().id();
        tx.executeWithoutResult(s -> {
            fareRepo.findByFlightIdAndFareClassCode(flightId, "ECO")
                .orElseThrow()
                .setPrice(new BigDecimal("490000"));
            fareRepo.findByFlightIdAndFareClassCode(flightId, "DELUXE")
                .orElseThrow()
                .setPrice(new BigDecimal("890000"));
            fareRepo.findByFlightIdAndFareClassCode(back, "ECO")
                .orElseThrow()
                .setPrice(new BigDecimal("590000"));
        });
    }
    private CreateBooking input(Long flight, String seat, String promo) {
        return new CreateBooking(List.of(new SegmentInput(flight, "ECO",
                                     seat == null ? List.of() : List.of(new SeatInput(0, seat)), List.of())),
            List.of(new PassengerInput(
                PassengerType.ADULT, "MR", "NGUYEN", "VAN DEMO", LocalDate.of(1990, 1, 1), "Việt Nam")),
            "demo@example.com", "0901234567", promo);
    }
    private BookingView create(String seat) {
        return bookings.create(input(flightId, seat, ""), null);
    }

    @Test
    void adminEndpointsRequireAdminAndCannotMoveBookedFlights() throws Exception {
        var a=auth.register(new com.flightbooking.dto.request.AuthRequests.Register("admin-"+UUID.randomUUID()+"@example.com","Original123","Account"),UUID.randomUUID().toString());
        http.perform(get("/api/admin/bookings")).andExpect(status().isUnauthorized());
        http.perform(get("/api/admin/bookings").header("Authorization","Bearer "+a.token())).andExpect(status().isForbidden());
        tx.executeWithoutResult(s->userRepo.findById(a.id()).orElseThrow().setRole("ADMIN"));
        var token=auth.login(new com.flightbooking.dto.request.AuthRequests.Login(a.email(),"Original123"),UUID.randomUUID().toString()).token();
        http.perform(get("/api/admin/catalog").header("Authorization","Bearer "+token)).andExpect(status().isOk()).andExpect(jsonPath("$.products").isArray());
        var b=create(null);var f=flights.get(flightId);
        var edit=new com.flightbooking.dto.request.AdminRequests.FlightEdit(f.flightNumber(),f.origin().code(),f.destination().code(),f.departureTime().plusSeconds(60),f.arrivalTime().plusSeconds(60),71,f.aircraft(),BigDecimal.valueOf(490000),BigDecimal.valueOf(890000),BigDecimal.valueOf(1890000),BigDecimal.valueOf(3390000));
        assertThatThrownBy(()->admin.flight(flightId,edit)).isInstanceOf(BusinessException.class);
        bookings.cancel(b.id(),b.accessToken().toString());
    }

    @Test
    void vouchersPayOnlyForRecipientAndRestoreBalanceOnRefund() {
        var a=auth.register(new com.flightbooking.dto.request.AuthRequests.Register("voucher-"+UUID.randomUUID()+"@example.com","Original123","Account"),UUID.randomUUID().toString());
        var other=auth.register(new com.flightbooking.dto.request.AuthRequests.Register("voucher-other-"+UUID.randomUUID()+"@example.com","Original123","Other"),UUID.randomUUID().toString());
        var v=vouchers.buy(a.id(),new com.flightbooking.dto.request.CommerceRequests.BuyVoucher(1000000L,a.email(),UUID.randomUUID()));
        vouchers.pay(a.id(),v.id(),new com.flightbooking.dto.request.ChangeRequests.Pay(UUID.randomUUID(),"SUCCESS"));
        var b=bookings.create(input(flightId,null,""),a.id());String token=b.accessToken().toString();UUID key=UUID.randomUUID();
        var request=new com.flightbooking.dto.request.CommerceRequests.VoucherPay(v.id(),b.id(),key);
        assertThatThrownBy(()->vouchers.payBooking(other.id(),request,token)).isInstanceOf(BusinessException.class);
        vouchers.payBooking(a.id(),request,token);vouchers.payBooking(a.id(),request,token);
        assertThat(vouchers.list(a.id()).getFirst().balance()).isEqualByComparingTo(BigDecimal.valueOf(1000000).subtract(b.price().totalAmount()));
        assertThat(loyalty.wallet(a.id()).points()).isZero();
        var r=changes.requestRefund(b.id(),token,new com.flightbooking.dto.request.ChangeRequests.Refund("Hoàn voucher"));
        changes.decide(r.id(),new com.flightbooking.dto.request.ChangeRequests.RefundDecision("APPROVE","Duyệt"));
        changes.decide(r.id(),new com.flightbooking.dto.request.ChangeRequests.RefundDecision("COMPLETE","Hoàn demo"));
        assertThat(vouchers.list(a.id()).getFirst().balance()).isEqualByComparingTo(BigDecimal.valueOf(1000000).subtract(r.fee()));
    }

    @Test
    void shopUsesServerPricesReservesStockAndReversesPointsOnCancel() {
        var a=auth.register(new com.flightbooking.dto.request.AuthRequests.Register("shop-"+UUID.randomUUID()+"@example.com","Original123","Account"),UUID.randomUUID().toString());
        var p=shop.products().getFirst();UUID requestKey=UUID.randomUUID();
        var input=new com.flightbooking.dto.request.CommerceRequests.CreateOrder(List.of(new com.flightbooking.dto.request.CommerceRequests.OrderItem(p.id(),2)),"PICKUP",null,null,requestKey);
        var o=shop.create(a.id(),input);assertThat(shop.create(a.id(),input).id()).isEqualTo(o.id());
        assertThat(o.total()).isEqualByComparingTo(p.price().multiply(BigDecimal.valueOf(2)));
        assertThat(shop.products().getFirst().stock()).isEqualTo(p.stock()-2);
        var pay=new com.flightbooking.dto.request.ChangeRequests.Pay(UUID.randomUUID(),"SUCCESS");shop.pay(a.id(),o.id(),pay);shop.pay(a.id(),o.id(),pay);
        assertThat(loyalty.wallet(a.id()).points()).isEqualTo(o.total().divideToIntegralValue(BigDecimal.valueOf(10000)).longValue());
        shop.cancel(a.id(),o.id());shop.cancel(a.id(),o.id());
        assertThat(shop.products().getFirst().stock()).isEqualTo(p.stock());assertThat(loyalty.wallet(a.id()).points()).isZero();
    }

    @Test
    void loyaltyRedemptionIsAtomicAndRejectsInsufficientPoints() {
        var a=auth.register(new com.flightbooking.dto.request.AuthRequests.Register("points-"+UUID.randomUUID()+"@example.com","Original123","Account"),UUID.randomUUID().toString());
        loyalty.award(a.id(),"TEST:"+a.id(),BigDecimal.valueOf(2000000),"Giao dịch kiểm thử");
        var input=new com.flightbooking.dto.request.CommerceRequests.Redeem(100,UUID.randomUUID());var v=vouchers.redeem(a.id(),input);
        assertThat(vouchers.redeem(a.id(),input).id()).isEqualTo(v.id());assertThat(loyalty.wallet(a.id()).points()).isEqualTo(100);
        assertThatThrownBy(()->vouchers.redeem(a.id(),new com.flightbooking.dto.request.CommerceRequests.Redeem(200,UUID.randomUUID()))).isInstanceOf(BusinessException.class);
        assertThat(loyalty.wallet(a.id()).points()).isEqualTo(100);
    }

    @Test
    void paidChangesAreAtomicKeepSeatsAndRejectStaleQuotes() {
        BookingView b=create("8B");String token=b.accessToken().toString();
        payments.pay(new DemoPayment(b.id(),UUID.randomUUID(),"SUCCESS"),token);
        var service=extrasRepo.findAll().stream().filter(e->e.getCode().equals("BAG20")).findFirst().orElseThrow();
        var target=new CreateBooking(List.of(new SegmentInput(flightId,"ECO",List.of(new SeatInput(0,"8B")),List.of(new ExtraInput(service.getId(),0)))),input(flightId,null,"").passengers(),"changed@example.com","0901234567","");
        var quote=changes.create(b.id(),token,target);var stale=changes.create(b.id(),token,target);
        assertThat(quote.amount()).isEqualByComparingTo("200000");
        changes.pay(b.id(),quote.id(),token,new com.flightbooking.dto.request.ChangeRequests.Pay(UUID.randomUUID(),"FAILED"));
        assertThat(bookings.get(b.code(),token).extras()).isEmpty();
        UUID key=UUID.randomUUID();changes.pay(b.id(),quote.id(),token,new com.flightbooking.dto.request.ChangeRequests.Pay(key,"SUCCESS"));
        changes.pay(b.id(),quote.id(),token,new com.flightbooking.dto.request.ChangeRequests.Pay(key,"SUCCESS"));
        var updated=bookings.get(b.code(),token);
        assertThat(updated.extras()).hasSize(1);assertThat(updated.contactEmail()).isEqualTo("changed@example.com");
        assertThat(updated.segments().getFirst().seats()).extracting(SeatView::seatNumber).containsExactly("8B");
        assertThatThrownBy(()->changes.pay(b.id(),stale.id(),token,new com.flightbooking.dto.request.ChangeRequests.Pay(UUID.randomUUID(),"SUCCESS"))).isInstanceOf(BusinessException.class);
        bookings.cancel(b.id(),token);
    }

    @Test
    void refundsBlockChangesAndCompleteOnlyAfterApproval() {
        BookingView b=create("8C");String token=b.accessToken().toString();payments.pay(new DemoPayment(b.id(),UUID.randomUUID(),"SUCCESS"),token);
        var r=changes.requestRefund(b.id(),token,new com.flightbooking.dto.request.ChangeRequests.Refund("Không thể đi"));
        assertThatThrownBy(()->changes.create(b.id(),token,input(flightId,"8C",""))).isInstanceOf(BusinessException.class);
        assertThatThrownBy(()->changes.decide(r.id(),new com.flightbooking.dto.request.ChangeRequests.RefundDecision("COMPLETE","Hoàn tiền"))).isInstanceOf(BusinessException.class);
        changes.decide(r.id(),new com.flightbooking.dto.request.ChangeRequests.RefundDecision("APPROVE","Chấp nhận"));
        var done=changes.decide(r.id(),new com.flightbooking.dto.request.ChangeRequests.RefundDecision("COMPLETE","Hoàn demo"));
        assertThat(done.status()).isEqualTo("COMPLETED");
        assertThat(changes.decide(r.id(),new com.flightbooking.dto.request.ChangeRequests.RefundDecision("COMPLETE","Lặp")).completedAt()).isEqualTo(done.completedAt());
        assertThat(bookings.get(b.code(),token).status()).isEqualTo("CANCELLED");
    }

    @Test
    void accountOwnershipPasswordRevocationAndResetAreEnforced() throws Exception {
        var a=auth.register(new com.flightbooking.dto.request.AuthRequests.Register("account-"+UUID.randomUUID()+"@example.com","Original123","Account"),UUID.randomUUID().toString());
        var b=auth.register(new com.flightbooking.dto.request.AuthRequests.Register("other-"+UUID.randomUUID()+"@example.com","Original123","Other"),UUID.randomUUID().toString());
        var traveler=new com.flightbooking.dto.request.AccountRequests.Traveler("ADULT","MR","NGUYEN","DEMO",LocalDate.of(1990,1,1),"Việt Nam");
        var saved=accounts.saveTraveler(a.id(),null,traveler);
        assertThatThrownBy(()->accounts.deleteTraveler(b.id(),saved.id())).isInstanceOf(BusinessException.class);
        assertThat(accounts.travelers(a.id())).hasSize(1);
        accounts.password(a.id(),new com.flightbooking.dto.request.AccountRequests.Password("Original123","Changed123"));
        http.perform(get("/api/auth/me").header("Authorization","Bearer "+a.token())).andExpect(status().isUnauthorized());
        accounts.startReset(new com.flightbooking.dto.request.AccountRequests.ResetStart(a.email()),UUID.randomUUID().toString());
        String token=mailRepo.findAll().stream().filter(m->m.getRecipient().equals(a.email())).findFirst().orElseThrow().getBody().split("reset=")[1];
        accounts.finishReset(new com.flightbooking.dto.request.AccountRequests.ResetFinish(token,"Recovered123"),UUID.randomUUID().toString());
        assertThatThrownBy(()->accounts.finishReset(new com.flightbooking.dto.request.AccountRequests.ResetFinish(token,"Again1234"),UUID.randomUUID().toString())).isInstanceOf(BusinessException.class);
        assertThat(auth.login(new com.flightbooking.dto.request.AuthRequests.Login(a.email(),"Recovered123"),UUID.randomUUID().toString()).id()).isEqualTo(a.id());
        http.perform(get("/api/account/profile")).andExpect(status().isUnauthorized());
    }

    @Test
    void supportThreadsArePrivateAndClosedThreadsRejectReplies() {
        var a=auth.register(new com.flightbooking.dto.request.AuthRequests.Register("ticket-"+UUID.randomUUID()+"@example.com","Original123","Account"),UUID.randomUUID().toString());
        var b=auth.register(new com.flightbooking.dto.request.AuthRequests.Register("ticket-other-"+UUID.randomUUID()+"@example.com","Original123","Other"),UUID.randomUUID().toString());
        var ticket=support.create(a.id(),new com.flightbooking.dto.request.AccountRequests.Ticket("Cần hỗ trợ","BOOKING","Nội dung mẫu"));
        assertThatThrownBy(()->support.reply(b.id(),ticket.id(),new com.flightbooking.dto.request.AccountRequests.Reply("Không được phép"),false)).isInstanceOf(BusinessException.class);
        assertThat(support.reply(a.id(),ticket.id(),new com.flightbooking.dto.request.AccountRequests.Reply("Bổ sung thông tin"),false).messages()).hasSize(2);
        support.close(a.id(),ticket.id(),false);
        assertThatThrownBy(()->support.reply(a.id(),ticket.id(),new com.flightbooking.dto.request.AccountRequests.Reply("Đã đóng"),false)).isInstanceOf(BusinessException.class);
    }

    @Test
    void calendarLoadsFaresAndAvailabilityInBatches() {
        LocalDate tomorrow = LocalDate.now(FlightService.ZONE).plusDays(1);
        var statistics = entityManagerFactory.unwrap(SessionFactory.class).getStatistics();
        statistics.clear();
        List<CalendarPrice> calendar = flights.calendar("SGN", "HAN", tomorrow);
        long queries = statistics.getPrepareStatementCount();

        assertThat(queries).as("Monthly calendar must not query once per flight").isLessThanOrEqualTo(7);
        BigDecimal minimum = flights.search("SGN", "HAN", tomorrow, 1)
                                 .stream()
                                 .map(f -> f.fares().getFirst().price())
                                 .min(BigDecimal::compareTo)
                                 .orElseThrow();
        assertThat(calendar).contains(new CalendarPrice(tomorrow, minimum));
    }

    @Test
    void nullElementsInBookingArraysReturnValidationErrors() throws Exception {
        for (String field : List.of("segments", "passengers", "seats", "extras")) {
            ObjectNode request = json.valueToTree(input(flightId, null, ""));
            ArrayNode array = field.equals("segments") || field.equals("passengers")
                ? (ArrayNode) request.get(field)
                : (ArrayNode) request.get("segments").get(0).get(field);
            if (array.isEmpty())
                array.addNull();
            else
                array.set(0, NullNode.getInstance());
            http.perform(
                    post("/api/bookings/quote").contentType("application/json").content(request.toString()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        }
    }

    @Test
    void accountBookingsRequireAuthenticationAndPaginateOnlyOwnedRecords() throws Exception {
        var first =
            auth.register(new com.flightbooking.dto.request.AuthRequests.Register(
                              "first-" + UUID.randomUUID() + "@example.com", "DemoPassword123", "First Demo"),
                "first-test");
        var second = auth.register(
            new com.flightbooking.dto.request.AuthRequests.Register(
                "second-" + UUID.randomUUID() + "@example.com", "DemoPassword123", "Second Demo"),
            "second-test");
        BookingView older = bookings.create(input(flightId, null, ""), first.id());
        BookingView newer = bookings.create(input(flightId, null, ""), first.id());
        try {
            http.perform(get("/api/auth/bookings"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
            http.perform(get("/api/auth/bookings?page=0&size=1")
                             .header("Authorization", "Bearer " + first.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].code").value(newer.code()));
            http.perform(get("/api/auth/bookings?page=1&size=1")
                             .header("Authorization", "Bearer " + first.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].code").value(older.code()));
            http.perform(get("/api/auth/bookings").header("Authorization", "Bearer " + second.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
            http.perform(get("/api/auth/bookings?page=-1").header("Authorization", "Bearer " + first.token()))
                .andExpect(status().isBadRequest());
        } finally {
            bookings.cancel(older.id(), older.accessToken().toString());
            bookings.cancel(newer.id(), newer.accessToken().toString());
        }
    }

    @Test
    void serverCalculatesPriceAndKeepsSnapshotAfterFareChanges() {
        BookingView b = bookings.create(input(flightId, "3A", "DEMO10"), null);
        assertThat(b.price().baseAmount()).isEqualByComparingTo("490000");
        assertThat(b.price().taxAmount()).isEqualByComparingTo("120000");
        assertThat(b.price().extrasAmount()).isEqualByComparingTo("60000");
        assertThat(b.price().discountAmount()).isEqualByComparingTo("49000");
        assertThat(b.price().totalAmount()).isEqualByComparingTo("621000");
        tx.executeWithoutResult(s -> {
            var fare = fareRepo.findByFlightIdAndFareClassCode(flightId, "ECO").orElseThrow();
            fare.setPrice(new BigDecimal("999000"));
        });
        try {
            assertThat(bookings.get(b.code(), b.accessToken().toString()).price().totalAmount())
                .isEqualByComparingTo("621000");
        } finally {
            tx.executeWithoutResult(s
                -> fareRepo.findByFlightIdAndFareClassCode(flightId, "ECO")
                    .orElseThrow()
                    .setPrice(new BigDecimal("490000")));
            bookings.cancel(b.id(), b.accessToken().toString());
        }
    }
    @Test
    void rejectsInvalidRoutesDatesAndReturnsEmptyForUnseededDate() {
        assertThatThrownBy(
            () -> flights.search("SGN", "SGN", LocalDate.now(FlightService.ZONE).plusDays(1), 1))
            .isInstanceOf(BusinessException.class);
        assertThatThrownBy(
            () -> flights.search("XXX", "HAN", LocalDate.now(FlightService.ZONE).plusDays(1), 1))
            .isInstanceOf(BusinessException.class);
        assertThatThrownBy(
            () -> flights.search("SGN", "HAN", LocalDate.now(FlightService.ZONE).minusDays(1), 1))
            .isInstanceOf(BusinessException.class);
        assertThat(flights.search("SGN", "HAN", LocalDate.now(FlightService.ZONE).plusDays(100), 1))
            .isEmpty();
    }
    @Test
    void failedPaymentCanRetryAndRepeatedSuccessCreatesOnePayment() {
        BookingView b = create(null);
        String token = b.accessToken().toString();
        UUID key = UUID.randomUUID();
        assertThat(payments.pay(new DemoPayment(b.id(), UUID.randomUUID(), "FAILED"), token).status())
            .isEqualTo("FAILED");
        assertThat(bookings.get(b.code(), token).status()).isEqualTo("PENDING");
        assertThat(bookings.get(b.code(), token).paymentStatus()).isEqualTo("FAILED");
        PaymentView first = payments.pay(new DemoPayment(b.id(), key, "SUCCESS"), token);
        assertThat(payments.pay(new DemoPayment(b.id(), key, "SUCCESS"), token).id()).isEqualTo(first.id());
        assertThat(payments.pay(new DemoPayment(b.id(), UUID.randomUUID(), "SUCCESS"), token).id())
            .isEqualTo(first.id());
        assertThat(bookings.get(b.code(), token).status()).isEqualTo("CONFIRMED");
        assertThat(bookings.get(b.code(), token).paymentStatus()).isEqualTo("SUCCESS");
        assertThatThrownBy(() -> payments.pay(new DemoPayment(b.id(), key, "FAILED"), token))
            .isInstanceOf(BusinessException.class);
        bookings.cancel(b.id(), token);
    }
    @Test
    void lookupRequiresMatchingNameAndAccessToken() {
        BookingView b = create(null);
        String token = b.accessToken().toString();
        assertThat(bookings.lookup(new Lookup(b.code(), "Nguyễn", "Văn Demo")).id()).isEqualTo(b.id());
        assertThatThrownBy(() -> bookings.lookup(new Lookup(b.code(), "WRONG", "NAME")))
            .isInstanceOf(BusinessException.class);
        assertThatThrownBy(() -> bookings.get(b.code(), null)).isInstanceOf(BusinessException.class);
        assertThatThrownBy(() -> bookings.cancel(b.id(), UUID.randomUUID().toString()))
            .isInstanceOf(BusinessException.class);
        bookings.cancel(b.id(), token);
    }
    @Test
    void pendingBookingCannotCheckInAndConfirmedCheckInIsIdempotent() {
        BookingView b = create("4A");
        String token = b.accessToken().toString();
        var request = new CheckInInput(b.id(), flightId, 0, "4A", true);
        assertThatThrownBy(() -> checkIn.complete(request, token)).isInstanceOf(BusinessException.class);
        payments.pay(new DemoPayment(b.id(), UUID.randomUUID(), "SUCCESS"), token);
        BookingView checked = checkIn.complete(request, token);
        assertThat(checked.boardingPasses()).hasSize(1);
        assertThat(checkIn.complete(request, token).boardingPasses()).hasSize(1);
        assertThatThrownBy(() -> checkIn.complete(new CheckInInput(b.id(), flightId, 0, "4B", true), token))
            .isInstanceOf(BusinessException.class);
        assertThatThrownBy(() -> bookings.cancel(b.id(), token)).isInstanceOf(BusinessException.class);
    }
    @Test
    void expiredHoldCannotBePaidAndReleasesSeat() {
        BookingView b = create("5A");
        String token = b.accessToken().toString();
        tx.executeWithoutResult(
            s -> bookingRepo.findById(b.id()).orElseThrow().setExpiresAt(Instant.now().minusSeconds(30)));
        assertThatThrownBy(() -> payments.pay(new DemoPayment(b.id(), UUID.randomUUID(), "SUCCESS"), token))
            .isInstanceOf(BusinessException.class);
        expiry.expire();
        assertThat(bookings.get(b.code(), token).status()).isEqualTo("EXPIRED");
        BookingView next = create("5A");
        bookings.cancel(next.id(), next.accessToken().toString());
    }
    @Test
    void simultaneousBookingsCannotReserveSameSeat() throws Exception {
        try (ExecutorService pool = Executors.newFixedThreadPool(2)) {
            CountDownLatch start = new CountDownLatch(1);
            List<Future<BookingView>> futures = new ArrayList<>();
            for (int i = 0; i < 2; i++)
                futures.add(pool.submit(() -> {
                    start.await();
                    try {
                        return create("6A");
                    } catch (BusinessException e) {
                        assertThat(e.getStatus().value()).isEqualTo(409);
                        return null;
                    }
                }));
            start.countDown();
            List<BookingView> successes = new ArrayList<>();
            for (var f : futures) {
                BookingView b = f.get(20, TimeUnit.SECONDS);
                if (b != null)
                    successes.add(b);
            }
            assertThat(successes).hasSize(1);
            var b = successes.getFirst();
            bookings.cancel(b.id(), b.accessToken().toString());
        }
    }
    @Test
    void lastCapacityCannotBeOverbookedConcurrently() throws Exception {
        Long id =
            flights.search("SGN", "HAN", LocalDate.now(FlightService.ZONE).plusDays(2), 1).getLast().id();
        tx.executeWithoutResult(s -> flightRepo.findById(id).orElseThrow().setCapacity(1));
        try (ExecutorService pool = Executors.newFixedThreadPool(2)) {
            CountDownLatch start = new CountDownLatch(1);
            List<Future<BookingView>> futures = new ArrayList<>();
            for (int i = 0; i < 2; i++)
                futures.add(pool.submit(() -> {
                    start.await();
                    try {
                        return bookings.create(input(id, null, ""), null);
                    } catch (BusinessException e) {
                        return null;
                    }
                }));
            start.countDown();
            List<BookingView> successes = new ArrayList<>();
            for (var f : futures) {
                BookingView b = f.get(20, TimeUnit.SECONDS);
                if (b != null)
                    successes.add(b);
            }
            assertThat(successes).hasSize(1);
            assertThat(flights.get(id).remainingSeats()).isZero();
            var b = successes.getFirst();
            bookings.cancel(b.id(), b.accessToken().toString());
        } finally {
            tx.executeWithoutResult(s -> flightRepo.findById(id).orElseThrow().setCapacity(71));
        }
    }
    @Test
    void roundTripAndAncillariesArePersistedAndPriced() {
        Long back =
            flights.search("HAN", "SGN", LocalDate.now(FlightService.ZONE).plusDays(2), 1).getFirst().id();
        Long baggage = extrasRepo.findAllByOrderByIdAsc().getFirst().getId();
        CreateBooking base = input(flightId, null, "");
        CreateBooking request =
            new CreateBooking(List.of(new SegmentInput(flightId, "DELUXE", List.of(new SeatInput(0, "7A")),
                                          List.of(new ExtraInput(baggage, 0))),
                                  new SegmentInput(back, "ECO", List.of(), List.of())),
                base.passengers(), base.contactEmail(), base.contactPhone(), "");
        BookingView b = bookings.create(request, null);
        assertThat(b.segments()).hasSize(2);
        assertThat(b.extras()).hasSize(1);
        assertThat(b.price().baseAmount()).isEqualByComparingTo("1480000");
        assertThat(b.price().taxAmount()).isEqualByComparingTo("240000");
        assertThat(b.price().extrasAmount()).isEqualByComparingTo("200000");
        assertThat(b.price().totalAmount()).isEqualByComparingTo("1920000");
        bookings.cancel(b.id(), b.accessToken().toString());
    }
    @Test
    void lookupLimiterRejectsSixteenthAttempt() {
        for (int i = 0; i < 15; i++) limits.check("test", "integration");
        assertThatThrownBy(() -> limits.check("test", "integration")).isInstanceOf(BusinessException.class);
    }
    @Test
    void missingSearchParametersReturnClientError() throws Exception {
        http.perform(get("/api/flights/search"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("INVALID_REQUEST"));
    }
    @Test
    void malformedBookingAndCheckInRequestsAreValidated() throws Exception {
        http.perform(post("/api/bookings").contentType("application/json").content("{}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        http.perform(post("/api/check-in/complete")
                         .contentType("application/json")
                         .content("{\"bookingId\":1,\"flightId\":1,\"passengerIndex\":0,\"seatNumber\":"
                             + "\"3A\",\"acceptedConditions\":false}"))
            .andExpect(status().isBadRequest());
    }
    @Test
    void childInfantAndPromotionValidationCannotBeBypassed() {
        CreateBooking base = input(flightId, null, "");
        CreateBooking invalid = new CreateBooking(base.segments(),
            List.of(new PassengerInput(PassengerType.INFANT, "MSTR", "TEST", "BABY",
                LocalDate.now(FlightService.ZONE).minusMonths(6), "Việt Nam")),
            base.contactEmail(), base.contactPhone(), "");
        assertThatThrownBy(() -> bookings.create(invalid, null)).isInstanceOf(BusinessException.class);
        assertThatThrownBy(() -> bookings.create(input(flightId, null, "FAKE_PROMO"), null))
            .isInstanceOf(BusinessException.class);
        CreateBooking ageWrong = new CreateBooking(base.segments(),
            List.of(new PassengerInput(PassengerType.ADULT, "MR", "TEST", "ADULT",
                LocalDate.now(FlightService.ZONE).minusYears(5), "Việt Nam")),
            base.contactEmail(), base.contactPhone(), "");
        assertThatThrownBy(() -> bookings.create(ageWrong, null)).isInstanceOf(BusinessException.class);
    }
    @Test
    void cancelledPaymentReleasesCapacityAndSeats() {
        int before = flights.get(flightId).remainingSeats();
        BookingView b = create("9A");
        assertThat(flights.get(flightId).remainingSeats()).isEqualTo(before - 1);
        payments.pay(new DemoPayment(b.id(), UUID.randomUUID(), "CANCELLED"), b.accessToken().toString());
        assertThat(bookings.get(b.code(), b.accessToken().toString()).status()).isEqualTo("CANCELLED");
        assertThat(flights.get(flightId).remainingSeats()).isEqualTo(before);
        assertThat(flights.seatViews(flightId)
                       .stream()
                       .filter(s -> s.seatNumber().equals("9A"))
                       .findFirst()
                       .orElseThrow()
                       .status())
            .isEqualTo("AVAILABLE");
    }
    @Test
    void confirmedBookingOutsideWindowCannotCheckIn() {
        Long id =
            flights.search("SGN", "DAD", LocalDate.now(FlightService.ZONE).plusDays(1), 1).getFirst().id();
        BookingView b = bookings.create(input(id, null, ""), null);
        String token = b.accessToken().toString();
        payments.pay(new DemoPayment(b.id(), UUID.randomUUID(), "SUCCESS"), token);
        Instant original = tx.execute(s -> flightRepo.findById(id).orElseThrow().getDepartureTime());
        tx.executeWithoutResult(
            s -> flightRepo.findById(id).orElseThrow().setDepartureTime(Instant.now().plusSeconds(30)));
        try {
            assertThatThrownBy(() -> checkIn.complete(new CheckInInput(b.id(), id, 0, "3A", true), token))
                .isInstanceOf(BusinessException.class);
        } finally {
            tx.executeWithoutResult(s -> flightRepo.findById(id).orElseThrow().setDepartureTime(original));
            bookings.cancel(b.id(), token);
        }
    }
}
