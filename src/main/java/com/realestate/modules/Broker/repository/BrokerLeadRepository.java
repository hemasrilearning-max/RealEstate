package com.realestate.modules.Broker.repository;

import com.realestate.modules.Broker.entity.BrokerLead;
import com.realestate.modules.Broker.entity.BrokerLead.LeadStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BrokerLeadRepository extends JpaRepository<BrokerLead, Long> {

    List<BrokerLead> findByBrokerId(Long brokerId);

    Page<BrokerLead> findByBrokerId(
            Long brokerId,
            Pageable pageable
    );

    List<BrokerLead> findByBrokerIdAndIsActiveTrue(
            Long brokerId
    );

    long countByBrokerIdAndIsActiveTrue(
            Long brokerId
    );

    List<BrokerLead> findByBrokerIdOrderByCreatedAtDesc(
            Long brokerId,
            Pageable pageable
    );

    List<BrokerLead> findByBrokerIdAndStatus(
            Long brokerId,
            LeadStatus status
    );
}