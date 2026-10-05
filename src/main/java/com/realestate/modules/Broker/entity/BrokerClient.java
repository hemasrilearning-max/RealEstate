package com.realestate.modules.Broker.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Maps to existing "clients" table.
 *
 * Important design:
 * - Clients are BUYERS that already exist in the users table (role = BUYER).
 * - We do NOT create a new user here.
 * - userId  = users.id of the buyer
 * - brokerId = users.id of the broker
 *
 * name / email / phone are denormalized (copied from User at link time)
 * so that broker-side queries stay simple and fast.
 */
@Entity
@Table(name = "clients")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrokerClient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * users.id where role = BUYER
     * This is the primary reference. Details (name, email, phone)
     * should be fetched / copied from the users table.
     */
    @Column(name = "user_id", nullable = false)
    private Long userId;

    /**
     * users.id where role = BROKER
     */
    @Column(name = "broker_id", nullable = false)
    private Long brokerId;

    /**
     * Denormalized from users.first_name + last_name (or username)
     */
    @Column(nullable = false)
    private String name;

    private String email;

    private String phone;

    private String address;

    @Enumerated(EnumType.STRING)
    @Column(name = "client_type")
    private ClientType clientType;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (clientType == null) {
            clientType = ClientType.BUYER;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum ClientType {
        BUYER,
        SELLER,
        BOTH
    }
}
