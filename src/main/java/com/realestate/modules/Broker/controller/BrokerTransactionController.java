package com.realestate.modules.Broker.controller;

import com.realestate.modules.Broker.dto.BrokerApiResponse;
import com.realestate.modules.Broker.dto.BrokerTransactionDTO;
import com.realestate.modules.Broker.entity.BrokerTransaction;
import com.realestate.modules.Broker.service.BrokerTransactionService;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/broker/transactions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BrokerTransactionController {

    private final BrokerTransactionService transactionService;

    /**
     * Create a new transaction for a broker.
     */
    @PostMapping("/{brokerId}")
    public ResponseEntity<BrokerApiResponse<BrokerTransactionDTO>> create(
            @PathVariable Long brokerId,
            @RequestBody BrokerTransactionDTO dto) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        BrokerApiResponse.success(
                                "Transaction created",
                                transactionService.createTransaction(
                                        brokerId,
                                        dto
                                )
                        )
                );
    }

    /**
     * Get all transactions belonging to a broker.
     */
    @GetMapping("/{brokerId}")
    public ResponseEntity<BrokerApiResponse<List<BrokerTransactionDTO>>> getAll(
            @PathVariable Long brokerId) {

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        transactionService.getAllTransactionsByBroker(
                                brokerId
                        )
                )
        );
    }

    /**
     * Get paginated transactions belonging to a broker.
     */
    @GetMapping("/{brokerId}/paged")
    public ResponseEntity<BrokerApiResponse<Page<BrokerTransactionDTO>>> getPaged(
            @PathVariable Long brokerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        transactionService.getTransactionsByBrokerPaged(
                                brokerId,
                                page,
                                size
                        )
                )
        );
    }

    /**
     * Get a single transaction.
     */
    @GetMapping("/{brokerId}/{transactionId}")
    public ResponseEntity<BrokerApiResponse<BrokerTransactionDTO>> getOne(
            @PathVariable Long brokerId,
            @PathVariable Long transactionId) {

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        transactionService.getTransactionById(
                                brokerId,
                                transactionId
                        )
                )
        );
    }

    /**
     * Update transaction status.
     */
    @PatchMapping("/{brokerId}/{transactionId}/status")
    public ResponseEntity<BrokerApiResponse<BrokerTransactionDTO>> updateStatus(
            @PathVariable Long brokerId,
            @PathVariable Long transactionId,
            @RequestParam BrokerTransaction.TransactionStatus status) {

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        "Transaction status updated",
                        transactionService.updateTransactionStatus(
                                brokerId,
                                transactionId,
                                status
                        )
                )
        );
    }

    /**
     * Update a transaction.
     */
    @PutMapping("/{brokerId}/{transactionId}")
    public ResponseEntity<BrokerApiResponse<BrokerTransactionDTO>> update(
            @PathVariable Long brokerId,
            @PathVariable Long transactionId,
            @RequestBody BrokerTransactionDTO dto) {

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        "Transaction updated",
                        transactionService.updateTransaction(
                                brokerId,
                                transactionId,
                                dto
                        )
                )
        );
    }

    /**
     * Delete a transaction.
     */
    @DeleteMapping("/{brokerId}/{transactionId}")
    public ResponseEntity<BrokerApiResponse<Void>> delete(
            @PathVariable Long brokerId,
            @PathVariable Long transactionId) {

        transactionService.deleteTransaction(
                brokerId,
                transactionId
        );

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        "Transaction deleted",
                        null
                )
        );
    }
}