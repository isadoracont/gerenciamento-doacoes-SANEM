package com.javalovers.core.category.mapper;

import com.javalovers.core.category.domain.dto.request.CategoryFormDTO;
import com.javalovers.core.category.domain.entity.Category;
import org.springframework.stereotype.Service;

@Service
public class CategoryUpdateMapper {

    public void update(Category category, CategoryFormDTO categoryFormDTO) {
        category.setName(categoryFormDTO.name());
    }
}
