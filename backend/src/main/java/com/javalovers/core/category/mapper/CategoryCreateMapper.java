package com.javalovers.core.category.mapper;

import com.javalovers.core.category.domain.dto.request.CategoryFormDTO;
import com.javalovers.core.category.domain.entity.Category;
import org.springframework.stereotype.Service;

@Service
public class CategoryCreateMapper {

    public Category convert(CategoryFormDTO categoryFormDTO) {
        Category category = new Category();
        category.setName(categoryFormDTO.name());

        return category;
    }
}
