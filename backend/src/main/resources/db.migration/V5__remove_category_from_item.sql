-- =====================================================================
-- Migration: Remove category_id from item table
-- =====================================================================

-- Remover a foreign key constraint primeiro
ALTER TABLE item DROP CONSTRAINT IF EXISTS fk_item_category;

-- Remover a coluna category_id
ALTER TABLE item DROP COLUMN IF EXISTS category_id;

