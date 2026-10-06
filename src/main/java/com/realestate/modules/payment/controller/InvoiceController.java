package com.realestate.modules.payment.controller;

import com.realestate.modules.payment.dto.response.InvoiceResponse;
import com.realestate.modules.payment.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @PostMapping("/payment/{paymentId}")
    public ResponseEntity<InvoiceResponse> createInvoice(
            @PathVariable Long paymentId) {

        InvoiceResponse response =
                invoiceService.createInvoice(paymentId);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/{invoiceId}")
    public ResponseEntity<InvoiceResponse> getInvoiceById(
            @PathVariable Long invoiceId) {

        return ResponseEntity.ok(
                invoiceService.getInvoiceById(invoiceId)
        );
    }

    @GetMapping("/payment/{paymentId}")
    public ResponseEntity<InvoiceResponse> getInvoiceByPaymentId(
            @PathVariable Long paymentId) {

        return ResponseEntity.ok(
                invoiceService.getInvoiceByPaymentId(paymentId)
        );
    }

    @GetMapping("/my")
    public ResponseEntity<List<InvoiceResponse>> getMyInvoices() {

        return ResponseEntity.ok(
                invoiceService.getMyInvoices()
        );
    }

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<InvoiceResponse>> getPropertyInvoices(
            @PathVariable Long propertyId) {

        return ResponseEntity.ok(
                invoiceService.getPropertyInvoices(propertyId)
        );
    }
}