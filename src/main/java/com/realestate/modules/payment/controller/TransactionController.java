package com.realestate.modules.payment.controller;

import com.realestate.modules.payment.dto.response.TransactionResponse;
import com.realestate.modules.payment.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping("/{transactionId}")
    public ResponseEntity<TransactionResponse> getTransactionById(
            @PathVariable Long transactionId) {

        return ResponseEntity.ok(
                transactionService.getTransactionById(transactionId)
        );
    }

    @GetMapping("/my")
    public ResponseEntity<List<TransactionResponse>> getMyTransactions() {

        return ResponseEntity.ok(
                transactionService.getMyTransactions()
        );
    }

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<TransactionResponse>> getPropertyTransactions(
            @PathVariable Long propertyId) {

        return ResponseEntity.ok(
                transactionService.getPropertyTransactions(propertyId)
        );
    }

    @GetMapping("/broker/{brokerId}")
    public ResponseEntity<List<TransactionResponse>> getBrokerTransactions(
            @PathVariable Long brokerId) {

        return ResponseEntity.ok(
                transactionService.getBrokerTransactions(brokerId)
        );
    }

    /**
     * Admin/Super Admin:
     * Get all property transactions.
     */
    @GetMapping("/admin")
    public ResponseEntity<List<TransactionResponse>> getAllTransactionsForAdmin() {

        return ResponseEntity.ok(
                transactionService.getAllTransactionsForAdmin()
        );
    }
}
