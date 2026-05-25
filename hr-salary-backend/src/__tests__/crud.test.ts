import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

describe('Employee CRUD API', () => {
  let prisma: PrismaClient;
  let createdEmployeeIds: string[] = [];

  beforeAll(() => {
    const adapter = new PrismaLibSql({
      url: 'file:./prisma/dev.db',
    });
    prisma = new PrismaClient({ adapter });
  });

  afterAll(async () => {
    // Clean up created test employees
    for (const id of createdEmployeeIds) {
      try {
        await prisma.employee.delete({ where: { id } });
      } catch {
        // Ignore if already deleted
      }
    }
    await prisma.$disconnect();
  });

  describe('POST /api/employees', () => {
    it('should create an employee and return 201 with valid payload', async () => {
      const newEmployee = {
        firstName: 'Test',
        lastName: 'User',
        jobTitle: 'Software Engineer',
        country: 'USA',
        salary: 85000,
        profileVisibilityStatus: 'VISIBLE_TO_ALL',
      };

      const response = await request(app)
        .post('/api/employees')
        .send(newEmployee)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.firstName).toBe('Test');
      expect(response.body.lastName).toBe('User');
      expect(response.body.salary).toBe(85000);

      // Track for cleanup
      createdEmployeeIds.push(response.body.id);
    });

    it('should return 400 if required field firstName is missing', async () => {
      const invalidEmployee = {
        lastName: 'User',
        jobTitle: 'Software Engineer',
        country: 'USA',
        salary: 85000,
      };

      const response = await request(app)
        .post('/api/employees')
        .send(invalidEmployee)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if required field salary is missing', async () => {
      const invalidEmployee = {
        firstName: 'Test',
        lastName: 'User',
        jobTitle: 'Software Engineer',
        country: 'USA',
      };

      const response = await request(app)
        .post('/api/employees')
        .send(invalidEmployee)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/employees', () => {
    it('should return paginated employees with default page=1 and limit=10', async () => {
      const response = await request(app)
        .get('/api/employees')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toHaveProperty('page', 1);
      expect(response.body.meta).toHaveProperty('limit', 10);
      expect(response.body.meta).toHaveProperty('totalCount');
      expect(response.body.meta).toHaveProperty('totalPages');
    });

    it('should respect custom page and limit parameters', async () => {
      const response = await request(app)
        .get('/api/employees?page=2&limit=5')
        .expect(200);

      expect(response.body.meta.page).toBe(2);
      expect(response.body.meta.limit).toBe(5);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });

    it('should return correct totalPages calculation', async () => {
      const response = await request(app)
        .get('/api/employees?limit=100')
        .expect(200);

      const expectedTotalPages = Math.ceil(response.body.meta.totalCount / 100);
      expect(response.body.meta.totalPages).toBe(expectedTotalPages);
    });
  });

  describe('PUT /api/employees/:id', () => {
    let testEmployeeId: string;

    beforeAll(async () => {
      // Create an employee for update tests
      const response = await request(app)
        .post('/api/employees')
        .send({
          firstName: 'Update',
          lastName: 'Test',
          jobTitle: 'Junior Developer',
          country: 'Canada',
          salary: 60000,
        });
      testEmployeeId = response.body.id;
      createdEmployeeIds.push(testEmployeeId);
    });

    it('should update employee salary and return 200', async () => {
      const response = await request(app)
        .put(`/api/employees/${testEmployeeId}`)
        .send({ salary: 75000 })
        .expect(200);

      expect(response.body.salary).toBe(75000);
      expect(response.body.firstName).toBe('Update'); // Unchanged field
    });

    it('should update employee jobTitle and return 200', async () => {
      const response = await request(app)
        .put(`/api/employees/${testEmployeeId}`)
        .send({ jobTitle: 'Senior Developer' })
        .expect(200);

      expect(response.body.jobTitle).toBe('Senior Developer');
    });

    it('should return 404 if employee ID does not exist', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .put(`/api/employees/${fakeId}`)
        .send({ salary: 80000 })
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/employees/:id', () => {
    it('should delete an employee and return 204', async () => {
      // Create an employee to delete
      const createResponse = await request(app)
        .post('/api/employees')
        .send({
          firstName: 'Delete',
          lastName: 'Me',
          jobTitle: 'Temp Worker',
          country: 'UK',
          salary: 45000,
        });

      const employeeId = createResponse.body.id;

      await request(app)
        .delete(`/api/employees/${employeeId}`)
        .expect(204);

      // Verify employee is deleted
      await request(app)
        .get(`/api/employees/${employeeId}`)
        .expect(404);
    });

    it('should return 404 if employee ID does not exist', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .delete(`/api/employees/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
});
