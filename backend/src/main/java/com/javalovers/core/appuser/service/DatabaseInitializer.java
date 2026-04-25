package com.javalovers.core.appuser.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseInitializer implements CommandLineRunner {

  private final JdbcTemplate jdbcTemplate;

  @Override
  public void run(String... args) throws Exception {
    log.info("Iniciando verificação do banco de dados...");

    // Verificar se existem usuários
    Integer userCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM app_user", Integer.class);

    if (userCount == 0) {
      log.info("Banco vazio detectado. Executando scripts de inicialização...");
      executeScript("db/script-create-tables.sql");
      executeScript("db/script-insert-values.sql");
      log.info("Scripts de inicialização executados com sucesso!");
    } else {
      log.info("Banco já possui {} usuários. Pulando inicialização.", userCount);
    }

    // Verificar e adicionar coluna issue_date na tabela card se não existir
    checkAndAddIssueDateColumn();

    // Verificar e remover coluna category_id da tabela item se existir
    checkAndRemoveCategoryIdColumn();
  }

  private void checkAndAddIssueDateColumn() {
    try {
      // Verificar se a coluna issue_date existe na tabela card
      String checkColumnSql = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS " +
          "WHERE TABLE_SCHEMA = DATABASE() " +
          "AND TABLE_NAME = 'card' " +
          "AND COLUMN_NAME = 'issue_date'";

      Integer columnExists = jdbcTemplate.queryForObject(checkColumnSql, Integer.class);

      if (columnExists == null || columnExists == 0) {
        log.info("Coluna issue_date não encontrada na tabela card. Adicionando...");
        jdbcTemplate.execute("ALTER TABLE card ADD COLUMN issue_date TIMESTAMP(6) NULL");
        log.info("Coluna issue_date adicionada com sucesso!");
      } else {
        log.debug("Coluna issue_date já existe na tabela card.");
      }
    } catch (Exception e) {
      log.warn("Erro ao verificar/adicionar coluna issue_date: {}", e.getMessage());
      // Não lançar exceção para não impedir a inicialização da aplicação
    }
  }

  private void checkAndRemoveCategoryIdColumn() {
    try {
      // Verificar se a coluna category_id existe na tabela item
      String checkColumnSql = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS " +
          "WHERE TABLE_SCHEMA = DATABASE() " +
          "AND TABLE_NAME = 'item' " +
          "AND COLUMN_NAME = 'category_id'";

      Integer columnExists = jdbcTemplate.queryForObject(checkColumnSql, Integer.class);

      if (columnExists != null && columnExists > 0) {
        log.info("Coluna category_id encontrada na tabela item. Removendo...");

        // Primeiro, verificar e remover a foreign key constraint se existir
        String checkFkSql = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS " +
            "WHERE CONSTRAINT_SCHEMA = DATABASE() " +
            "AND TABLE_NAME = 'item' " +
            "AND CONSTRAINT_NAME = 'fk_item_category' " +
            "AND CONSTRAINT_TYPE = 'FOREIGN KEY'";

        Integer fkExists = jdbcTemplate.queryForObject(checkFkSql, Integer.class);

        if (fkExists != null && fkExists > 0) {
          try {
            jdbcTemplate.execute("ALTER TABLE item DROP FOREIGN KEY fk_item_category");
            log.info("Foreign key fk_item_category removida com sucesso!");
          } catch (Exception e) {
            log.warn("Erro ao remover foreign key fk_item_category: {}", e.getMessage());
          }
        } else {
          log.debug("Foreign key fk_item_category não existe.");
        }

        // Depois, remover a coluna
        jdbcTemplate.execute("ALTER TABLE item DROP COLUMN category_id");
        log.info("Coluna category_id removida com sucesso!");
      } else {
        log.debug("Coluna category_id não existe na tabela item.");
      }
    } catch (Exception e) {
      log.warn("Erro ao verificar/remover coluna category_id: {}", e.getMessage());
      // Não lançar exceção para não impedir a inicialização da aplicação
    }
  }

  private void executeScript(String scriptPath) {
    try {
      String script = Files.readString(Paths.get(scriptPath));
      String[] statements = script.split(";");

      for (String statement : statements) {
        statement = statement.trim();
        if (!statement.isEmpty() && !statement.startsWith("--")) {
          try {
            jdbcTemplate.execute(statement);
          } catch (Exception e) {
            log.warn("Erro ao executar statement: {}", statement.substring(0, Math.min(50, statement.length())));
          }
        }
      }
    } catch (IOException e) {
      log.error("Erro ao ler script: {}", scriptPath, e);
    }
  }
}
