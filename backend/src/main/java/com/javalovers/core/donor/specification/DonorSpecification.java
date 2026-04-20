package com.javalovers.core.donor.specification;

import com.javalovers.common.specification.BaseSpecification;
import com.javalovers.common.specification.SearchCriteria;
import com.javalovers.core.donor.domain.entity.Donor;

public class DonorSpecification extends BaseSpecification<Donor> {
    public DonorSpecification(SearchCriteria<?> searchCriteria) {super(searchCriteria);}
}
