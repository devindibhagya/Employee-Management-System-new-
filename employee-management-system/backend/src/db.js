const mysql = require('mysql2/promise');

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
const dbName = DB_NAME || 'employee_management';

const baseConfig = {
  host: DB_HOST || 'localhost',
  port: Number(DB_PORT) || 3306,
  user: DB_USER || 'root',
  password: DB_PASSWORD || '',
};

let pool;

const SEED = [
  ['Nimal Perera', 'nimal@example.com', '0771234567', 'IT', 'Software Engineer', '2024-01-15'],
  ['Kasuni Silva', 'kasuni@example.com', '0712345678', 'HR', 'HR Executive', '2024-02-10'],
  ['Sahan Fernando', 'sahan@example.com', '0763456789', 'Finance', 'Accountant', '2023-11-05'],
  ['Ruwani Jayasekara', 'ruwani@example.com', '0754567890', 'Marketing', 'Marketing Specialist', '2024-04-12'],
  ['Tharindu Ranasinghe', 'tharindu@example.com', '0785678901', 'IT', 'UX/UI Designer', '2024-05-20'],
];

async function initDatabase() {
  const bootstrap = await mysql.createConnection(baseConfig);
  await bootstrap.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await bootstrap.end();

  pool = mysql.createPool({
    ...baseConfig,
    database: dbName,
    waitForConnections: true,
    connectionLimit: 10,
    dateStrings: true,
  });

  await pool.query(`
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  // add some demo rows the first time (SEED_DATA=false to skip)
  if (process.env.SEED_DATA !== 'false') {
    const [[{ count }]] = await pool.query('SELECT COUNT(*) AS count FROM employees');
    if (count === 0) {
      await pool.query(
        'INSERT INTO employees (name, email, phone, department, position, joining_date) VALUES ?',
        [SEED]
      );
      console.log('Seeded sample employees');
    }
  }

  return pool;
}

const getPool = () => pool;

module.exports = { initDatabase, getPool };
