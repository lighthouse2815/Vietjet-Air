package com.flightbooking.service;
import com.flightbooking.dto.request.AccountRequests.*;
import com.flightbooking.entity.*;
import com.flightbooking.exception.BusinessException;
import com.flightbooking.repository.*;
import java.time.Instant;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @RequiredArgsConstructor
public class SupportService {
    private final SupportTicketRepository tickets;
    private final SupportMessageRepository messages;
    private final AccountService accounts;
    public record MessageView(Long id,String body,boolean staff,Instant createdAt) {}
    public record TicketView(Long id,String subject,String category,String status,Instant createdAt,List<MessageView> messages) {}
    @Transactional(readOnly=true)
    public List<TicketView> list(Long userId) {
        return tickets.findByUserIdOrderByIdDesc(userId,PageRequest.of(0,100)).stream().map(this::view).toList();
    }
    @Transactional
    public TicketView create(Long userId,Ticket input) {
        SupportTicket t=new SupportTicket(); t.setUser(accounts.user(userId)); t.setSubject(input.subject().trim());
        t.setCategory(input.category());t.setStatus("OPEN");t.setCreatedAt(Instant.now()); tickets.save(t);
        message(t,input.body(),false);return view(t);
    }
    @Transactional
    public TicketView reply(Long userId,Long id,Reply input,boolean staff) {
        SupportTicket t=owned(userId,id,staff);
        if(t.getStatus().equals("CLOSED")) throw BusinessException.conflict("Yêu cầu đã đóng");
        message(t,input.body(),staff);t.setStatus(staff?"ANSWERED":"OPEN");return view(t);
    }
    @Transactional
    public TicketView close(Long userId,Long id,boolean staff) {
        SupportTicket t=owned(userId,id,staff);t.setStatus("CLOSED");return view(t);
    }
    private SupportTicket owned(Long userId,Long id,boolean staff) {
        SupportTicket t=tickets.findById(id).orElseThrow(()->BusinessException.notFound("Không tìm thấy yêu cầu"));
        if(!t.getUser().getId().equals(userId) && !staff) throw AccountService.forbidden();
        if(staff && !accounts.user(userId).getRole().equals("ADMIN")) throw AccountService.forbidden();
        return t;
    }
    private void message(SupportTicket t,String body,boolean staff) {
        SupportMessage m=new SupportMessage();m.setTicket(t);m.setBody(body.trim());m.setStaff(staff);
        m.setCreatedAt(Instant.now());messages.save(m);
    }
    public TicketView view(SupportTicket t) {
        return new TicketView(t.getId(),t.getSubject(),t.getCategory(),t.getStatus(),t.getCreatedAt(),
            messages.findByTicketIdOrderByIdAsc(t.getId()).stream().map(m->new MessageView(m.getId(),m.getBody(),m.isStaff(),m.getCreatedAt())).toList());
    }
}
