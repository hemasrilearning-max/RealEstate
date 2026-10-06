package com.realestate.modules.payment.service;

import com.realestate.modules.payment.dto.response.InvoiceResponse;

import java.util.List;

public interface InvoiceService {

    InvoiceResponse createInvoice(Long paymentId);

    InvoiceResponse getInvoiceById(Long invoiceId);

    InvoiceResponse getInvoiceByPaymentId(Long paymentId);

    List<InvoiceResponse> getMyInvoices();

    List<InvoiceResponse> getPropertyInvoices(Long propertyId);
}