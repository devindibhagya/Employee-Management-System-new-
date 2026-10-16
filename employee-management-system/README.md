# Employee Management System

A simple full-stack app to add, view, edit and delete employees.

- Frontend: React (Vite)
- Backend: Node.js + Express
- Database: MySQL

## What it does

- Add an employee (name, email, phone, department, position, joining date) with form validation
- Employee list with edit and delete buttons, and a confirmation popup before deleting
- Edit form that opens with the current details filled in
- Search, department filter, sorting (name / joining date) and pagination
- Dashboard with a donut chart (employees by department) and a bar chart (hires per month)
- Light and dark mode, works on mobile

## What you need

- Node.js 18 or newer
- MySQL running on your computer

## How to run

Backend:

```
cd backend
npm install
copy .env.example .env      (on Mac/Linux: cp .env.example .env)
```

Open `.env` and type your MySQL password in `DB_PASSWORD`. Then:

```
npm start
```

It runs on http://localhost:5000. The first time, it creates the `employee_management` database and the `employees` table by itself and adds 5 sample employees. If you would rather create the table yourself, the SQL is in `database/schema.sql`.

Frontend (new terminal):

```
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

## API

| Method | URL                  | What it does         |
| ------ | -------------------- | -------------------- |
| POST   | /api/employees       | add an employee      |
| GET    | /api/employees       | list employees       |
| GET    | /api/employees/:id   | get one employee     |
| PUT    | /api/employees/:id   | update an employee   |
| DELETE | /api/employees/:id   | delete an employee   |
| GET    | /api/employees/meta/stats | numbers for the dashboard charts |

The list also accepts `search`, `department`, `sortBy`, `order`, `page` and `limit` in the query string, for example `/api/employees?search=nimal&department=IT&page=1`.

## Folders

```
backend/    Express server, routes, MySQL connection
database/   schema.sql
frontend/   React app (pages, components, styles)
```

## If something goes wrong

- "Could not connect to MySQL": check that MySQL is running and the password in `backend/.env` is right.
- Port 5000 busy: change `PORT` in `backend/.env` and the proxy target in `frontend/vite.config.js`.
