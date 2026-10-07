
package com.realestate.modules.Broker.service;

import com.realestate.modules.Broker.dto.BrokerDashboardStatsDTO;
import com.realestate.modules.Broker.entity.BrokerTransaction.TransactionStatus;
import com.realestate.modules.lead.repository.LeadRepository;
import com.realestate.modules.Broker.repository.BrokerTransactionRepository;
import com.realestate.modules.messaging.repository.MessageRepository;
import com.realestate.modules.property.repository.PropertyRepository;
import com.realestate.modules.tour.enums.TourStatus;
import com.realestate.modules.tour.repository.TourRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BrokerDashboardService {

    private final PropertyRepository propertyRepository;
    private final LeadRepository leadRepository;
    private final MessageRepository messageRepository;
    private final TourRepository tourRepository;
    private final BrokerTransactionRepository transactionRepository;

    public BrokerDashboardStatsDTO getDashboardStats(Long brokerId) {

        if (brokerId == null) {
            throw new IllegalArgumentException("Broker ID is required");
        }

        /*
         * ---------------------------------------------------------
         * TOTAL PROPERTIES
         * ---------------------------------------------------------
         *
         * Property.broker is a User relationship:
         *
         * private User broker;
         *
         * Therefore:
         *
         * countByBroker_Id(...)
         */
        long totalProperties = 0L;

        try {
            totalProperties =
                    propertyRepository.countByBroker_Id(brokerId);
        } catch (Exception e) {
            System.out.println(
                    "Unable to count properties for broker "
                            + brokerId
                            + ": "
                            + e.getMessage()
            );
        }

        /*
         * ---------------------------------------------------------
         * ACTIVE LEADS
         * ---------------------------------------------------------
         */
        long activeLeads = 0L;

        try {
            activeLeads =
                    leadRepository.findByBrokerIdOrderByCreatedAtDesc(brokerId).size();
        } catch (Exception e) {
            System.out.println(
                    "Unable to count active leads for broker "
                            + brokerId
                            + ": "
                            + e.getMessage()
            );
        }

        /*
         * ---------------------------------------------------------
         * UNREAD MESSAGES
         * ---------------------------------------------------------
         */
        long unreadMessages = 0L;

        try {
            unreadMessages =
                    messageRepository.countByBrokerIdAndIsReadFalse(brokerId);
        } catch (Exception e) {
            System.out.println(
                    "Unable to count unread messages for broker "
                            + brokerId
                            + ": "
                            + e.getMessage()
            );
        }

        /*
         * ---------------------------------------------------------
         * PENDING TOURS
         * ---------------------------------------------------------
         */
        long pendingTours = 0L;

        try {
            pendingTours =
                    tourRepository.countByBrokerIdAndStatus(
                            brokerId,
                            TourStatus.PENDING
                    );
        } catch (Exception e) {
            System.out.println(
                    "Unable to count pending tours for broker "
                            + brokerId
                            + ": "
                            + e.getMessage()
            );
        }

        /*
         * ---------------------------------------------------------
         * CLOSED / COMPLETED DEALS
         * ---------------------------------------------------------
         */
        long closedDeals = 0L;

        try {
            closedDeals =
                    transactionRepository.countByBrokerIdAndStatus(
                            brokerId,
                            TransactionStatus.COMPLETED
                    );
        } catch (Exception e) {
            System.out.println(
                    "Unable to count completed deals for broker "
                            + brokerId
                            + ": "
                            + e.getMessage()
            );
        }

        /*
         * ---------------------------------------------------------
         * TOTAL PROPERTY VIEWS
         * ---------------------------------------------------------
         *
         * Property views are not currently connected to a
         * repository/query in the broker dashboard.
         *
         * Keep this at 0 until property view tracking is added.
         */
        long totalViews = 0L;

        /*
         * ---------------------------------------------------------
         * CONVERSION RATE
         * ---------------------------------------------------------
         *
         * Conversion Rate =
         *
         * Closed Deals / Active Leads * 100
         */
        double conversionRate = 0.0;

        if (activeLeads > 0) {
            conversionRate =
                    ((double) closedDeals / activeLeads) * 100.0;

            conversionRate =
                    Math.round(conversionRate * 100.0) / 100.0;
        }

        /*
         * ---------------------------------------------------------
         * BUILD DASHBOARD RESPONSE
         * ---------------------------------------------------------
         */
        return BrokerDashboardStatsDTO.builder()
                .totalProperties(totalProperties)
                .activeLeads(activeLeads)
                .unreadMessages(unreadMessages)
                .pendingTours(pendingTours)
                .totalViews(totalViews)
                .closedDeals(closedDeals)
                .conversionRate(conversionRate)
                .build();
    }
}

