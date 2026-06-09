import { PrismaClient } from "@prisma/client";
import { COMPANIES, SALARIES } from "../src/lib/seedData";
import { normalizeCompanyName, calculateTotalCompensation } from "../src/lib/normalize";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // Clean the database
  try {
    await prisma.savedComparison.deleteMany({});
    await prisma.salaryEntry.deleteMany({});
    await prisma.company.deleteMany({});
    await prisma.user.deleteMany({});
    console.log("Cleaned existing data.");
  } catch (err) {
    console.log("Database tables do not exist yet or connection failed. Proceeding with creation.");
  }

  // Create companies
  const companyMap = new Map<string, string>();
  for (const c of COMPANIES) {
    const normalized = normalizeCompanyName(c.name);
    const dbCompany = await prisma.company.create({
      data: {
        name: c.name,
        normalizedName: normalized,
        logo: c.logo,
        headquarters: c.headquarters,
        industry: c.industry,
      },
    });
    companyMap.set(c.name, dbCompany.id);
  }
  console.log(`Created ${COMPANIES.length} companies.`);

  // Create default admin user
  const adminUser = await prisma.user.create({
    data: {
      name: "CompIntel Admin",
      email: "admin@compintel.com",
      password: "adminpassword123", // Plain text or hash depending on system. For seed, plain text is fine, but in auth we hash it.
    },
  });
  console.log("Created admin user.");

  // Create salary entries
  let count = 0;
  for (const s of SALARIES) {
    const companyId = companyMap.get(s.companyName);
    if (!companyId) continue;

    const tc = calculateTotalCompensation(s.baseSalary, s.bonus, s.stock);

    await prisma.salaryEntry.create({
      data: {
        companyId,
        userId: adminUser.id,
        role: s.role,
        level: s.level,
        location: s.location,
        baseSalary: s.baseSalary,
        bonus: s.bonus,
        stock: s.stock,
        totalCompensation: tc,
        createdAt: new Date(s.createdAt),
      },
    });
    count++;
  }

  console.log(`Successfully seeded ${count} salary entries!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
