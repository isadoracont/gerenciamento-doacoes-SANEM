package com.javalovers.common.specification;

import jakarta.annotation.Nullable;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.lang.NonNull;

public class BaseSpecification<T> implements Specification<T> {
    private final SearchCriteria searchCriteria;
    private String key;

    public BaseSpecification(SearchCriteria<?> searchCriteria) {
        this.searchCriteria = searchCriteria;
    }

    public Predicate evaluateNull(CriteriaBuilder criteriaBuilder){
        return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
    }

    public Predicate  evaluateDefaultGraterThan(Path<?> p, CriteriaBuilder criteriaBuilder){
        return criteriaBuilder.greaterThanOrEqualTo(p.get(key), searchCriteria.getValue());
    }

    public Predicate evaluateDefaultLessThan(Path<?> p, CriteriaBuilder criteriaBuilder){
        return criteriaBuilder.lessThanOrEqualTo(p.get(key),searchCriteria.getValue());
    }

    public Predicate evaluateStringEqual(Path<?> p, CriteriaBuilder criteriaBuilder){
        String value = (String) searchCriteria.getValue();
        return SpecificationHelper.defaultLikeQuery(criteriaBuilder, p.get(key), value);
    }

    public Predicate evaluateDefaultEqual(Path<?> p, CriteriaBuilder criteriaBuilder){
        return criteriaBuilder.equal(p.get(key), searchCriteria.getValue());
    }

    private Path<?> getPath(Path<T> p){
        String[] attributes = searchCriteria.getKey().split("\\.");
        String attribute;
        int i = 0;
        for (; i < attributes.length - 1; i++) {
            attribute = attributes[i];
            p = p.get(attribute);
        }
        key = attributes[i];
        return p;
    }

    @Override
    @NonNull
    public Specification<T> and(@Nullable Specification<T> other) {
        return Specification.super.and(other);
    }

    @Override
    @NonNull
    public Specification<T> or(@Nullable Specification<T> other) {
        return Specification.super.or(other);
    }

    @Override
    public Predicate toPredicate(@NonNull Root<T> root, @NonNull CriteriaQuery<?> query, @NonNull CriteriaBuilder criteriaBuilder) {
        if(searchCriteria.getValue() == null) return evaluateNull(criteriaBuilder);
        Path<?> p = getPath(root);
        if (searchCriteria.getOperation().equalsIgnoreCase(">")) return evaluateDefaultGraterThan(p, criteriaBuilder);
        else if (searchCriteria.getOperation().equalsIgnoreCase("<")) return evaluateDefaultLessThan(p, criteriaBuilder);
        else if (searchCriteria.getOperation().equalsIgnoreCase(":")) {
            if (p.get(key).getJavaType() == String.class) return evaluateStringEqual(p, criteriaBuilder);
            return evaluateDefaultEqual(p, criteriaBuilder);
        }

        return null;
    }

}

