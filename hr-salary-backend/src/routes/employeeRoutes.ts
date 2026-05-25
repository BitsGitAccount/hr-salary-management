import { Router } from 'express';
import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from '../controllers/employeeController';

const router = Router();

// POST /api/employees - Create a new employee
router.post('/', createEmployee);

// GET /api/employees - Get all employees with pagination
router.get('/', getEmployees);

// GET /api/employees/:id - Get a single employee by ID
router.get('/:id', getEmployeeById);

// PUT /api/employees/:id - Update an employee
router.put('/:id', updateEmployee);

// DELETE /api/employees/:id - Delete an employee
router.delete('/:id', deleteEmployee);

export default router;
