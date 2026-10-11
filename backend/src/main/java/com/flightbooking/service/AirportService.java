package com.flightbooking.service;

import com.flightbooking.repository.AirportRepository;
import com.flightbooking.dto.response.Responses.AirportView;
import com.flightbooking.entity.Airport;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.text.Normalizer;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AirportService {
    private final AirportRepository repository;
    @Transactional(readOnly=true)
    public List<AirportView> search(String query) {
        String term=normalize(query);
        return repository.findAllByOrderByCityAsc().stream()
                .filter(a->normalize(a.getCode()+" "+a.getCity()+" "+a.getName()).contains(term))
                .map(AirportService::view).toList();
    }
    public static AirportView view(Airport a) { return new AirportView(a.getId(),a.getCode(),a.getCity(),a.getName(),a.getCountry()); }
    public static String normalize(String text) {
        return Normalizer.normalize(text==null?"":text.trim(),Normalizer.Form.NFD)
                .replaceAll("\\p{M}+","").replace('đ','d').replace('Đ','D').toLowerCase(Locale.ROOT);
    }
}
