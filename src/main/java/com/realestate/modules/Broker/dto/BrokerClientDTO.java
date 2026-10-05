package com.realestate.modules.Broker.dto;

import com.realestate.modules.Broker.entity.BrokerClient.ClientType;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrokerClientDTO {

    private Long id;

    /**
     * users.id of the BUYER (must already exist with role BUYER)
     */
    private Long userId;

    /**
     * users.id of the BROKER
     */
    private Long brokerId;

    private String name;

    private String email;

    private String phone;

    private String address;

    private ClientType clientType;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
