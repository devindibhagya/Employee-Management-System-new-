require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./db');
const employeeRoutes = require('./routes/employees');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(','),
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/employees', employeeRoutes);

app.use('/api', (req, res) => res.status(404).json({ message: 'Route not found' }));

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON body' });
  }
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

initDatabase()
  .then(() => {
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('\nCould not connect to MySQL:', err.message);
    console.error('Check that MySQL is running and the credentials in backend/.env are correct.\n');
    process.exit(1);
  });
