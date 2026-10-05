package com.realestate.modules.Broker.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrokerMessageDTO {

    private Long id;

    private String content;

    private boolean isRead;

    private Long conversationId;

    private Long receiverId;

    private Long senderId;

    /** users.id of the BROKER */
    private Long brokerId;

    private LocalDateTime createdAt;
}
