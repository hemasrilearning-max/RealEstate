package com.realestate.modules.payment.repository;

import com.realestate.modules.payment.entity.Refund;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RefundRepository extends JpaRepository<Refund, Long> {

    Optional<Refund> findByRazorpayRefundId(String razorpayRefundId);

    List<Refund> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);

    List<Refund> findByPaymentIdOrderByCreatedAtDesc(Long paymentId);

    boolean existsByRazorpayRefundId(String razorpayRefundId);
}