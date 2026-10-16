const express = require('express');
const { getPool } = require('../db');
const { validateEmployee, DEPARTMENTS } = require('../validate');

const router = express.Router();

const SORTABLE = {
  name: 'name',
  joining_date: 'joining_date',
  department: 'department',
  created_at: 'created_at',
};

const isDuplicate = (err) => err && err.code === 'ER_DUP_ENTRY';

router.get('/meta/departments', (req, res) => {
  res.json({ departments: DEPARTMENTS });
});

router.get('/meta/stats', async (req, res, next) => {
  try {
    const pool = getPool();
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM employees');
    const [byDepartment] = await pool.query(
      'SELECT department, COUNT(*) AS count FROM employees GROUP BY department ORDER BY count DESC'
    );
    const [[{ recent }]] = await pool.query(
      'SELECT COUNT(*) AS recent FROM employees WHERE joining_date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)'
    );
    const [latest] = await pool.query(
      'SELECT id, name, department, position, joining_date FROM employees ORDER BY created_at DESC, id DESC LIMIT 5'
    );
    const [monthly] = await pool.query(
      `SELECT DATE_FORMAT(joining_date, '%Y-%m') AS month, COUNT(*) AS count
         FROM employees GROUP BY month ORDER BY month DESC LIMIT 12`
    );
    res.json({
      total,
      recent,
      departments: byDepartment.length,
      byDepartment,
      latest,
      monthly: monthly.reverse(),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const pool = getPool();
    const search = String(req.query.search || '').trim();
    const department = String(req.query.department || '').trim();
    const sortBy = SORTABLE[req.query.sortBy] || 'created_at';
    const order = String(req.query.order).toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const offset = (page - 1) * limit;

    const where = [];
    const params = [];
    if (search) {
      where.push('(name LIKE ? OR email LIKE ? OR position LIKE ?)');
      const like = `%${search}%`;
      params.push(like, like, like);
    }
    if (department && department !== 'all') {
      where.push('department = ?');
      params.push(department);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM employees ${whereSql}`,
      params
    );
    const [rows] = await pool.query(
      `SELECT id, name, email, phone, department, position, joining_date
         FROM employees ${whereSql}
        ORDER BY ${sortBy} ${order}, id DESC
        LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      data: rows,
      pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id(\\d+)', async (req, res, next) => {
  try {
    const [rows] = await getPool().query(
      'SELECT id, name, email, phone, department, position, joining_date FROM employees WHERE id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Employee not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  const { errors, data } = validateEmployee(req.body);
  if (Object.keys(errors).length) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  try {
    const pool = getPool();
    const [result] = await pool.query(
      `INSERT INTO employees (name, email, phone, department, position, joining_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [data.name, data.email, data.phone, data.department, data.position, data.joining_date]
    );
    const [rows] = await pool.query('SELECT * FROM employees WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    if (isDuplicate(err)) {
      return res.status(409).json({
        message: 'Validation failed',
        errors: { email: 'An employee with this email already exists' },
      });
    }
    next(err);
  }
});

router.put('/:id(\\d+)', async (req, res, next) => {
  const { errors, data } = validateEmployee(req.body);
  if (Object.keys(errors).length) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  try {
    const pool = getPool();
    const [result] = await pool.query(
      `UPDATE employees
          SET name = ?, email = ?, phone = ?, department = ?, position = ?, joining_date = ?
        WHERE id = ?`,
      [data.name, data.email, data.phone, data.department, data.position, data.joining_date, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Employee not found' });
    const [rows] = await pool.query('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    if (isDuplicate(err)) {
      return res.status(409).json({
        message: 'Validation failed',
        errors: { email: 'An employee with this email already exists' },
      });
    }
    next(err);
  }
});

router.delete('/:id(\\d+)', async (req, res, next) => {
  try {
    const [result] = await getPool().query('DELETE FROM employees WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Employee not found' });
    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
