package com.javalovers.common.specification;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class SearchCriteria <T extends Comparable<T>> {
    private String key;
    private String operation;
    private T value;
}

