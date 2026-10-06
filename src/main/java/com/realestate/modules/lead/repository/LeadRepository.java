
package com.realestate.modules.lead.repository;

import com.realestate.modules.lead.entity.Lead;
import com.realestate.modules.lead.enums.LeadStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LeadRepository extends JpaRepository<Lead, Long> {

  List<Lead> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);

  List<Lead> findBySellerIdOrderByCreatedAtDesc(Long sellerId);

  List<Lead> findByBrokerIdOrderByCreatedAtDesc(Long brokerId);

  List<Lead> findByPropertyIdOrderByCreatedAtDesc(Long propertyId);

  List<Lead> findByStatusOrderByCreatedAtDesc(LeadStatus status);

  /*
   * Total number of leads for a property.
   */
  long countByPropertyId(Long propertyId);
}

