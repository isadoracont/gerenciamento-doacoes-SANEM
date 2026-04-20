package com.javalovers.core.category.service;

import com.javalovers.common.specification.SearchCriteria;
import com.javalovers.common.specification.SpecificationHelper;
import com.javalovers.core.category.domain.dto.request.CategoryFilterDTO;
import com.javalovers.core.category.domain.dto.request.CategoryFormDTO;
import com.javalovers.core.category.domain.dto.response.CategoryDTO;
import com.javalovers.core.category.domain.entity.Category;
import com.javalovers.core.category.mapper.CategoryCreateMapper;
import com.javalovers.core.category.mapper.CategoryDTOMapper;
import com.javalovers.core.category.mapper.CategoryUpdateMapper;
import com.javalovers.core.category.repository.CategoryRepository;
import com.javalovers.core.category.specification.CategorySpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryCreateMapper categoryCreateMapper;
    private final CategoryDTOMapper categoryDTOMapper;
    private final CategoryUpdateMapper categoryUpdateMapper;

    public Category generateCategory(CategoryFormDTO categoryFormDTO) {
        return categoryCreateMapper.convert(categoryFormDTO);
    }

    public void save (Category category) {
        categoryRepository.save(category);
    }

    public CategoryDTO generateCategoryDTO(Category category) {
        return categoryDTOMapper.convert(category);
    }

    public Category getOrNull(Long id){
        return categoryRepository.findById(id).orElse(null);
    }

    public void updateCategory(Category category, CategoryFormDTO categoryFormDTO) {
        categoryUpdateMapper.update(category, categoryFormDTO);
    }

    @org.springframework.transaction.annotation.Transactional
    public void delete(Category category) {
        category.softDelete();
        categoryRepository.save(category);
    }

    public List<Category> list(CategoryFilterDTO categoryFilterDTO) {
        Specification<Category> categorySpecification = generateSpecification(categoryFilterDTO);
        return categoryRepository.findAll(categorySpecification);
    }

    public Page<Category> list(Pageable pageable, CategoryFilterDTO categoryFilterDTO) {
        Specification<Category> categorySpecification = generateSpecification(categoryFilterDTO);
        return categoryRepository.findAll(categorySpecification, pageable);
    }

    private Specification<Category> generateSpecification(CategoryFilterDTO categoryFilterDTO) {
        SearchCriteria<String> nameCriteria = SpecificationHelper.generateInnerLikeCriteria("name", categoryFilterDTO.name());

        Specification<Category> nameSpecification = new CategorySpecification(nameCriteria);

        return Specification.where(nameSpecification);
    }

    public Page<CategoryDTO> generateCategoryDTOPage(Page<Category> categoryPage) {
        return categoryPage.map(this::generateCategoryDTO);
    }

    public List<CategoryDTO> generateCategoryDTOList(List<Category> categoryList) {
        return categoryList.stream().map(categoryDTOMapper::convert).toList();
    }

}
