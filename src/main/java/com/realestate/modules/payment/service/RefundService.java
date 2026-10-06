package com.realestate.modules.payment.service;

import com.realestate.modules.payment.dto.request.RefundRequest;
import com.realestate.modules.payment.entity.Refund;

import java.util.List;

public interface RefundService {

    Refund createRefund(RefundRequest request);

    Refund getRefundById(Long refundId);

    List<Refund> getMyRefunds();
}