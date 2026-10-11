package com.flightbooking.controller;
import com.flightbooking.dto.request.AdminRequests.*;
import com.flightbooking.dto.request.AccountRequests.Reply;
import com.flightbooking.dto.request.ChangeRequests.RefundDecision;
import com.flightbooking.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
@RestController @RequiredArgsConstructor @RequestMapping("/api/admin")
public class AdminController {
    private final AdminService admin;private final BookingChangeService changes;private final SupportService support;private final ShopService shop;
    @GetMapping("/{resource}") public Object list(@PathVariable String resource,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size){return admin.list(resource,page,size);}
    @PostMapping("/products") public Object product(@Valid @RequestBody Product input){return admin.product(null,input);}
    @PostMapping("/products/{id}") public Object product(@PathVariable Long id,@Valid @RequestBody Product input){return admin.product(id,input);}
    @PostMapping("/ancillaries") public Object ancillary(@Valid @RequestBody Ancillary input){return admin.ancillary(null,input);}
    @PostMapping("/ancillaries/{id}") public Object ancillary(@PathVariable Long id,@Valid @RequestBody Ancillary input){return admin.ancillary(id,input);}
    @PostMapping("/promotions") public Object promotion(@Valid @RequestBody Promotion input){return admin.promotion(null,input);}
    @PostMapping("/promotions/{id}") public Object promotion(@PathVariable Long id,@Valid @RequestBody Promotion input){return admin.promotion(id,input);}
    @PostMapping("/content") public Object content(@Valid @RequestBody Content input){return admin.content(null,input);}
    @PostMapping("/content/{id}") public Object content(@PathVariable Long id,@Valid @RequestBody Content input){return admin.content(id,input);}
    @PostMapping("/flights") public Object flight(@Valid @RequestBody FlightEdit input){return admin.flight(null,input);}
    @PostMapping("/flights/{id}") public Object flight(@PathVariable Long id,@Valid @RequestBody FlightEdit input){return admin.flight(id,input);}
    @PostMapping("/refunds/{id}") public Object refund(@PathVariable Long id,@Valid @RequestBody RefundDecision input){return changes.decide(id,input);}
    @PostMapping("/tickets/{id}/reply") public Object reply(@AuthenticationPrincipal Jwt jwt,@PathVariable Long id,@Valid @RequestBody Reply input){return support.reply(Long.valueOf(jwt.getSubject()),id,input,true);}
    @PostMapping("/tickets/{id}/close") public Object close(@AuthenticationPrincipal Jwt jwt,@PathVariable Long id){return support.close(Long.valueOf(jwt.getSubject()),id,true);}
    @PostMapping("/orders/{id}/fulfill") public Object fulfill(@PathVariable Long id){return shop.fulfill(id);}
}
