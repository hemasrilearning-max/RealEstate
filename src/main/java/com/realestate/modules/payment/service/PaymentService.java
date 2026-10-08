package com.realestate.modules.payment.service;

import com.realestate.modules.payment.dto.request.CreatePaymentRequest;
import com.realestate.modules.payment.dto.request.VerifyPaymentRequest;
import com.realestate.modules.payment.dto.response.PaymentResponse;

import java.util.List;

public interface PaymentService {

    PaymentResponse createPayment(CreatePaymentRequest request);

    PaymentResponse verifyPayment(VerifyPaymentRequest request);

    PaymentResponse getPaymentById(Long paymentId);

    List<PaymentResponse> getMyPayments();

    List<PaymentResponse> getAllPaymentsForAdmin();
}
