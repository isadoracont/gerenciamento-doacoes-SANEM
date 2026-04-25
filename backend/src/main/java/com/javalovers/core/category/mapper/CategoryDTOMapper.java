package com.javalovers.core.category.mapper;

import com.javalovers.core.category.domain.dto.response.CategoryDTO;
import com.javalovers.core.category.domain.entity.Category;
import org.springframework.stereotype.Service;

@Service
public class CategoryDTOMapper {

    public CategoryDTO convert(Category category) {
        if(category == null) return null;
        return new CategoryDTO(
                category.getCategoryId(),
                category.getName()
        );
    }
}
