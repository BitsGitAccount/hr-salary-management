import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

// Initialize Prisma client
const adapter = new PrismaLibSql({
  url: 'file:./prisma/dev.db',
});
const prisma = new PrismaClient({ adapter });

/**
 * Get salary insights by country
 * GET /api/insights/country
 */
export async function getInsightsByCountry(_req: Request, res: Response): Promise<void> {
  try {
    // Get all employees for aggregation
    const employees = await prisma.employee.findMany({
      select: {
        salary: true,
        country: true,
      },
    });

    if (employees.length === 0) {
      res.json({
        summary: {
          totalPayroll: 0,
          averageSalary: 0,
          highestSalary: 0,
          lowestSalary: 0,
          employeeCount: 0,
        },
        byCountry: [],
      });
      return;
    }

    // Calculate summary statistics
    const salaries = employees.map(e => e.salary);
    const totalPayroll = salaries.reduce((sum, s) => sum + s, 0);
    const averageSalary = Math.round(totalPayroll / employees.length);
    const highestSalary = Math.max(...salaries);
    const lowestSalary = Math.min(...salaries);

    // Group by country
    const countryMap = new Map<string, { total: number; count: number }>();
    for (const emp of employees) {
      const existing = countryMap.get(emp.country);
      if (existing) {
        existing.total += emp.salary;
        existing.count += 1;
      } else {
        countryMap.set(emp.country, { total: emp.salary, count: 1 });
      }
    }

    const byCountry = Array.from(countryMap.entries()).map(([country, data]) => ({
      country,
      averageSalary: Math.round(data.total / data.count),
      employeeCount: data.count,
    }));

    // Sort by employee count descending
    byCountry.sort((a, b) => b.employeeCount - a.employeeCount);

    res.json({
      summary: {
        totalPayroll,
        averageSalary,
        highestSalary,
        lowestSalary,
        employeeCount: employees.length,
      },
      byCountry,
    });
  } catch (error) {
    console.error('Error fetching insights:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
