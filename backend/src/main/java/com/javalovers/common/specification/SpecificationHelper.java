package com.javalovers.common.specification;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

public class SpecificationHelper {
    private SpecificationHelper() {
    }
    public static String insertRightWildcard(String value){
        if(value == null) return null;
        return value.concat("%");
    }
    public static String insertLeftWildcard(String value){
        if(value == null) return null;
        return "%".concat(value);
    }
    public static String surroundByWildcard(String value){
        if(value == null) return null;
        return "%".concat(value).concat("%");
    }

    public static <T extends Comparable<T>> SearchCriteria<T> generateEqualsCriteria(String key, T value){
        return new SearchCriteria<>(key, ":", value);
    }

    public static SearchCriteria<String> generateRightLikeCriteria(String key, String value){
        return new SearchCriteria<>(key, ":", insertRightWildcard(value));
    }

    public static SearchCriteria<String> generateLeftLikeCriteria(String key, String value){
        return new SearchCriteria<>(key, ":", insertLeftWildcard(value));
    }

    public static SearchCriteria<String> generateInnerLikeCriteria(String key, String value){
        return new SearchCriteria<>(key, ":", surroundByWildcard(value));
    }

    public static <T extends Comparable<T>> SearchCriteria<T> generateGreaterThanCriteria(String key, T value){
        return new SearchCriteria<>(key, ">", value);
    }

    public static <T extends Comparable<T>> SearchCriteria<T> generateLessThanCriteria(String key, T value){
        return new SearchCriteria<>(key, "<", value);
    }

    public static Predicate defaultLikeQuery(CriteriaBuilder criteriaBuilder, Expression<String> expression, String value){
        return criteriaBuilder.like(
                criteriaBuilder.lower(expression), value.toLowerCase());
    }

    public static <T> Specification<T> generateTrueSpecification() {
        return ((root, query, criteriaBuilder) -> criteriaBuilder.conjunction());
    }

    public static <T> Specification<T> generateFalseSpecification() {
        return ((root, query, criteriaBuilder) -> criteriaBuilder.disjunction());
    }

}
