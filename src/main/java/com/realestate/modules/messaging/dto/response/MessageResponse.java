package com.realestate.modules.messaging.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageResponse {

  private Long id;

  private Long conversationId;

  private Long senderId;
  private String senderName;

  private Long receiverId;
  private String receiverName;

  private String content;

  private Boolean isRead;

  private LocalDateTime createdAt;
}