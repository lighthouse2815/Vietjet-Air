package com.flightbooking.config;
import com.flightbooking.entity.UserAccount;
import com.flightbooking.repository.UserAccountRepository;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;
@Component @RequiredArgsConstructor
public class AdminBootstrap implements ApplicationRunner {
    private final UserAccountRepository users;private final PasswordEncoder passwords;private final TransactionTemplate transaction;
    @Value("${app.admin-email:}") private String email;
    @Value("${app.admin-password:}") private String password;
    public void run(ApplicationArguments args) {
        if(email.isBlank()&&password.isBlank())return;
        if(!email.matches("[^\\s@]+@[^\\s@]+\\.[^\\s@]+")||password.length()<8||password.getBytes(StandardCharsets.UTF_8).length>72)
            throw new IllegalStateException("Cấu hình ADMIN_EMAIL/ADMIN_PASSWORD không hợp lệ");
        transaction.executeWithoutResult(tx->{var existing=users.findByEmailIgnoreCase(email.trim());
            if(existing.isPresent()){if(!existing.get().getRole().equals("ADMIN"))throw new IllegalStateException("ADMIN_EMAIL đã thuộc tài khoản USER; không tự nâng quyền");return;}
            UserAccount u=new UserAccount();u.setEmail(email.trim().toLowerCase(Locale.ROOT));u.setName("Quản trị viên demo");u.setPasswordHash(passwords.encode(password));u.setRole("ADMIN");users.save(u);
        });
    }
}
