package com.realestate.modules.payment.repository;

import com.realestate.modules.payment.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    Optional<Invoice> findByPaymentId(Long paymentId);

    List<Invoice> findByBuyerIdOrderByIssuedAtDesc(Long buyerId);

    List<Invoice> findByPropertyIdOrderByIssuedAtDesc(Long propertyId);

    boolean existsByInvoiceNumber(String invoiceNumber);
}