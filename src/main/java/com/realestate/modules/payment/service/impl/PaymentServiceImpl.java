package com.realestate.modules.payment.service.impl;

import com.realestate.modules.payment.dto.request.CreatePaymentRequest;
import com.realestate.modules.payment.dto.request.VerifyPaymentRequest;
import com.realestate.modules.payment.dto.response.PaymentResponse;
import com.realestate.modules.payment.entity.Payment;
import com.realestate.modules.payment.entity.Transaction;
import com.realestate.modules.payment.enums.PaymentStatus;
import com.realestate.modules.payment.enums.TransactionType;
import com.realestate.modules.payment.gateway.PaymentGateway;
import com.realestate.modules.payment.repository.PaymentRepository;
import com.realestate.modules.payment.service.BrokerCommissionService;
import com.realestate.modules.payment.service.InvoiceService;
import com.realestate.modules.payment.service.PaymentService;
import com.realestate.modules.payment.service.TransactionService;
import com.realestate.modules.property.entity.Property;
import com.realestate.modules.property.enums.PropertyStatus;
import com.realestate.modules.property.repository.PropertyRepository;
import com.realestate.modules.user.entity.User;
import com.realestate.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final PaymentGateway paymentGateway;
    private final TransactionService transactionService;
    private final InvoiceService invoiceService;
    private final BrokerCommissionService brokerCommissionService;

    @Value("${app.broker.commission-percentage}")
    private BigDecimal brokerCommissionPercentage;

    @Override
    public PaymentResponse createPayment(CreatePaymentRequest request) {

        User buyer = getCurrentUser();

        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() ->
                        new RuntimeException("Property not found"));

        if (property.getPrice() == null) {
            throw new IllegalStateException(
                    "Property price is not available");
        }

        if (property.getBuyer() != null) {
            throw new IllegalStateException(
                    "Property has already been purchased");
        }

        if (property.getStatus() != PropertyStatus.AVAILABLE) {
            throw new IllegalStateException(
                    "Property is not available for purchase");
        }

        BigDecimal amount = property.getPrice();

        String receipt = "PROP_" + property.getId()
                + "_BUYER_" + buyer.getId();

        String razorpayOrderId =
                paymentGateway.createOrder(amount, receipt);

        Payment payment = Payment.builder()
                .amount(amount)
                .status(PaymentStatus.CREATED)
                .razorpayOrderId(razorpayOrderId)
                .buyer(buyer)
                .property(property)
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        return toResponse(savedPayment);
    }

    @Override
    public PaymentResponse verifyPayment(
            VerifyPaymentRequest request) {

        Payment payment = paymentRepository
                .findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() ->
                        new RuntimeException("Payment not found"));

        User currentUser = getCurrentUser();

        if (!payment.getBuyer().getId()
                .equals(currentUser.getId())) {

            throw new RuntimeException(
                    "You are not authorized to verify this payment");
        }

        /*
         * Prevent processing the same successful payment again.
         */
        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            return toResponse(payment);
        }

        boolean verified = paymentGateway.verifyPaymentSignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );

        if (!verified) {

            payment.setStatus(PaymentStatus.FAILED);

            paymentRepository.save(payment);

            throw new RuntimeException(
                    "Payment signature verification failed");
        }

        /*
         * Store Razorpay payment information.
         */
        payment.setRazorpayPaymentId(
                request.getRazorpayPaymentId());

        payment.setRazorpaySignature(
                request.getRazorpaySignature());

        payment.setStatus(PaymentStatus.SUCCESS);

        /*
         * Mark the property as sold and assign
         * the current buyer.
         */
        Property property = payment.getProperty();

        if (property.getBuyer() != null) {
            throw new IllegalStateException(
                    "Property has already been purchased");
        }

        property.setBuyer(currentUser);
        property.setStatus(PropertyStatus.SOLD);

        propertyRepository.save(property);

        /*
         * Save successful payment.
         */
        Payment savedPayment = paymentRepository.save(payment);

        /*
         * Create property purchase transaction.
         */
        createPurchaseTransaction(savedPayment);

        /*
         * Create broker commission only when
         * a broker is assigned to the property.
         */
        if (property.getBroker() != null) {

            brokerCommissionService.createCommissionTransaction(
                    savedPayment,
                    brokerCommissionPercentage
            );
        }

        /*
         * Generate invoice.
         */
        invoiceService.createInvoice(savedPayment.getId());

        return toResponse(savedPayment);
    }

    private void createPurchaseTransaction(Payment payment) {

        Property property = payment.getProperty();

        String transactionReference =
                "TXN-" + UUID.randomUUID();

        Transaction transaction = Transaction.builder()
                .amount(payment.getAmount())
                .transactionType(TransactionType.PROPERTY_PURCHASE)
                .payment(payment)
                .property(property)
                .buyer(payment.getBuyer())
                .broker(property.getBroker())
                .transactionReference(transactionReference)
                .build();

        transactionService.createPurchaseTransaction(transaction);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Long paymentId) {

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() ->
                        new RuntimeException("Payment not found"));

        User currentUser = getCurrentUser();

        if (!payment.getBuyer().getId()
                .equals(currentUser.getId())) {

            throw new RuntimeException(
                    "You are not authorized to view this payment");
        }

        return toResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getMyPayments() {

        User currentUser = getCurrentUser();

        return paymentRepository
                .findByBuyerIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(this::toResponse)
                .toList();
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

    private PaymentResponse toResponse(Payment payment) {

        return PaymentResponse.builder()
                .id(payment.getId())
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .paymentMethod(payment.getPaymentMethod())
                .razorpayOrderId(payment.getRazorpayOrderId())
                .razorpayPaymentId(payment.getRazorpayPaymentId())
                .buyerId(payment.getBuyer().getId())
                .propertyId(payment.getProperty().getId())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .build();
    }
}