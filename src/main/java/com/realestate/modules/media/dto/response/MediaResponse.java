package com.realestate.modules.media.dto.response;

import com.realestate.modules.media.enums.MediaType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MediaResponse {

  private Long id;

  private String fileName;

  private String fileUrl;

  private MediaType mediaType;

  private Boolean primary;

  private Long propertyId;
}
