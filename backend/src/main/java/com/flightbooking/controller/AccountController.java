package com.flightbooking.controller;
import com.flightbooking.dto.request.AccountRequests.*;
import com.flightbooking.service.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController @RequiredArgsConstructor @RequestMapping("/api")
public class AccountController {
    private final AccountService accounts;
    private final SupportService support;
    @GetMapping("/account/profile") public AccountService.ProfileView profile(@AuthenticationPrincipal Jwt jwt) { return accounts.profile(id(jwt)); }
    @PostMapping("/account/profile") public AccountService.ProfileView profile(@AuthenticationPrincipal Jwt jwt,@Valid @RequestBody Profile input) { return accounts.profile(id(jwt),input); }
    @PostMapping("/account/password") public Map<String,String> password(@AuthenticationPrincipal Jwt jwt,@Valid @RequestBody Password input) { accounts.password(id(jwt),input);return Map.of("message","Mật khẩu đã đổi. Vui lòng đăng nhập lại."); }
    @PostMapping("/auth/password-reset") public Map<String,String> reset(@Valid @RequestBody ResetStart input,HttpServletRequest request) { accounts.startReset(input,request.getRemoteAddr());return Map.of("message","Nếu email tồn tại, hướng dẫn khôi phục sẽ được gửi. Trong demo, quản trị viên đọc hộp thư local."); }
    @PostMapping("/auth/password-reset/complete") public Map<String,String> reset(@Valid @RequestBody ResetFinish input,HttpServletRequest request) { accounts.finishReset(input,request.getRemoteAddr());return Map.of("message","Đã khôi phục mật khẩu. Vui lòng đăng nhập."); }
    @GetMapping("/account/travelers") public List<AccountService.TravelerView> travelers(@AuthenticationPrincipal Jwt jwt) { return accounts.travelers(id(jwt)); }
    @PostMapping("/account/travelers") public AccountService.TravelerView traveler(@AuthenticationPrincipal Jwt jwt,@Valid @RequestBody Traveler input) { return accounts.saveTraveler(id(jwt),null,input); }
    @PostMapping("/account/travelers/{id}") public AccountService.TravelerView traveler(@AuthenticationPrincipal Jwt jwt,@PathVariable Long id,@Valid @RequestBody Traveler input) { return accounts.saveTraveler(id(jwt),id,input); }
    @PostMapping("/account/travelers/{id}/delete") public void delete(@AuthenticationPrincipal Jwt jwt,@PathVariable Long id) { accounts.deleteTraveler(id(jwt),id); }
    @GetMapping("/support/tickets") public List<SupportService.TicketView> tickets(@AuthenticationPrincipal Jwt jwt) { return support.list(id(jwt)); }
    @PostMapping("/support/tickets") public SupportService.TicketView ticket(@AuthenticationPrincipal Jwt jwt,@Valid @RequestBody Ticket input) { return support.create(id(jwt),input); }
    @PostMapping("/support/tickets/{id}/reply") public SupportService.TicketView reply(@AuthenticationPrincipal Jwt jwt,@PathVariable Long id,@Valid @RequestBody Reply input) { return support.reply(id(jwt),id,input,false); }
    @PostMapping("/support/tickets/{id}/close") public SupportService.TicketView close(@AuthenticationPrincipal Jwt jwt,@PathVariable Long id) { return support.close(id(jwt),id,false); }
    private Long id(Jwt jwt) { return Long.valueOf(jwt.getSubject()); }
}
