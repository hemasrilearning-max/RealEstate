package com.realestate.modules.payment.repository;

import com.realestate.modules.payment.entity.Transaction;
import com.realestate.modules.payment.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Optional<Transaction> findByTransactionReference(String transactionReference);

    List<Transaction> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);

    List<Transaction> findByPropertyIdOrderByCreatedAtDesc(Long propertyId);

    List<Transaction> findByBrokerIdOrderByCreatedAtDesc(Long brokerId);

    List<Transaction> findByTransactionType(TransactionType transactionType);

    boolean existsByTransactionReference(String transactionReference);
}