package com.realestate.modules.Broker.repository;

import com.realestate.modules.Broker.entity.BrokerClient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BrokerClientRepository extends JpaRepository<BrokerClient, Long> {

    List<BrokerClient> findByBrokerId(Long brokerId);

    Page<BrokerClient> findByBrokerId(Long brokerId, Pageable pageable);

    Optional<BrokerClient> findByUserIdAndBrokerId(Long userId, Long brokerId);

    Optional<BrokerClient> findByEmailAndBrokerId(String email, Long brokerId);

    boolean existsByUserIdAndBrokerId(Long userId, Long brokerId);

    long countByBrokerId(Long brokerId);
}
