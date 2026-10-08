package com.realestate.modules.payment.service;

import com.realestate.modules.payment.dto.response.TransactionResponse;
import com.realestate.modules.payment.entity.Transaction;

import java.util.List;

public interface TransactionService {

    Transaction createPurchaseTransaction(Transaction transaction);

    TransactionResponse getTransactionById(Long transactionId);

    List<TransactionResponse> getMyTransactions();

    List<TransactionResponse> getPropertyTransactions(Long propertyId);

    List<TransactionResponse> getBrokerTransactions(Long brokerId);

    List<TransactionResponse> getAllTransactionsForAdmin();
}
