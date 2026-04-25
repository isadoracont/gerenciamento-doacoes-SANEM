package com.javalovers.core.category.controller;

import com.javalovers.common.utils.HttpUtils;
import com.javalovers.core.category.domain.dto.request.CategoryFilterDTO;
import com.javalovers.core.category.domain.dto.request.CategoryFormDTO;
import com.javalovers.core.category.domain.dto.response.CategoryDTO;
import com.javalovers.core.category.domain.entity.Category;
import com.javalovers.core.category.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/category")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<Page<CategoryDTO>> listPaged(Pageable pageable, CategoryFilterDTO categoryFilterDTO) {
        Page<Category> categoryPage = categoryService.list(pageable, categoryFilterDTO);
        Page<CategoryDTO> categoryDTOPage = categoryService.generateCategoryDTOPage(categoryPage);

        return ResponseEntity.ok(categoryDTOPage);
    }

    @GetMapping("/all")
    public ResponseEntity<List<CategoryDTO>> list(CategoryFilterDTO categoryFilterDTO) {
        List<Category> categoryList = categoryService.list(categoryFilterDTO);
        List<CategoryDTO> categoryDTOList = categoryService.generateCategoryDTOList(categoryList);

        return ResponseEntity.ok(categoryDTOList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryDTO> get(@PathVariable Long id) {
        Category category = categoryService.getOrNull(id);
        if(category == null) return ResponseEntity.notFound().build();

        CategoryDTO categoryDTO = categoryService.generateCategoryDTO(category);

        return ResponseEntity.ok(categoryDTO);
    }

    @PostMapping
    public ResponseEntity<CategoryDTO> create(@RequestBody @Valid CategoryFormDTO categoryFormDTO, UriComponentsBuilder uriComponentsBuilder) {
        Category category = categoryService.generateCategory(categoryFormDTO);
        categoryService.save(category);

        URI uri = HttpUtils.createURI(uriComponentsBuilder, "category", category.getCategoryId());

        return ResponseEntity.created(uri).body(categoryService.generateCategoryDTO(category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> update(@PathVariable Long id, @RequestBody @Valid CategoryFormDTO categoryFormDTO) {
        Category category = categoryService.getOrNull(id);
        if(category == null) return ResponseEntity.notFound().build();

        categoryService.updateCategory(category, categoryFormDTO);

        categoryService.save(category);

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Category category = categoryService.getOrNull(id);
        if(category == null) return ResponseEntity.notFound().build();

        categoryService.delete(category);

        return ResponseEntity.noContent().build();
    }
}


