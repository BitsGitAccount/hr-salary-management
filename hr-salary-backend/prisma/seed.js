// @ts-nocheck
/* eslint-disable */
const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const fs = require('fs');
const path = require('path');

// Constants
const TOTAL_EMPLOYEES = 10000;
const CHUNK_SIZE = 2000;
const MANAGER_POOL_SIZE = 100;

// Data pools
const COUNTRIES = ['USA', 'UK', 'India', 'Canada', 'Germany'];
const JOB_TITLES = [
  'Software Engineer',
  'Senior Software Engineer',
  'Product Manager',
  'HR Specialist',
  'Data Analyst',
  'DevOps Engineer',
  'UX Designer',
  'QA Engineer',
  'Technical Lead',
  'Engineering Manager',
];
const VISIBILITY_STATUSES = ['VISIBLE_TO_ALL', 'MANAGER_ONLY', 'PRIVATE'];

// Salary ranges by job title
const SALARY_RANGES = {
  'Software Engineer': [70000, 120000],
  'Senior Software Engineer': [100000, 160000],
  'Product Manager': [90000, 150000],
  'HR Specialist': [50000, 80000],
  'Data Analyst': [65000, 110000],
  'DevOps Engineer': [80000, 140000],
  'UX Designer': [70000, 120000],
  'QA Engineer': [60000, 100000],
  'Technical Lead': [120000, 180000],
  'Engineering Manager': [140000, 200000],
};

// File parser function
function parseNamesFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

// Seeded random number generator
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function getRandomElement(arr, random) {
  return arr[Math.floor(random() * arr.length)];
}

function getRandomInt(min, max, random) {
  return Math.floor(random() * (max - min + 1)) + min;
}

// UUID generator
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function main() {
  console.log('🌱 Starting database seeding...\n');
  console.time('Total seeding time');

  // Initialize Prisma client
  const adapter = new PrismaLibSql({
    url: 'file:./prisma/dev.db',
  });
  const prisma = new PrismaClient({ adapter });

  try {
    // Load name files
    const dataDir = path.join(__dirname, '../data');
    const firstNames = parseNamesFile(path.join(dataDir, 'first_names.txt'));
    const lastNames = parseNamesFile(path.join(dataDir, 'last_names.txt'));

    console.log(`📁 Loaded ${firstNames.length} first names and ${lastNames.length} last names`);

    // Clear existing data
    console.log('🗑️  Clearing existing employee data...');
    await prisma.employee.deleteMany();

    // Generate employee data
    console.log(`📝 Generating ${TOTAL_EMPLOYEES} employee records...`);
    const random = seededRandom(42);
    const employees = [];

    // Pre-generate UUIDs for manager assignment
    const employeeIds = [];
    for (let i = 0; i < TOTAL_EMPLOYEES; i++) {
      employeeIds.push(generateUUID());
    }

    for (let i = 0; i < TOTAL_EMPLOYEES; i++) {
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
      const jobTitle = getRandomElement(JOB_TITLES, random);
      const country = getRandomElement(COUNTRIES, random);
      const salaryRange = SALARY_RANGES[jobTitle] || [50000, 100000];
      const salary = getRandomInt(salaryRange[0], salaryRange[1], random);
      const profileVisibilityStatus = getRandomElement(VISIBILITY_STATUSES, random);

      // Assign manager
      let managerId = null;
      if (i >= MANAGER_POOL_SIZE) {
        const managerIndex = Math.floor(random() * MANAGER_POOL_SIZE);
        managerId = employeeIds[managerIndex];
      }

      employees.push({
        id: employeeIds[i],
        firstName: `${firstName}${Math.floor(i / 100)}`,
        lastName: lastName,
        jobTitle,
        country,
        salary,
        managerId,
        profileVisibilityStatus,
      });
    }

    // Batch insert
    console.log(`📦 Inserting in chunks of ${CHUNK_SIZE}...`);
    let insertedCount = 0;

    for (let i = 0; i < employees.length; i += CHUNK_SIZE) {
      const chunk = employees.slice(i, i + CHUNK_SIZE);
      await prisma.employee.createMany({ data: chunk });
      insertedCount += chunk.length;
      console.log(`   ✓ Inserted ${insertedCount}/${TOTAL_EMPLOYEES} records`);
    }

    // Verify count
    const finalCount = await prisma.employee.count();
    console.log(`\n✅ Seeding complete! Total records: ${finalCount}`);

    // Sample data
    const sampleEmployees = await prisma.employee.findMany({
      take: 3,
      include: { manager: true },
    });
    console.log('\n📋 Sample records:');
    sampleEmployees.forEach((emp, idx) => {
      console.log(
        `   ${idx + 1}. ${emp.firstName} ${emp.lastName} - ${emp.jobTitle} (${emp.country}) - $${emp.salary}`
      );
      if (emp.manager) {
        console.log(`      Manager: ${emp.manager.firstName} ${emp.manager.lastName}`);
      }
    });
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.timeEnd('Total seeding time');
  }
}

main();
