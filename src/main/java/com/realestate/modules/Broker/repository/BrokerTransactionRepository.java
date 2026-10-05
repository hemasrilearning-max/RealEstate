package com.realestate.modules.Broker.repository;

import com.realestate.modules.Broker.entity.BrokerTransaction;
import com.realestate.modules.Broker.entity.BrokerTransaction.TransactionStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BrokerTransactionRepository
        extends JpaRepository<BrokerTransaction, Long> {

    List<BrokerTransaction> findByBrokerId(
            Long brokerId
    );

    Page<BrokerTransaction> findByBrokerId(
            Long brokerId,
            Pageable pageable
    );

    long countByBrokerIdAndStatus(
            Long brokerId,
            TransactionStatus status
    );

    Optional<BrokerTransaction> findByTransactionCode(
            String transactionCode
    );

    List<BrokerTransaction> findByBrokerIdOrderByCreatedAtDesc(
            Long brokerId,
            Pageable pageable
    );
}