package com.realestate.modules.payment.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceResponse {

    private Long id;

    private String invoiceNumber;

    private BigDecimal amount;

    private Long paymentId;

    private Long buyerId;

    private Long propertyId;

    private LocalDateTime issuedAt;
}