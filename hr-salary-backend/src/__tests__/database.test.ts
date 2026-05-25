import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

describe('Database Operations', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    const adapter = new PrismaLibSql({
      url: 'file:./prisma/dev.db',
    });
    prisma = new PrismaClient({ adapter });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create and query an employee record', async () => {
    // Create a test employee
    const testEmployee = await prisma.employee.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        jobTitle: 'Software Engineer',
        country: 'USA',
        salary: 100000,
        profileVisibilityStatus: 'VISIBLE_TO_ALL',
      },
    });

    expect(testEmployee).toBeDefined();
    expect(testEmployee.id).toBeDefined();
    expect(testEmployee.firstName).toBe('John');
    expect(testEmployee.lastName).toBe('Doe');

    // Query the employee back
    const queriedEmployee = await prisma.employee.findUnique({
      where: { id: testEmployee.id },
    });

    expect(queriedEmployee).toBeDefined();
    expect(queriedEmployee?.firstName).toBe('John');
    expect(queriedEmployee?.salary).toBe(100000);

    // Clean up
    await prisma.employee.delete({
      where: { id: testEmployee.id },
    });
  });

  it('should support self-referencing manager relationship', async () => {
    // Create a manager
    const manager = await prisma.employee.create({
      data: {
        firstName: 'Jane',
        lastName: 'Smith',
        jobTitle: 'Engineering Manager',
        country: 'USA',
        salary: 150000,
        profileVisibilityStatus: 'VISIBLE_TO_ALL',
      },
    });

    // Create a subordinate with manager reference
    const subordinate = await prisma.employee.create({
      data: {
        firstName: 'Bob',
        lastName: 'Johnson',
        jobTitle: 'Junior Developer',
        country: 'USA',
        salary: 70000,
        managerId: manager.id,
        profileVisibilityStatus: 'MANAGER_ONLY',
      },
    });

    // Query subordinate with manager included
    const employeeWithManager = await prisma.employee.findUnique({
      where: { id: subordinate.id },
      include: { manager: true },
    });

    expect(employeeWithManager?.manager).toBeDefined();
    expect(employeeWithManager?.manager?.firstName).toBe('Jane');

    // Query manager with subordinates included
    const managerWithSubordinates = await prisma.employee.findUnique({
      where: { id: manager.id },
      include: { subordinates: true },
    });

    expect(managerWithSubordinates?.subordinates).toHaveLength(1);
    expect(managerWithSubordinates?.subordinates[0].firstName).toBe('Bob');

    // Clean up (delete subordinate first due to FK constraint)
    await prisma.employee.delete({ where: { id: subordinate.id } });
    await prisma.employee.delete({ where: { id: manager.id } });
  });
});
