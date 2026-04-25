package com.javalovers.core.category.specification;

import com.javalovers.common.specification.BaseSpecification;
import com.javalovers.common.specification.SearchCriteria;
import com.javalovers.core.category.domain.entity.Category;

public class CategorySpecification extends BaseSpecification<Category> {
    public CategorySpecification(SearchCriteria<?> searchCriteria) {super(searchCriteria);}
}
