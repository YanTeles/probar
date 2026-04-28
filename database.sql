-- =====================================================
-- HOSTINGER MYSQL — Schema da tabela products
-- Execute isto no phpMyAdmin da Hostinger (ou mysql CLI)
-- =====================================================

CREATE TABLE IF NOT EXISTS products (
  id          BIGINT PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  price       DECIMAL(10,2) NOT NULL,
  category    VARCHAR(100),
  img         LONGTEXT,
  imgs        JSON,
  `desc`      TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

