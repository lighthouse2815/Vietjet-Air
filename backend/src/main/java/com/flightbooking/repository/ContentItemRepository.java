package com.flightbooking.repository;

import com.flightbooking.entity.ContentItem;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.*;
import org.springframework.data.jpa.repository.*;

public interface ContentItemRepository extends JpaRepository<ContentItem, Long> {
    List<ContentItem> findAllByOrderBySortOrderAscIdAsc();
    List<ContentItem> findByCategoryOrderBySortOrderAsc(String category);
}
