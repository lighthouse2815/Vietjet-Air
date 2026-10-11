package com.flightbooking.exception;

import jakarta.validation.ConstraintViolationException;
import java.time.Instant;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class GlobalExceptionHandler {
    public record ApiError(String code, String message, Instant timestamp) {}

    @ExceptionHandler(BusinessException.class)
    ResponseEntity<ApiError> business(BusinessException e) {
        return error(e.getStatus(), e.getCode(), e.getMessage());
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiError> validation(MethodArgumentNotValidException e) {
        String message = e.getBindingResult()
                             .getFieldErrors()
                             .stream()
                             .map(f -> f.getField() + ": " + f.getDefaultMessage())
                             .findFirst()
                             .orElse("Dữ liệu không hợp lệ");
        return error(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", message);
    }
    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class,
        ConstraintViolationException.class, MissingServletRequestParameterException.class})
    ResponseEntity<ApiError> malformed(Exception e) {
        return error(HttpStatus.BAD_REQUEST, "INVALID_REQUEST", "Dữ liệu hoặc định dạng không hợp lệ");
    }
    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<ApiError> integrity(DataIntegrityViolationException e) {
        return error(HttpStatus.CONFLICT, "DATA_CONFLICT",
            "Dữ liệu bị trùng hoặc đã được người khác sử dụng. Vui lòng thử lại.");
    }
    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiError> unexpected(Exception e) {
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR",
            "Không thể xử lý yêu cầu. Vui lòng thử lại sau.");
    }
    private ResponseEntity<ApiError> error(HttpStatus status, String code, String message) {
        return ResponseEntity.status(status).body(new ApiError(code, message, Instant.now()));
    }
}
