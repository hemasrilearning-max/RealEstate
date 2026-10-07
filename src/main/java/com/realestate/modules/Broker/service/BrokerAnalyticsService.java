package com.realestate.modules.Broker.service;

import com.realestate.modules.Broker.dto.BrokerAnalyticsDTO;
import com.realestate.modules.lead.entity.Lead;
import com.realestate.modules.Broker.entity.BrokerTransaction;
import com.realestate.modules.Broker.repository.BrokerClientRepository;
import com.realestate.modules.lead.repository.LeadRepository;
import com.realestate.modules.Broker.repository.BrokerTransactionRepository;
import com.realestate.modules.Broker.exception.BrokerResourceNotFoundException;

import com.realestate.modules.property.entity.Property;
import com.realestate.modules.property.repository.PropertyRepository;

import com.realestate.modules.tour.entity.Tour;
import com.realestate.modules.tour.repository.TourRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class BrokerAnalyticsService {

    private final PropertyRepository propertyRepository;

    private final LeadRepository leadRepository;

    private final BrokerTransactionRepository brokerTransactionRepository;

    private final BrokerClientRepository brokerClientRepository;

    private final TourRepository tourRepository;


    /**
     * Get complete analytics for a broker.
     *
     * brokerId = users.id of the logged-in broker.
     */
    @Transactional(readOnly = true)
    public BrokerAnalyticsDTO getBrokerAnalytics(
            Long brokerId) {

        if (brokerId == null) {
            throw new BrokerResourceNotFoundException(
                    "Broker ID is required"
            );
        }


        /*
         * =========================================================
         * 1. PROPERTIES
         * =========================================================
         *
         * Property.broker -> User
         *
         * We use findByBroker_Id because your
         * BrokerPropertyService already uses:
         *
         * propertyRepository.findByBroker_Id(brokerId)
         */
        List<Property> properties =
                propertyRepository
                        .findByBroker_Id(brokerId)
                        .stream()
                        .toList();


        long totalProperties =
                properties.size();


        /*
         * =========================================================
         * 2. ACTIVE LISTINGS
         * =========================================================
         *
         * Count properties that are currently available/
         * active for customers.
         *
         * We intentionally support the statuses used by your
         * property lifecycle.
         */
        long activeListings =
                properties.stream()
                        .filter(this::isActiveProperty)
                        .count();


        /*
         * =========================================================
         * 3. PROPERTIES BY TYPE
         * =========================================================
         *
         * Example:
         *
         * FLAT  -> 5
         * VILLA -> 3
         * PLOT  -> 2
         */
        Map<String, Long> propertiesByType =
                new LinkedHashMap<>();

        properties.forEach(property -> {

            if (property.getPropertyType() == null) {
                return;
            }

            String type =
                    property.getPropertyType().name();

            propertiesByType.merge(
                    type,
                    1L,
                    Long::sum
            );
        });


        /*
         * =========================================================
         * 4. BUY VS RENT
         * =========================================================
         */
        Map<String, Long> buyVsRent =
                new LinkedHashMap<>();

        buyVsRent.put("buy", 0L);
        buyVsRent.put("rent", 0L);

        properties.forEach(property -> {

            if (property.getListingType() == null) {
                return;
            }

            String listingType =
                    property.getListingType()
                            .name()
                            .toUpperCase();

            if (listingType.contains("RENT")) {

                buyVsRent.merge(
                        "rent",
                        1L,
                        Long::sum
                );

            } else {

                /*
                 * Sale / Sell / Buy listings
                 * are considered Buy.
                 */
                buyVsRent.merge(
                        "buy",
                        1L,
                        Long::sum
                );
            }
        });


        /*
         * =========================================================
         * 5. LEADS
         * =========================================================
         *
         * Your Lead has brokerId.
         */
        List<Lead> leads = leadRepository.findByBrokerIdOrderByCreatedAtDesc(brokerId);


        long totalLeads =
                leads.size();


        /*
         * =========================================================
         * 6. LEADS BY STATUS
         * =========================================================
         *
         * Example:
         *
         * NEW        -> 5
         * CONTACTED  -> 3
         * QUALIFIED  -> 2
         * CONVERTED  -> 1
         */
        Map<String, Long> leadsByStatus =
                new LinkedHashMap<>();

        leads.forEach(lead -> {

            if (lead.getStatus() == null) {
                return;
            }

            String status =
                    lead.getStatus().name();

            leadsByStatus.merge(
                    status,
                    1L,
                    Long::sum
            );
        });


        /*
         * =========================================================
         * 7. TRANSACTIONS
         * =========================================================
         */
        List<BrokerTransaction> transactions =
                brokerTransactionRepository
                        .findByBrokerId(brokerId);


        /*
         * =========================================================
         * 8. CLOSED DEALS
         * =========================================================
         *
         * A completed transaction is treated as a closed deal.
         */
        long closedDeals =
                transactions.stream()
                        .filter(
                                this::isCompletedTransaction
                        )
                        .count();


        /*
         * =========================================================
         * 9. CONVERSION RATE
         * =========================================================
         *
         * Closed Deals / Total Leads * 100
         */
        double conversionRate = 0.0;

        if (totalLeads > 0) {

            conversionRate =
                    ((double) closedDeals
                            / totalLeads)
                            * 100.0;

            conversionRate =
                    Math.round(
                            conversionRate * 100.0
                    ) / 100.0;
        }


        /*
         * =========================================================
         * 10. CLIENTS
         * =========================================================
         *
         * BrokerClient contains brokerId.
         */
        long totalClients =
                brokerClientRepository
                        .countByBrokerId(brokerId);


        /*
         * =========================================================
         * 11. TOUR REQUESTS
         * =========================================================
         *
         * TourResponse contains propertyId but does not expose
         * brokerId.
         *
         * Therefore we find the broker's property IDs first,
         * then count tours belonging to those properties.
         */
        long totalTours = 0L;
        try {
            totalTours = tourRepository.findAll().stream()
                .filter(t -> t.getProperty() != null
                    && t.getProperty().getBroker() != null
                    && brokerId.equals(t.getProperty().getBroker().getId()))
                .count();
        } catch (Exception ignored) {
            totalTours = 0L;
        }

        if (!properties.isEmpty()) {

            List<Long> propertyIds =
                    properties.stream()
                            .map(Property::getId)
                            .filter(id -> id != null)
                            .toList();

            if (!propertyIds.isEmpty()) {

                totalTours =
                        tourRepository
                                .countByProperty_IdIn(
                                        propertyIds
                                );
            }
        }


        /*
         * =========================================================
         * 12. COMMISSION
         * =========================================================
         *
         * Your current BrokerTransactionDTO contains:
         *
         * amount
         * type
         * status
         * closingDate
         *
         * but does NOT contain a separate commission field.
         *
         * Therefore we should NOT treat transaction amount
         * as broker commission.
         */
        BigDecimal totalCommission =
                BigDecimal.ZERO;


        /*
         * =========================================================
         * 13. BUILD ANALYTICS RESPONSE
         * =========================================================
         */
        return BrokerAnalyticsDTO.builder()

                .brokerId(brokerId)

                .totalProperties(
                        totalProperties
                )

                .activeListings(
                        activeListings
                )

                .totalLeads(
                        totalLeads
                )

                .conversionRate(
                        conversionRate
                )

                .closedDeals(
                        closedDeals
                )

                .totalTours(
                        totalTours
                )

                .totalClients(
                        totalClients
                )

                .totalCommission(
                        totalCommission
                )

                .propertiesByType(
                        propertiesByType
                )

                .leadsByStatus(
                        leadsByStatus
                )

                .buyVsRent(
                        buyVsRent
                )

                .build();
    }


    /**
     * Determine whether a property is an active listing.
     */
    private boolean isActiveProperty(
            Property property) {

        if (property.getStatus() == null) {
            return false;
        }

        String status =
                property.getStatus()
                        .name()
                        .toUpperCase();

        return status.equals("ACTIVE")
                || status.equals("AVAILABLE")
                || status.equals("APPROVED");
    }


    /**
     * Determine whether a transaction is a
     * completed/closed transaction.
     */
    private boolean isCompletedTransaction(
            BrokerTransaction transaction) {

        if (transaction.getStatus() == null) {
            return false;
        }

        return "COMPLETED".equalsIgnoreCase(
                transaction.getStatus().name()
        );
    }
}