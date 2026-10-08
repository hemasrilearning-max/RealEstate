package com.realestate.modules.payment.service.impl;

import com.realestate.modules.payment.dto.response.TransactionResponse;
import com.realestate.modules.payment.entity.Transaction;
import com.realestate.modules.payment.repository.TransactionRepository;
import com.realestate.modules.payment.service.TransactionService;
import com.realestate.modules.user.entity.User;
import com.realestate.modules.user.enums.RoleType;
import com.realestate.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    @Override
    public Transaction createPurchaseTransaction(Transaction transaction) {

        if (transaction == null) {
            throw new IllegalArgumentException(
                    "Transaction cannot be null"
            );
        }

        if (transaction.getTransactionReference() == null
                || transaction.getTransactionReference().isBlank()) {

            throw new IllegalArgumentException(
                    "Transaction reference is required"
            );
        }

        if (transactionRepository.existsByTransactionReference(
                transaction.getTransactionReference())) {

            throw new IllegalStateException(
                    "Transaction already exists"
            );
        }

        return transactionRepository.save(transaction);
    }

    @Override
    @Transactional(readOnly = true)
    public TransactionResponse getTransactionById(Long transactionId) {

        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() ->
                        new RuntimeException("Transaction not found"));

        User currentUser = getCurrentUser();

        validateAccess(transaction, currentUser);

        return toResponse(transaction);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> getMyTransactions() {

        User currentUser = getCurrentUser();

        return transactionRepository
                .findByBuyerIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> getPropertyTransactions(
            Long propertyId) {

        User currentUser = getCurrentUser();

        return transactionRepository
                .findByPropertyIdOrderByCreatedAtDesc(propertyId)
                .stream()
                .filter(transaction ->
                        transaction.getBuyer() != null
                                && transaction.getBuyer().getId()
                                .equals(currentUser.getId()))
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> getBrokerTransactions(
            Long brokerId) {

        User currentUser = getCurrentUser();

        if (!currentUser.getId().equals(brokerId)) {
            throw new RuntimeException(
                    "You are not authorized to view these transactions"
            );
        }

        return transactionRepository
                .findByBrokerIdOrderByCreatedAtDesc(brokerId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Returns all transactions for Admin/Super Admin.
     */
    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> getAllTransactionsForAdmin() {

        User currentUser = getCurrentUser();

        /*
         * User.role is a Role entity.
         * Role.name contains the RoleType enum.
         */
        RoleType role = currentUser.getRole().getName();

        if (role != RoleType.ADMIN
                && role != RoleType.SUPER_ADMIN) {

            throw new RuntimeException(
                    "You are not authorized to view all transactions"
            );
        }

        return transactionRepository
                .findAll()
                .stream()
                .sorted((first, second) -> {

                    if (first.getCreatedAt() == null
                            && second.getCreatedAt() == null) {
                        return 0;
                    }

                    if (first.getCreatedAt() == null) {
                        return 1;
                    }

                    if (second.getCreatedAt() == null) {
                        return -1;
                    }

                    return second.getCreatedAt()
                            .compareTo(first.getCreatedAt());
                })
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

    private void validateAccess(
            Transaction transaction,
            User currentUser) {

        boolean isBuyer = transaction.getBuyer() != null
                && transaction.getBuyer().getId()
                .equals(currentUser.getId());

        boolean isBroker = transaction.getBroker() != null
                && transaction.getBroker().getId()
                .equals(currentUser.getId());

        /*
         * User.role is Role entity.
         * Role.name is RoleType.
         */
        RoleType role = currentUser.getRole() != null
                ? currentUser.getRole().getName()
                : null;

        boolean isAdmin = role == RoleType.ADMIN
                || role == RoleType.SUPER_ADMIN;

        if (!isBuyer && !isBroker && !isAdmin) {
            throw new RuntimeException(
                    "You are not authorized to view this transaction"
            );
        }
    }

    private TransactionResponse toResponse(
            Transaction transaction) {

        return TransactionResponse.builder()
                .id(transaction.getId())
                .amount(transaction.getAmount())
                .transactionType(transaction.getTransactionType())
                .paymentId(
                        transaction.getPayment() != null
                                ? transaction.getPayment().getId()
                                : null
                )
                .propertyId(
                        transaction.getProperty() != null
                                ? transaction.getProperty().getId()
                                : null
                )
                .buyerId(
                        transaction.getBuyer() != null
                                ? transaction.getBuyer().getId()
                                : null
                )
                .brokerId(
                        transaction.getBroker() != null
                                ? transaction.getBroker().getId()
                                : null
                )
                .brokerCommissionPercentage(
                        transaction.getBrokerCommissionPercentage()
                )
                .brokerCommissionAmount(
                        transaction.getBrokerCommissionAmount()
                )
                .transactionReference(
                        transaction.getTransactionReference()
                )
                .createdAt(
                        transaction.getCreatedAt()
                )
                .build();
    }
}
