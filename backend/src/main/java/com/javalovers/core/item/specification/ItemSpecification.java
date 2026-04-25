package com.javalovers.core.item.specification;

import com.javalovers.common.specification.BaseSpecification;
import com.javalovers.common.specification.SearchCriteria;
import com.javalovers.core.item.domain.entity.Item;

public class ItemSpecification extends BaseSpecification<Item> {
    public ItemSpecification(SearchCriteria<?> searchCriteria) {super(searchCriteria);}
}
