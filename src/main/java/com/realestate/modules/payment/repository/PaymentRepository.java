package com.realestate.modules.payment.repository;

import com.realestate.modules.payment.entity.Payment;
import com.realestate.modules.payment.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);

    Optional<Payment> findByRazorpayPaymentId(String razorpayPaymentId);

    List<Payment> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);

    List<Payment> findByPropertyIdOrderByCreatedAtDesc(Long propertyId);

    List<Payment> findByStatus(PaymentStatus status);

    boolean existsByRazorpayOrderId(String razorpayOrderId);
}