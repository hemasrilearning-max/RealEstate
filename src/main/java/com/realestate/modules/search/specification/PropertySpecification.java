package com.realestate.modules.search.specification;

import com.realestate.modules.property.entity.Property;
import com.realestate.modules.search.dto.request.PropertySearchRequest;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class PropertySpecification {

  private PropertySpecification() {
  }

  public static Specification<Property> filterBy(PropertySearchRequest request) {

    return (root, query, criteriaBuilder) -> {

      List<Predicate> predicates = new ArrayList<>();

      /*
       * Property filters
       */

      if (request.getPropertyType() != null) {
        predicates.add(
            criteriaBuilder.equal(
                root.get("propertyType"),
                request.getPropertyType()));
      }

      if (request.getListingType() != null) {
        predicates.add(
            criteriaBuilder.equal(
                root.get("listingType"),
                request.getListingType()));
      }

      if (request.getFurnishingStatus() != null) {
        predicates.add(
            criteriaBuilder.equal(
                root.get("furnishingStatus"),
                request.getFurnishingStatus()));
      }

      if (request.getMinPrice() != null) {
        predicates.add(
            criteriaBuilder.greaterThanOrEqualTo(
                root.get("price"),
                request.getMinPrice()));
      }

      if (request.getMaxPrice() != null) {
        predicates.add(
            criteriaBuilder.lessThanOrEqualTo(
                root.get("price"),
                request.getMaxPrice()));
      }

      if (request.getMinBedrooms() != null) {
        predicates.add(
            criteriaBuilder.greaterThanOrEqualTo(
                root.get("bedrooms"),
                request.getMinBedrooms()));
      }

      if (request.getMaxBedrooms() != null) {
        predicates.add(
            criteriaBuilder.lessThanOrEqualTo(
                root.get("bedrooms"),
                request.getMaxBedrooms()));
      }

      if (request.getMinBathrooms() != null) {
        predicates.add(
            criteriaBuilder.greaterThanOrEqualTo(
                root.get("bathrooms"),
                request.getMinBathrooms()));
      }

      if (request.getMaxBathrooms() != null) {
        predicates.add(
            criteriaBuilder.lessThanOrEqualTo(
                root.get("bathrooms"),
                request.getMaxBathrooms()));
      }

      if (request.getMinArea() != null) {
        predicates.add(
            criteriaBuilder.greaterThanOrEqualTo(
                root.get("area"),
                request.getMinArea()));
      }

      if (request.getMaxArea() != null) {
        predicates.add(
            criteriaBuilder.lessThanOrEqualTo(
                root.get("area"),
                request.getMaxArea()));
      }

      /*
       * Location filters
       */

      if (request.getCity() != null && !request.getCity().isBlank()) {

        Join<Property, Object> locationJoin = root.join("location", JoinType.INNER);

        predicates.add(
            criteriaBuilder.equal(
                criteriaBuilder.lower(
                    locationJoin.get("city")),
                request.getCity().trim().toLowerCase()));
      }

      if (request.getArea() != null && !request.getArea().isBlank()) {

        Join<Property, Object> locationJoin = root.join("location", JoinType.INNER);

        predicates.add(
            criteriaBuilder.equal(
                criteriaBuilder.lower(
                    locationJoin.get("area")),
                request.getArea().trim().toLowerCase()));
      }

      if (request.getPincode() != null && !request.getPincode().isBlank()) {

        Join<Property, Object> locationJoin = root.join("location", JoinType.INNER);

        predicates.add(
            criteriaBuilder.equal(
                locationJoin.get("pincode"),
                request.getPincode().trim()));
      }

      /*
       * Combine all filters using AND.
       */
      return criteriaBuilder.and(
          predicates.toArray(new Predicate[0]));
    };
  }
}