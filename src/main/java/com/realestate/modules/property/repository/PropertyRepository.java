package com.realestate.modules.property.repository;

import com.realestate.modules.property.entity.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface PropertyRepository
    extends JpaRepository<Property, Long>,
    JpaSpecificationExecutor<Property> {

  List<Property> findBySellerId(Long sellerId);
}