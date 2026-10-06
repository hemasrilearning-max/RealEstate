package com.realestate.modules.payment.service.impl;

import com.realestate.modules.payment.dto.response.InvoiceResponse;
import com.realestate.modules.payment.entity.Invoice;
import com.realestate.modules.payment.entity.Payment;
import com.realestate.modules.payment.enums.PaymentStatus;
import com.realestate.modules.payment.repository.InvoiceRepository;
import com.realestate.modules.payment.repository.PaymentRepository;
import com.realestate.modules.payment.service.InvoiceService;
import com.realestate.modules.user.entity.User;
import com.realestate.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    @Override
    public InvoiceResponse createInvoice(Long paymentId) {

        User currentUser = getCurrentUser();

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() ->
                        new RuntimeException("Payment not found"));

        if (!payment.getBuyer().getId().equals(currentUser.getId())) {
            throw new RuntimeException(
                    "You are not authorized to create this invoice");
        }

        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new IllegalStateException(
                    "Invoice can only be created for a successful payment");
        }

        Invoice existingInvoice = invoiceRepository
                .findByPaymentId(paymentId)
                .orElse(null);

        if (existingInvoice != null) {
            return toResponse(existingInvoice);
        }

        String invoiceNumber = generateInvoiceNumber();

        Invoice invoice = Invoice.builder()
                .invoiceNumber(invoiceNumber)
                .amount(payment.getAmount())
                .payment(payment)
                .buyer(payment.getBuyer())
                .property(payment.getProperty())
                .build();

        Invoice savedInvoice = invoiceRepository.save(invoice);

        return toResponse(savedInvoice);
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceById(Long invoiceId) {

        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() ->
                        new RuntimeException("Invoice not found"));

        User currentUser = getCurrentUser();

        if (!invoice.getBuyer().getId().equals(currentUser.getId())) {
            throw new RuntimeException(
                    "You are not authorized to view this invoice");
        }

        return toResponse(invoice);
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceByPaymentId(Long paymentId) {

        Invoice invoice = invoiceRepository.findByPaymentId(paymentId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invoice not found for this payment"));

        User currentUser = getCurrentUser();

        if (!invoice.getBuyer().getId().equals(currentUser.getId())) {
            throw new RuntimeException(
                    "You are not authorized to view this invoice");
        }

        return toResponse(invoice);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceResponse> getMyInvoices() {

        User currentUser = getCurrentUser();

        return invoiceRepository
                .findByBuyerIdOrderByIssuedAtDesc(currentUser.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceResponse> getPropertyInvoices(Long propertyId) {

        User currentUser = getCurrentUser();

        return invoiceRepository
                .findByPropertyIdOrderByIssuedAtDesc(propertyId)
                .stream()
                .filter(invoice ->
                        invoice.getBuyer().getId()
                                .equals(currentUser.getId()))
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

    private String generateInvoiceNumber() {

        long nextNumber = invoiceRepository.count() + 1;

        String invoiceNumber;

        do {
            invoiceNumber = String.format(
                    "INV-%d-%06d",
                    java.time.Year.now().getValue(),
                    nextNumber
            );

            nextNumber++;

        } while (invoiceRepository.existsByInvoiceNumber(invoiceNumber));

        return invoiceNumber;
    }

    private InvoiceResponse toResponse(Invoice invoice) {

        return InvoiceResponse.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .amount(invoice.getAmount())
                .paymentId(invoice.getPayment().getId())
                .buyerId(invoice.getBuyer().getId())
                .propertyId(invoice.getProperty().getId())
                .issuedAt(invoice.getIssuedAt())
                .build();
    }
}