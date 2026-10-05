package com.realestate.modules.Broker.service;

import com.realestate.modules.Broker.dto.BrokerDashboardStatsDTO;
import com.realestate.modules.Broker.repository.BrokerLeadRepository;
import com.realestate.modules.Broker.repository.BrokerTransactionRepository;
import com.realestate.modules.Broker.entity.BrokerTransaction.TransactionStatus;
import com.realestate.modules.messaging.repository.MessageRepository;
import com.realestate.modules.tour.repository.TourRepository;
import com.realestate.modules.tour.enums.TourStatus;
import com.realestate.modules.property.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BrokerDashboardService {

    private final PropertyRepository propertyRepository;
    private final BrokerLeadRepository leadRepository;
    private final MessageRepository messageRepository;
    private final TourRepository tourRepository;
    private final BrokerTransactionRepository transactionRepository;

    public BrokerDashboardStatsDTO getDashboardStats(Long brokerId) {
        return BrokerDashboardStatsDTO.builder()
                //.totalProperties(propertyRepository.countByBrokerId(brokerId))
                .totalProperties(propertyRepository.countByBroker_Id(brokerId))
                .activeLeads(leadRepository.countByBrokerIdAndIsActiveTrue(brokerId))
                .unreadMessages(messageRepository.countByBrokerIdAndIsReadFalse(brokerId))
                .pendingTours(tourRepository.countByBrokerIdAndStatus(brokerId, TourStatus.PENDING))
                .totalViews(0L)
                .closedDeals(transactionRepository.countByBrokerIdAndStatus(brokerId, TransactionStatus.COMPLETED))
                .build();
    }
}
