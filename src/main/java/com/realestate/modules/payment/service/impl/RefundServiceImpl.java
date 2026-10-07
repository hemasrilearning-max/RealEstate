package com.realestate.modules.payment.service.impl;

import com.realestate.modules.payment.dto.request.RefundRequest;
import com.realestate.modules.payment.entity.Payment;
import com.realestate.modules.payment.entity.Refund;
import com.realestate.modules.payment.enums.PaymentStatus;
import com.realestate.modules.payment.gateway.PaymentGateway;
import com.realestate.modules.payment.repository.PaymentRepository;
import com.realestate.modules.payment.repository.RefundRepository;
import com.realestate.modules.payment.service.RefundService;
import com.realestate.modules.user.entity.User;
import com.realestate.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class RefundServiceImpl implements RefundService {

    private final RefundRepository refundRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final PaymentGateway paymentGateway;

    @Override
    public Refund createRefund(RefundRequest request) {

        User currentUser = getCurrentUser();

        Payment payment = paymentRepository.findById(request.getPaymentId())
                .orElseThrow(() ->
                        new RuntimeException("Payment not found"));

        if (!payment.getBuyer().getId().equals(currentUser.getId())) {
            throw new RuntimeException(
                    "You are not authorized to refund this payment");
        }

        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new IllegalStateException(
                    "Only successful payments can be refunded");
        }

        BigDecimal refundAmount = request.getAmount();

        if (refundAmount.compareTo(payment.getAmount()) > 0) {
            throw new IllegalArgumentException(
                    "Refund amount cannot exceed payment amount");
        }

        if (payment.getRazorpayPaymentId() == null) {
            throw new IllegalStateException(
                    "Razorpay payment ID is missing");
        }

        String razorpayRefundId = paymentGateway.createRefund(
                payment.getRazorpayPaymentId(),
                refundAmount,
                request.getReason()
        );

        Refund refund = Refund.builder()
                .amount(refundAmount)
                .razorpayRefundId(razorpayRefundId)
                .reason(request.getReason())
                .payment(payment)
                .buyer(currentUser)
                .build();

        Refund savedRefund = refundRepository.save(refund);

        if (refundAmount.compareTo(payment.getAmount()) == 0) {
            payment.setStatus(PaymentStatus.REFUNDED);
        } else {
            payment.setStatus(PaymentStatus.PARTIALLY_REFUNDED);
        }

        paymentRepository.save(payment);

        return savedRefund;
    }

    @Override
    @Transactional(readOnly = true)
    public Refund getRefundById(Long refundId) {

        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() ->
                        new RuntimeException("Refund not found"));

        User currentUser = getCurrentUser();

        if (!refund.getBuyer().getId().equals(currentUser.getId())) {
            throw new RuntimeException(
                    "You are not authorized to view this refund");
        }

        return refund;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Refund> getMyRefunds() {

        User currentUser = getCurrentUser();

        return refundRepository
                .findByBuyerIdOrderByCreatedAtDesc(currentUser.getId());
    }

    private User getCurrentUser() {

        String username = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException("Current user not found"));
    }
}