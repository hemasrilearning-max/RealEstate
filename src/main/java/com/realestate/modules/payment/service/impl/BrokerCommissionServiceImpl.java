package com.realestate.modules.payment.service.impl;

import com.realestate.modules.payment.entity.Payment;
import com.realestate.modules.payment.entity.Transaction;
import com.realestate.modules.payment.enums.TransactionType;
import com.realestate.modules.payment.repository.TransactionRepository;
import com.realestate.modules.payment.service.BrokerCommissionService;
import com.realestate.modules.property.entity.Property;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class BrokerCommissionServiceImpl implements BrokerCommissionService {

    private final TransactionRepository transactionRepository;

    @Override
    public BigDecimal calculateCommission(
            BigDecimal propertyAmount,
            BigDecimal commissionPercentage) {

        if (propertyAmount == null || propertyAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Property amount must be greater than zero");
        }

        if (commissionPercentage == null
                || commissionPercentage.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Commission percentage cannot be negative");
        }

        return propertyAmount
                .multiply(commissionPercentage)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }

    @Override
    public Transaction createCommissionTransaction(
            Payment payment,
            BigDecimal commissionPercentage) {

        if (payment == null) {
            throw new IllegalArgumentException("Payment is required");
        }

        Property property = payment.getProperty();

        if (property == null) {
            throw new IllegalStateException("Property is not associated with this payment");
        }

        // No broker means no broker commission
        if (property.getBroker() == null) {
            return null;
        }

        BigDecimal commissionAmount = calculateCommission(
                payment.getAmount(),
                commissionPercentage
        );

        Transaction transaction = Transaction.builder()
                .amount(commissionAmount)
                .transactionType(TransactionType.BROKER_COMMISSION)
                .payment(payment)
                .property(property)
                .buyer(payment.getBuyer())
                .broker(property.getBroker())
                .brokerCommissionPercentage(commissionPercentage)
                .brokerCommissionAmount(commissionAmount)
                .transactionReference("COMM-" + UUID.randomUUID())
                .build();

        return transactionRepository.save(transaction);
    }
}