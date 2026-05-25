import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

// Initialize Prisma client
const adapter = new PrismaLibSql({
  url: 'file:./prisma/dev.db',
});
const prisma = new PrismaClient({ adapter });

// Valid profile visibility statuses
const VALID_VISIBILITY_STATUSES = ['VISIBLE_TO_ALL', 'MANAGER_ONLY', 'PRIVATE'];

/**
 * Create a new employee
 * POST /api/employees
 */
export async function createEmployee(req: Request, res: Response): Promise<void> {
  try {
    const { firstName, lastName, jobTitle, country, salary, managerId, profileVisibilityStatus } = req.body;

    // Validate required fields
    const missingFields: string[] = [];
    if (!firstName) missingFields.push('firstName');
    if (!lastName) missingFields.push('lastName');
    if (!jobTitle) missingFields.push('jobTitle');
    if (!country) missingFields.push('country');
    if (salary === undefined || salary === null) missingFields.push('salary');

    if (missingFields.length > 0) {
      res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
      return;
    }

    // Validate salary is a positive number
    if (typeof salary !== 'number' || salary <= 0) {
      res.status(400).json({ error: 'Salary must be a positive number' });
      return;
    }

    // Validate profileVisibilityStatus if provided
    if (profileVisibilityStatus && !VALID_VISIBILITY_STATUSES.includes(profileVisibilityStatus)) {
      res.status(400).json({ error: `Invalid profileVisibilityStatus. Must be one of: ${VALID_VISIBILITY_STATUSES.join(', ')}` });
      return;
    }

    // Validate managerId exists if provided
    if (managerId) {
      const manager = await prisma.employee.findUnique({ where: { id: managerId } });
      if (!manager) {
        res.status(404).json({ error: 'Manager not found' });
        return;
      }
    }

    // Create the employee
    const employee = await prisma.employee.create({
      data: {
        firstName,
        lastName,
        jobTitle,
        country,
        salary,
        managerId: managerId || null,
        profileVisibilityStatus: profileVisibilityStatus || 'VISIBLE_TO_ALL',
      },
    });

    res.status(201).json(employee);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get all employees with pagination
 * GET /api/employees
 */
export async function getEmployees(req: Request, res: Response): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    const [employees, totalCount] = await Promise.all([
      prisma.employee.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.employee.count(),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      data: employees,
      meta: {
        page,
        limit,
        totalCount,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get a single employee by ID
 * GET /api/employees/:id
 */
export async function getEmployeeById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: { manager: true, subordinates: true },
    });

    if (!employee) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }

    res.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Update an employee
 * PUT /api/employees/:id
 */
export async function updateEmployee(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { firstName, lastName, jobTitle, country, salary, managerId, profileVisibilityStatus } = req.body;

    // Check if employee exists
    const existingEmployee = await prisma.employee.findUnique({ where: { id } });
    if (!existingEmployee) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }

    // Validate salary if provided
    if (salary !== undefined && (typeof salary !== 'number' || salary <= 0)) {
      res.status(400).json({ error: 'Salary must be a positive number' });
      return;
    }

    // Validate profileVisibilityStatus if provided
    if (profileVisibilityStatus && !VALID_VISIBILITY_STATUSES.includes(profileVisibilityStatus)) {
      res.status(400).json({ error: `Invalid profileVisibilityStatus. Must be one of: ${VALID_VISIBILITY_STATUSES.join(', ')}` });
      return;
    }

    // Validate managerId exists if provided
    if (managerId) {
      const manager = await prisma.employee.findUnique({ where: { id: managerId } });
      if (!manager) {
        res.status(404).json({ error: 'Manager not found' });
        return;
      }
    }

    // Build update data object with only provided fields
    const updateData: Record<string, unknown> = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (jobTitle !== undefined) updateData.jobTitle = jobTitle;
    if (country !== undefined) updateData.country = country;
    if (salary !== undefined) updateData.salary = salary;
    if (managerId !== undefined) updateData.managerId = managerId;
    if (profileVisibilityStatus !== undefined) updateData.profileVisibilityStatus = profileVisibilityStatus;

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: updateData,
    });

    res.json(updatedEmployee);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Delete an employee
 * DELETE /api/employees/:id
 */
export async function deleteEmployee(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Check if employee exists
    const existingEmployee = await prisma.employee.findUnique({ where: { id } });
    if (!existingEmployee) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }

    // Remove manager reference from subordinates before deleting
    await prisma.employee.updateMany({
      where: { managerId: id },
      data: { managerId: null },
    });

    await prisma.employee.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
