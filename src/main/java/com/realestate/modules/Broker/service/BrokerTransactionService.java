package com.realestate.modules.Broker.service;

import com.realestate.modules.Broker.dto.BrokerTransactionDTO;
import com.realestate.modules.Broker.entity.BrokerClient;
import com.realestate.modules.Broker.entity.BrokerTransaction;
import com.realestate.modules.Broker.exception.BrokerResourceNotFoundException;
import com.realestate.modules.Broker.repository.BrokerClientRepository;
import com.realestate.modules.Broker.repository.BrokerTransactionRepository;
import com.realestate.modules.property.entity.Property;
import com.realestate.modules.property.repository.PropertyRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BrokerTransactionService {

    private final BrokerTransactionRepository transactionRepository;

    /**
     * Uses the common PropertyRepository.
     *
     * Property data comes from the existing "properties" table.
     * There is no BrokerProperty entity/table.
     */
    private final PropertyRepository propertyRepository;

    private final BrokerClientRepository clientRepository;


    /**
     * Create a transaction.
     *
     * brokerId = users.id where role = BROKER
     */
    public BrokerTransactionDTO createTransaction(
            Long brokerId,
            BrokerTransactionDTO dto
    ) {

        Property property = propertyRepository
                .findById(dto.getPropertyId())
                .orElseThrow(() ->
                        new BrokerResourceNotFoundException(
                                "Property not found with id: "
                                        + dto.getPropertyId()
                        )
                );


        BrokerClient client = null;

        if (dto.getClientId() != null) {

            client = clientRepository
                    .findById(dto.getClientId())
                    .orElseThrow(() ->
                            new BrokerResourceNotFoundException(
                                    "Client not found with id: "
                                            + dto.getClientId()
                            )
                    );
        }


        BrokerTransaction txn = BrokerTransaction.builder()

                .transactionCode(
                        "TXN-"
                                + UUID.randomUUID()
                                .toString()
                                .substring(0, 8)
                                .toUpperCase()
                )

                .amount(dto.getAmount())

                .type(dto.getType())

                .status(
                        dto.getStatus() != null
                                ? dto.getStatus()
                                : BrokerTransaction.TransactionStatus.PENDING
                )

                .closingDate(dto.getClosingDate())

                .property(property)

                .client(client)

                .brokerId(brokerId)

                .notes(dto.getNotes())

                .build();


        return mapToDTO(
                transactionRepository.save(txn)
        );
    }


    /**
     * Get all transactions belonging to a broker.
     */
    @Transactional(readOnly = true)
    public List<BrokerTransactionDTO> getAllTransactionsByBroker(
            Long brokerId
    ) {

        return transactionRepository
                .findByBrokerId(brokerId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }


    /**
     * Get paginated transactions belonging to a broker.
     */
    @Transactional(readOnly = true)
    public Page<BrokerTransactionDTO> getTransactionsByBrokerPaged(
            Long brokerId,
            int page,
            int size
    ) {

        return transactionRepository
                .findByBrokerId(
                        brokerId,
                        PageRequest.of(page, size)
                )
                .map(this::mapToDTO);
    }


    /**
     * Get a specific transaction belonging to the broker.
     */
    @Transactional(readOnly = true)
    public BrokerTransactionDTO getTransactionById(
            Long brokerId,
            Long transactionId
    ) {

        BrokerTransaction txn = transactionRepository
                .findById(transactionId)
                .orElseThrow(() ->
                        new BrokerResourceNotFoundException(
                                "Transaction not found with id: "
                                        + transactionId
                        )
                );


        validateBrokerOwnership(txn, brokerId);


        return mapToDTO(txn);
    }


    /**
     * Update transaction status.
     */
    public BrokerTransactionDTO updateTransactionStatus(
            Long brokerId,
            Long transactionId,
            BrokerTransaction.TransactionStatus status
    ) {

        BrokerTransaction txn = transactionRepository
                .findById(transactionId)
                .orElseThrow(() ->
                        new BrokerResourceNotFoundException(
                                "Transaction not found with id: "
                                        + transactionId
                        )
                );


        validateBrokerOwnership(txn, brokerId);


        txn.setStatus(status);

        return mapToDTO(
                transactionRepository.save(txn)
        );
    }


    /**
     * Update transaction details.
     */
    public BrokerTransactionDTO updateTransaction(
            Long brokerId,
            Long transactionId,
            BrokerTransactionDTO dto
    ) {

        BrokerTransaction txn = transactionRepository
                .findById(transactionId)
                .orElseThrow(() ->
                        new BrokerResourceNotFoundException(
                                "Transaction not found with id: "
                                        + transactionId
                        )
                );


        validateBrokerOwnership(txn, brokerId);


        if (dto.getAmount() != null) {
            txn.setAmount(dto.getAmount());
        }

        if (dto.getType() != null) {
            txn.setType(dto.getType());
        }

        if (dto.getStatus() != null) {
            txn.setStatus(dto.getStatus());
        }

        if (dto.getClosingDate() != null) {
            txn.setClosingDate(dto.getClosingDate());
        }

        if (dto.getNotes() != null) {
            txn.setNotes(dto.getNotes());
        }


        /*
         * Allow changing the property associated
         * with the transaction.
         */
        if (dto.getPropertyId() != null) {

            Property property = propertyRepository
                    .findById(dto.getPropertyId())
                    .orElseThrow(() ->
                            new BrokerResourceNotFoundException(
                                    "Property not found with id: "
                                            + dto.getPropertyId()
                            )
                    );

            txn.setProperty(property);
        }


        /*
         * Allow changing the client associated
         * with the transaction.
         */
        if (dto.getClientId() != null) {

            BrokerClient client = clientRepository
                    .findById(dto.getClientId())
                    .orElseThrow(() ->
                            new BrokerResourceNotFoundException(
                                    "Client not found with id: "
                                            + dto.getClientId()
                            )
                    );

            txn.setClient(client);
        }


        return mapToDTO(
                transactionRepository.save(txn)
        );
    }


    /**
     * Delete a transaction.
     */
    public void deleteTransaction(
            Long brokerId,
            Long transactionId
    ) {

        BrokerTransaction txn = transactionRepository
                .findById(transactionId)
                .orElseThrow(() ->
                        new BrokerResourceNotFoundException(
                                "Transaction not found with id: "
                                        + transactionId
                        )
                );


        validateBrokerOwnership(txn, brokerId);


        transactionRepository.delete(txn);
    }


    /**
     * Validate that the transaction belongs to the broker.
     */
    private void validateBrokerOwnership(
            BrokerTransaction txn,
            Long brokerId
    ) {

        if (txn.getBrokerId() == null
                || !txn.getBrokerId().equals(brokerId)) {

            throw new BrokerResourceNotFoundException(
                    "Transaction does not belong to this broker"
            );
        }
    }


    /**
     * Convert entity to DTO.
     */
    private BrokerTransactionDTO mapToDTO(
            BrokerTransaction transaction
    ) {

        return BrokerTransactionDTO.builder()

                .id(transaction.getId())

                .transactionCode(
                        transaction.getTransactionCode()
                )

                .amount(
                        transaction.getAmount()
                )

                .type(
                        transaction.getType()
                )

                .status(
                        transaction.getStatus()
                )

                .closingDate(
                        transaction.getClosingDate()
                )

                .propertyId(
                        transaction.getProperty() != null
                                ? transaction.getProperty().getId()
                                : null
                )

                .propertyTitle(
                        transaction.getProperty() != null
                                ? transaction.getProperty().getTitle()
                                : null
                )

                .clientId(
                        transaction.getClient() != null
                                ? transaction.getClient().getId()
                                : null
                )

                .clientName(
                        transaction.getClient() != null
                                ? transaction.getClient().getName()
                                : null
                )

                .brokerId(
                        transaction.getBrokerId()
                )

                .notes(
                        transaction.getNotes()
                )

                .createdAt(
                        transaction.getCreatedAt()
                )

                .updatedAt(
                        transaction.getUpdatedAt()
                )

                .build();
    }
}