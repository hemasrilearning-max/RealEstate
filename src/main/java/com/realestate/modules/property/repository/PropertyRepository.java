package com.realestate.modules.property.repository;

import com.realestate.modules.property.entity.Property;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface PropertyRepository
        extends JpaRepository<Property, Long>,
                JpaSpecificationExecutor<Property> {

    // Properties belonging to a seller
    List<Property> findBySeller_Id(Long sellerId);

    // Properties managed/listed by a broker
    List<Property> findByBroker_Id(Long brokerId);

    // Paginated broker properties
    Page<Property> findByBroker_Id(
            Long brokerId,
            Pageable pageable
    );

    // Paginated seller properties
    Page<Property> findBySeller_Id(
            Long sellerId,
            Pageable pageable
    );

    // Count broker properties
    long countByBroker_Id(Long brokerId);

    // Count seller properties
    long countBySeller_Id(Long sellerId);

    // Broker properties ordered by newest first
    List<Property> findByBroker_IdOrderByCreatedAtDesc(
            Long brokerId,
            Pageable pageable
    );
    List<Property> findByCreatedById(Long createdById);
}