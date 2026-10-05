package com.realestate.modules.Broker.service;

import com.realestate.modules.Broker.dto.BrokerClientDTO;
import com.realestate.modules.Broker.entity.BrokerClient;
import com.realestate.modules.Broker.exception.BrokerResourceNotFoundException;
import com.realestate.modules.Broker.repository.BrokerClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Clients are BUYERS already present in the users table.
 *
 * Flow:
 * 1. Frontend / caller sends userId of an existing BUYER.
 * 2. We create a link row in clients table (broker_id + user_id).
 * 3. name / email / phone are expected to be provided (copied from User)
 *    or can later be enriched by joining with users table.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class BrokerClientService {

    private final BrokerClientRepository clientRepository;

    /**
     * Link an existing BUYER (userId) to this broker.
     * Does NOT create a new user.
     */
    public BrokerClientDTO createClient(Long brokerId, BrokerClientDTO dto) {

        if (dto.getUserId() == null) {
            throw new IllegalArgumentException(
                    "userId is required. Clients must be existing BUYERS from users table."
            );
        }

        // Prevent duplicate link
        if (clientRepository.existsByUserIdAndBrokerId(dto.getUserId(), brokerId)) {
            throw new IllegalArgumentException(
                    "This buyer (userId=" + dto.getUserId() + ") is already linked to this broker."
            );
        }

        BrokerClient client = BrokerClient.builder()
                .userId(dto.getUserId())
                .brokerId(brokerId)
                .name(dto.getName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .address(dto.getAddress())
                .clientType(dto.getClientType() != null
                        ? dto.getClientType()
                        : BrokerClient.ClientType.BUYER)
                .build();

        return mapToDTO(clientRepository.save(client));
    }

    @Transactional(readOnly = true)
    public List<BrokerClientDTO> getAllClientsByBroker(Long brokerId) {
        return clientRepository.findByBrokerId(brokerId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<BrokerClientDTO> getClientsByBrokerPaged(Long brokerId, int page, int size) {
        return clientRepository
                .findByBrokerId(brokerId, PageRequest.of(page, size))
                .map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public BrokerClientDTO getClientById(Long brokerId, Long clientId) {
        BrokerClient client = clientRepository.findById(clientId)
                .orElseThrow(() -> new BrokerResourceNotFoundException(
                        "Client not found with id: " + clientId));

        if (!brokerId.equals(client.getBrokerId())) {
            throw new BrokerResourceNotFoundException(
                    "Client does not belong to this broker");
        }
        return mapToDTO(client);
    }

    public BrokerClientDTO updateClient(Long brokerId, Long clientId, BrokerClientDTO dto) {
        BrokerClient client = clientRepository.findById(clientId)
                .orElseThrow(() -> new BrokerResourceNotFoundException(
                        "Client not found with id: " + clientId));

        if (!brokerId.equals(client.getBrokerId())) {
            throw new BrokerResourceNotFoundException(
                    "Client does not belong to this broker");
        }

        // userId should normally not change, but allow if provided
        if (dto.getUserId() != null) {
            client.setUserId(dto.getUserId());
        }
        if (dto.getName() != null) {
            client.setName(dto.getName());
        }
        if (dto.getEmail() != null) {
            client.setEmail(dto.getEmail());
        }
        if (dto.getPhone() != null) {
            client.setPhone(dto.getPhone());
        }
        if (dto.getAddress() != null) {
            client.setAddress(dto.getAddress());
        }
        if (dto.getClientType() != null) {
            client.setClientType(dto.getClientType());
        }

        return mapToDTO(clientRepository.save(client));
    }

    public void deleteClient(Long brokerId, Long clientId) {
        BrokerClient client = clientRepository.findById(clientId)
                .orElseThrow(() -> new BrokerResourceNotFoundException(
                        "Client not found with id: " + clientId));

        if (!brokerId.equals(client.getBrokerId())) {
            throw new BrokerResourceNotFoundException(
                    "Client does not belong to this broker");
        }
        clientRepository.delete(client);
    }

    private BrokerClientDTO mapToDTO(BrokerClient client) {
        return BrokerClientDTO.builder()
                .id(client.getId())
                .userId(client.getUserId())
                .brokerId(client.getBrokerId())
                .name(client.getName())
                .email(client.getEmail())
                .phone(client.getPhone())
                .address(client.getAddress())
                .clientType(client.getClientType())
                .createdAt(client.getCreatedAt())
                .updatedAt(client.getUpdatedAt())
                .build();
    }
}
