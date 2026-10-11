package com.flightbooking.service;

import com.flightbooking.exception.BusinessException;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class RateLimitService {
    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();
    private static class Window {
        long endsAt;
        int attempts;
        Window(long now) {
            endsAt = now + 60000;
        }
    }
    public void check(String category, String ip) {
        long now = System.currentTimeMillis();
        if (windows.size() > 10000)
            cleanup();
        if (windows.size() > 10000)
            throw limited();
        Window window = windows.computeIfAbsent(category + ":" + ip, k -> new Window(now));
        synchronized (window) {
            if (window.endsAt <= now) {
                window.endsAt = now + 60000;
                window.attempts = 0;
            }
            if (++window.attempts > 15)
                throw limited();
        }
    }
    @Scheduled(fixedDelay = 60000)
    public void cleanup() {
        long now = System.currentTimeMillis();
        windows.entrySet().removeIf(e -> e.getValue().endsAt <= now);
    }
    private BusinessException limited() {
        return new BusinessException(HttpStatus.TOO_MANY_REQUESTS, "RATE_LIMITED",
            "Bạn tra cứu quá nhiều lần. Vui lòng chờ một phút rồi thử lại.");
    }
}
