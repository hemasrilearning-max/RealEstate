package com.realestate.modules.payment.service;

import com.realestate.modules.payment.entity.Payment;
import com.realestate.modules.payment.entity.Transaction;

import java.math.BigDecimal;

public interface BrokerCommissionService {

    BigDecimal calculateCommission(
            BigDecimal propertyAmount,
            BigDecimal commissionPercentage
    );

    Transaction createCommissionTransaction(
            Payment payment,
            BigDecimal commissionPercentage
    );
}