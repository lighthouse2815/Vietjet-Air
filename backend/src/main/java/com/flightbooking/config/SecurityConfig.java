package com.flightbooking.config;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.time.Instant;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.flightbooking.exception.GlobalExceptionHandler.ApiError;
import javax.crypto.spec.SecretKeySpec;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.web.cors.*;

@Configuration
public class SecurityConfig {
    @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
    @Bean JwtEncoder jwtEncoder(@Value("${app.jwt-secret}") String secret) {
        requireSecret(secret);
        return new NimbusJwtEncoder(new ImmutableSecret<>(secret.getBytes(StandardCharsets.UTF_8)));
    }
    @Bean JwtDecoder jwtDecoder(@Value("${app.jwt-secret}") String secret) {
        requireSecret(secret);
        return NimbusJwtDecoder.withSecretKey(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8),"HmacSHA256"))
                .macAlgorithm(MacAlgorithm.HS256).build();
    }
    private void requireSecret(String secret) {
        if (secret.getBytes(StandardCharsets.UTF_8).length<32) throw new IllegalStateException("JWT_SECRET must contain at least 32 bytes");
    }
    @Bean SecurityFilterChain filterChain(HttpSecurity http,ObjectMapper json) throws Exception {
        AuthenticationEntryPoint unauthorized=(request,response,error)->{
            response.setStatus(401);response.setContentType("application/json;charset=UTF-8");response.setHeader("WWW-Authenticate","Bearer");
            json.writeValue(response.getOutputStream(),new ApiError("UNAUTHORIZED","Cần đăng nhập tài khoản demo hoặc token đã hết hạn",Instant.now()));
        };
        AccessDeniedHandler denied=(request,response,error)->{
            response.setStatus(403);response.setContentType("application/json;charset=UTF-8");
            json.writeValue(response.getOutputStream(),new ApiError("FORBIDDEN","Không có quyền truy cập chức năng này",Instant.now()));
        };
        return http.cors(cors->{})
                .csrf(csrf->csrf.disable())
                .sessionManagement(s->s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(a->a.requestMatchers(HttpMethod.OPTIONS,"/**").permitAll()
                        .requestMatchers("/api/auth/me","/api/auth/bookings").authenticated()
                        .requestMatchers("/api/**").permitAll().anyRequest().denyAll())
                .exceptionHandling(e->e.authenticationEntryPoint(unauthorized).accessDeniedHandler(denied))
                .oauth2ResourceServer(o->o.jwt(j->{}).authenticationEntryPoint(unauthorized).accessDeniedHandler(denied))
                .build();
    }
    @Bean CorsConfigurationSource corsConfigurationSource(@Value("${app.frontend-origin}") String origin) {
        CorsConfiguration c=new CorsConfiguration();
        c.setAllowedOrigins(List.of(origin,"http://127.0.0.1:5173"));
        c.setAllowedMethods(List.of("GET","POST","OPTIONS"));
        c.setAllowedHeaders(List.of("Content-Type","Authorization","X-Booking-Token"));
        UrlBasedCorsConfigurationSource source=new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**",c);
        return source;
    }
}
