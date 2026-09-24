package com.realestate.modules.media.repository;

import com.realestate.modules.media.entity.Media;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MediaRepository extends JpaRepository<Media, Long> {

  List<Media> findByPropertyId(Long propertyId);
}