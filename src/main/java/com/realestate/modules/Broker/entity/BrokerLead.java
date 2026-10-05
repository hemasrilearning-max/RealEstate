package com.realestate.modules.Broker.entity;

import com.realestate.modules.property.entity.Property;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "broker_leads")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrokerLead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String email;

    private String phone;

    @Column(length = 1000)
    private String message;

    @Enumerated(EnumType.STRING)
    private LeadStatus status;

    @Enumerated(EnumType.STRING)
    private LeadSource source;

    /**
     * References properties.id
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id")
    private Property property;

    /**
     * References users.id where role = BROKER.
     */
    @Column(name = "broker_id", nullable = false)
    private Long brokerId;

    @Builder.Default
    private boolean isActive = true;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        if (status == null) {
            status = LeadStatus.NEW;
        }

        if (!isActive) {
            isActive = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum LeadStatus {
        NEW,
        CONTACTED,
        QUALIFIED,
        NEGOTIATION,
        WON,
        LOST,
        CLOSED
    }

    public enum LeadSource {
        WEBSITE,
        REFERRAL,
        SOCIAL_MEDIA,
        WALK_IN,
        ADVERTISEMENT,
        OTHER
    }
}