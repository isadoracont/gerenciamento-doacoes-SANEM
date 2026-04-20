package com.javalovers.common.repository;

import com.javalovers.common.entity.SoftDeletable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Interface base para repositórios que suportam soft delete.
 * Todos os métodos padrão do JpaRepository são sobrescritos para
 * filtrar automaticamente registros deletados.
 */
@NoRepositoryBean
public interface SoftDeleteRepository<T extends SoftDeletable, ID> extends JpaRepository<T, ID> {

    /**
     * Busca uma entidade por ID, excluindo registros deletados.
     */
    @Query("SELECT e FROM #{#entityName} e WHERE e.id = :id AND e.deletedAt IS NULL")
    Optional<T> findById(@Param("id") ID id);

    /**
     * Busca todas as entidades não deletadas.
     */
    @Query("SELECT e FROM #{#entityName} e WHERE e.deletedAt IS NULL")
    List<T> findAll();

    /**
     * Conta entidades não deletadas.
     */
    @Query("SELECT COUNT(e) FROM #{#entityName} e WHERE e.deletedAt IS NULL")
    long count();

    /**
     * Verifica se existe uma entidade não deletada com o ID especificado.
     */
    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END FROM #{#entityName} e WHERE e.id = :id AND e.deletedAt IS NULL")
    boolean existsById(@Param("id") ID id);

    /**
     * Soft delete - marca a entidade como deletada sem removê-la fisicamente.
     */
    @Modifying
    @Query("UPDATE #{#entityName} e SET e.deletedAt = :deletedAt WHERE e.id = :id")
    void softDeleteById(@Param("id") ID id, @Param("deletedAt") LocalDateTime deletedAt);

    /**
     * Restaura uma entidade deletada (soft undelete).
     */
    @Modifying
    @Query("UPDATE #{#entityName} e SET e.deletedAt = NULL WHERE e.id = :id")
    void restoreById(@Param("id") ID id);

    /**
     * Busca todas as entidades, incluindo as deletadas.
     */
    @Query("SELECT e FROM #{#entityName} e")
    List<T> findAllIncludingDeleted();

    /**
     * Busca apenas entidades deletadas.
     */
    @Query("SELECT e FROM #{#entityName} e WHERE e.deletedAt IS NOT NULL")
    List<T> findAllDeleted();
}

