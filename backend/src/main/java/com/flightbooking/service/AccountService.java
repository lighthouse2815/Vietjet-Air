package com.flightbooking.service;

import com.flightbooking.dto.request.AccountRequests.*;
import com.flightbooking.entity.*;
import com.flightbooking.exception.BusinessException;
import com.flightbooking.repository.*;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.time.*;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @RequiredArgsConstructor
public class AccountService {
    private final UserAccountRepository users;
    private final SavedTravelerRepository travelers;
    private final MailMessageRepository mail;
    private final PasswordEncoder passwords;
    private final RateLimitService limits;
    @Value("${app.frontend-origin}") private String origin;
    public record ProfileView(Long id, String email, String name, String phone, String role) {}
    public record TravelerView(Long id, String type, String title, String lastName, String firstName,
        LocalDate dateOfBirth, String nationality) {}
    @Transactional(readOnly=true)
    public ProfileView profile(Long id) { return view(user(id)); }
    @Transactional
    public ProfileView profile(Long id, Profile input) {
        UserAccount u = users.findLocked(id).orElseThrow(() -> BusinessException.notFound("Không tìm thấy tài khoản"));
        u.setName(input.name().trim()); u.setPhone(input.phone()); return view(u);
    }
    @Transactional
    public void password(Long id, Password input) {
        UserAccount u = users.findLocked(id).orElseThrow(() -> BusinessException.notFound("Không tìm thấy tài khoản"));
        if (!passwords.matches(input.currentPassword(), u.getPasswordHash()))
            throw BusinessException.badRequest("Mật khẩu hiện tại không đúng");
        setPassword(u, input.newPassword());
    }
    @Transactional
    public void startReset(ResetStart input, String ip) {
        limits.check("reset", ip);
        users.findByEmailIgnoreCase(input.email().trim()).ifPresent(found -> {
            UserAccount u = users.findLocked(found.getId()).orElseThrow();
            byte[] bytes = new byte[32]; new SecureRandom().nextBytes(bytes);
            String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
            u.setResetHash(hash(token)); u.setResetExpiresAt(Instant.now().plusSeconds(1800));
            MailMessage message = new MailMessage(); message.setRecipient(u.getEmail());
            message.setSubject("Khôi phục mật khẩu tài khoản demo");
            message.setBody(origin + "/auth?reset=" + token);
            message.setCreatedAt(Instant.now()); mail.save(message);
        });
    }
    @Transactional
    public void finishReset(ResetFinish input, String ip) {
        limits.check("reset-finish", ip);
        UserAccount u = users.findByResetHash(hash(input.token())).orElseThrow(
            () -> BusinessException.badRequest("Liên kết khôi phục không hợp lệ hoặc đã hết hạn"));
        if (u.getResetExpiresAt() == null || !u.getResetExpiresAt().isAfter(Instant.now()))
            throw BusinessException.badRequest("Liên kết khôi phục không hợp lệ hoặc đã hết hạn");
        setPassword(u, input.password());
    }
    private void setPassword(UserAccount u, String value) {
        if (value.getBytes(StandardCharsets.UTF_8).length > 72)
            throw BusinessException.badRequest("Mật khẩu tối đa 72 byte");
        u.setPasswordHash(passwords.encode(value)); u.setTokenVersion(u.getTokenVersion()+1);
        u.setResetHash(null); u.setResetExpiresAt(null);
    }
    private String hash(String token) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
            .digest(token.getBytes(StandardCharsets.UTF_8))); }
        catch (NoSuchAlgorithmException ex) { throw new IllegalStateException(ex); }
    }
    @Transactional(readOnly=true)
    public List<TravelerView> travelers(Long id) {
        return travelers.findByUserIdOrderByIdDesc(id).stream().map(this::view).toList();
    }
    @Transactional
    public TravelerView saveTraveler(Long userId, Long id, Traveler input) {
        SavedTraveler t = id == null ? new SavedTraveler() : ownedTraveler(userId,id);
        if (id == null && travelers.findByUserIdOrderByIdDesc(userId).size() >= 30)
            throw BusinessException.badRequest("Tối đa 30 hành khách thường dùng");
        t.setUser(user(userId)); t.setType(input.type()); t.setTitle(input.title());
        t.setLastName(input.lastName().trim()); t.setFirstName(input.firstName().trim());
        t.setDateOfBirth(input.dateOfBirth()); t.setNationality(input.nationality().trim());
        return view(travelers.save(t));
    }
    @Transactional
    public void deleteTraveler(Long userId, Long id) { travelers.delete(ownedTraveler(userId,id)); }
    private SavedTraveler ownedTraveler(Long userId, Long id) {
        SavedTraveler t = travelers.findById(id).orElseThrow(() -> BusinessException.notFound("Không tìm thấy hành khách"));
        if (!t.getUser().getId().equals(userId)) throw forbidden(); return t;
    }
    public UserAccount user(Long id) {
        return users.findById(id).orElseThrow(() -> BusinessException.notFound("Không tìm thấy tài khoản"));
    }
    public static BusinessException forbidden() {
        return new BusinessException(HttpStatus.FORBIDDEN,"FORBIDDEN","Không có quyền truy cập dữ liệu này");
    }
    private ProfileView view(UserAccount u) { return new ProfileView(u.getId(),u.getEmail(),u.getName(),u.getPhone(),u.getRole()); }
    private TravelerView view(SavedTraveler t) { return new TravelerView(t.getId(),t.getType(),t.getTitle(),t.getLastName(),t.getFirstName(),t.getDateOfBirth(),t.getNationality()); }
}
