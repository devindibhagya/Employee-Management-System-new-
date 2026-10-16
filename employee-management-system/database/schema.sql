-- Optional: the backend creates this automatically on first start.
-- Run manually only if you prefer to set up the database yourself.

CREATE DATABASE IF NOT EXISTS employee_management
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE employee_management;

CREATE TABLE IF NOT EXISTS employees (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name         VARCHAR(100) NOT NULL,
  email        VARCHAR(150) NOT NULL,
  phone        VARCHAR(20)  NOT NULL,
  department   VARCHAR(50)  NOT NULL,
  position     VARCHAR(100) NOT NULL,
  joining_date DATE         NOT NULL,
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_employees_email (email),
  KEY idx_employees_department (department),
  KEY idx_employees_joining_date (joining_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
