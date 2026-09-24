package com.realestate.modules.media.dto.request;

import com.realestate.modules.media.enums.MediaType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateMediaRequest {

  @NotBlank(message = "File name is required")
  @Size(max = 255, message = "File name must not exceed 255 characters")
  private String fileName;

  @NotBlank(message = "File URL is required")
  @Size(max = 1000, message = "File URL must not exceed 1000 characters")
  private String fileUrl;

  @NotNull(message = "Media type is required")
  private MediaType mediaType;

  private Boolean primary;

  @NotNull(message = "Property ID is required")
  private Long propertyId;
}