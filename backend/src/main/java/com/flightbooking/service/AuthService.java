package com.flightbooking.service;

import com.flightbooking.dto.request.AuthRequests.*;
import com.flightbooking.dto.response.Responses.*;
import com.flightbooking.entity.UserAccount;
import com.flightbooking.exception.BusinessException;
import com.flightbooking.repository.*;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserAccountRepository users;
    private final BookingRepository bookings;
    private final BookingService bookingService;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;
    private final RateLimitService limits;
    @Transactional
    public AuthView register(Register input, String ip) {
        limits.check("auth", ip);
        validatePassword(input.password());
        if (users.existsByEmailIgnoreCase(input.email()))
            throw BusinessException.conflict("Email đã được dùng cho tài khoản demo");
        UserAccount u = new UserAccount();
        u.setEmail(input.email().trim().toLowerCase(Locale.ROOT));
        u.setName(input.name().trim());
        u.setPasswordHash(passwordEncoder.encode(input.password()));
        u.setRole("USER");
        users.save(u);
        return issue(u);
    }
    @Transactional(readOnly = true)
    public AuthView login(Login input, String ip) {
        limits.check("auth", ip);
        validatePassword(input.password());
        UserAccount u = users.findByEmailIgnoreCase(input.email().trim()).orElseThrow(this::invalid);
        if (!passwordEncoder.matches(input.password(), u.getPasswordHash()))
            throw invalid();
        return issue(u);
    }
    private void validatePassword(String password) {
        if (password.getBytes(StandardCharsets.UTF_8).length > 72)
            throw BusinessException.badRequest("Mật khẩu tối đa 72 byte");
    }
    private BusinessException invalid() {
        return new BusinessException(
            HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Email hoặc mật khẩu tài khoản demo không đúng");
    }
    private AuthView issue(UserAccount u) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                                  .issuer("flight-demo")
                                  .subject(u.getId().toString())
                                  .issuedAt(now)
                                  .expiresAt(now.plusSeconds(7200))
                                  .claim("role", u.getRole())
                                  .build();
        String token =
            jwtEncoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims))
                .getTokenValue();
        return new AuthView(token, u.getId(), u.getEmail(), u.getName(), u.getRole());
    }
    @Transactional(readOnly = true)
    public AuthView me(Long id) {
        UserAccount u = users.findById(id).orElseThrow(this::invalid);
        return new AuthView(null, u.getId(), u.getEmail(), u.getName(), u.getRole());
    }
    @Transactional(readOnly = true)
    public List<BookingView> bookings(Long id, int page, int size) {
        if (page < 0 || size < 1 || size > 50)
            throw BusinessException.badRequest("Trang không âm; kích thước trang từ 1 đến 50");
        return bookings
            .findByUserId(id, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt", "id")))
            .stream()
            .map(bookingService::view)
            .toList();
    }
}
