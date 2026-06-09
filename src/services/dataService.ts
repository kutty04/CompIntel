import { prisma } from "../lib/prisma";
import { COMPANIES as seedCompanies, SALARIES as seedSalaries } from "../lib/seedData";
import { normalizeCompanyName, calculateTotalCompensation, normalizeLevelName } from "../lib/normalize";

// In-Memory Database Fallback State
let mockCompanies: any[] = [];
let mockSalaries: any[] = [];
let mockUsers: any[] = [
  {
    id: "admin-user-id",
    name: "CompIntel Admin",
    email: "admin@compintel.com",
    password: "adminpassword123", // Simple default password for testing
    createdAt: new Date()
  }
];
let mockSavedComparisons: any[] = [];
let mockSharedComparisons: any[] = [];

// Initialize Mock Data
function initMockData() {
  if (mockCompanies.length > 0) return;

  // Setup mock companies
  mockCompanies = seedCompanies.map((c, index) => ({
    id: `company-${index + 1}`,
    name: c.name,
    normalizedName: normalizeCompanyName(c.name),
    logo: c.logo,
    headquarters: c.headquarters,
    industry: c.industry
  }));

  // Setup mock salaries
  mockSalaries = seedSalaries.map((s, index) => {
    const company = mockCompanies.find(c => c.name === s.companyName) || mockCompanies[0];
    const tc = calculateTotalCompensation(s.baseSalary, s.bonus, s.stock);
    const normalizedLevel = normalizeLevelName(s.level, s.companyName);
    return {
      id: `salary-${index + 1}`,
      companyId: company.id,
      company: company,
      userId: "admin-user-id",
      role: s.role,
      level: normalizedLevel,
      rawLevel: s.level,
      normalizedLevel: normalizedLevel,
      location: s.location,
      baseSalary: s.baseSalary,
      bonus: s.bonus,
      stock: s.stock,
      totalCompensation: tc,
      createdAt: new Date(s.createdAt)
    };
  });
}

// Check database connection state
let isDbActive: boolean | null = null;

async function checkDbConnection(): Promise<boolean> {
  if (isDbActive !== null) return isDbActive;
  
  const isProduction = process.env.NODE_ENV === "production";

  if (!process.env.DATABASE_URL) {
    if (isProduction) {
      console.error("CRITICAL ERROR: DATABASE_URL environment variable is missing in PRODUCTION environment.");
      isDbActive = false;
      return false;
    }
    console.warn("DATABASE_URL not set. Falling back to In-Memory mock data.");
    initMockData();
    isDbActive = false;
    return false;
  }

  try {
    // 3-second timeout for quick fallback check
    const connectPromise = prisma.$connect();
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000));
    await Promise.race([connectPromise, timeoutPromise]);
    
    console.log("PostgreSQL Database connected successfully via Prisma.");
    isDbActive = true;
    return true;
  } catch (err) {
    if (isProduction) {
      console.error("CRITICAL ERROR: PostgreSQL connection failed in PRODUCTION environment.", err);
      isDbActive = false;
      return false;
    }
    console.warn("PostgreSQL connection failed. Falling back to In-Memory mock data.", err);
    initMockData();
    isDbActive = false;
    return false;
  }
}

export const dataService = {
  async getSalaries(filters: {
    company?: string;
    location?: string;
    role?: string;
    level?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 15;
    const skip = (page - 1) * limit;

    const useDb = await checkDbConnection();
    const isProduction = process.env.NODE_ENV === "production";

    if (useDb) {
      try {
        const whereClause: any = {};
        
        if (filters.company) {
          whereClause.company = {
            name: {
              contains: filters.company,
              mode: "insensitive"
            }
          };
        }
        if (filters.location) {
          whereClause.location = {
            equals: filters.location,
            mode: "insensitive"
          };
        }
        if (filters.role) {
          whereClause.role = {
            equals: filters.role,
            mode: "insensitive"
          };
        }
        if (filters.level) {
          // Check against level (normalized)
          whereClause.level = {
            equals: filters.level,
            mode: "insensitive"
          };
        }

        // Sorting
        let orderBy: any = { createdAt: "desc" };
        if (filters.sortBy === "tc-desc") {
          orderBy = { totalCompensation: "desc" };
        } else if (filters.sortBy === "base-desc") {
          orderBy = { baseSalary: "desc" };
        } else if (filters.sortBy === "company-asc") {
          orderBy = { company: { name: "asc" } };
        }

        const [items, total] = await Promise.all([
          prisma.salaryEntry.findMany({
            where: whereClause,
            include: { 
              company: {
                select: {
                  id: true,
                  name: true,
                  logo: true
                }
              } 
            },
            orderBy,
            skip,
            take: limit
          }),
          prisma.salaryEntry.count({ where: whereClause })
        ]);

        return { items, entries: items, total, page, limit, totalPages: Math.ceil(total / limit) };
      } catch (err) {
        console.error("Prisma error in getSalaries:", err);
        if (isProduction) {
          throw new Error("Service Temporarily Unavailable: Database query failed.");
        }
      }
    } else if (isProduction) {
      throw new Error("Service Temporarily Unavailable: Database connection offline.");
    }

    // Fallback: In-Memory (Development only)
    initMockData();
    let filtered = [...mockSalaries];

    if (filters.company) {
      const query = filters.company.toLowerCase();
      filtered = filtered.filter(s => s.company.name.toLowerCase().includes(query));
    }
    if (filters.location) {
      const query = filters.location.toLowerCase();
      filtered = filtered.filter(s => s.location.toLowerCase() === query);
    }
    if (filters.role) {
      const query = filters.role.toLowerCase();
      filtered = filtered.filter(s => s.role.toLowerCase() === query);
    }
    if (filters.level) {
      const query = filters.level.toLowerCase();
      filtered = filtered.filter(s => s.level.toLowerCase() === query);
    }

    // Sort
    if (filters.sortBy === "tc-desc") {
      filtered.sort((a, b) => b.totalCompensation - a.totalCompensation);
    } else if (filters.sortBy === "base-desc") {
      filtered.sort((a, b) => b.baseSalary - a.baseSalary);
    } else if (filters.sortBy === "company-asc") {
      filtered.sort((a, b) => a.company.name.localeCompare(b.company.name));
    } else {
      // Newest
      filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limit);

    return {
      items: paginated,
      entries: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  },

  async getCompanies() {
    const useDb = await checkDbConnection();
    const isProduction = process.env.NODE_ENV === "production";

    if (useDb) {
      try {
        return await prisma.company.findMany({
          select: {
            id: true,
            name: true,
            logo: true
          },
          orderBy: { name: "asc" }
        });
      } catch (err) {
        console.error("Prisma error in getCompanies:", err);
        if (isProduction) {
          throw new Error("Service Temporarily Unavailable: Database query failed.");
        }
      }
    } else if (isProduction) {
      throw new Error("Service Temporarily Unavailable: Database connection offline.");
    }
    initMockData();
    return [...mockCompanies].sort((a, b) => a.name.localeCompare(b.name));
  },

  async getCompany(idOrName: string) {
    const useDb = await checkDbConnection();
    const isProduction = process.env.NODE_ENV === "production";

    if (useDb) {
      try {
        const company = await prisma.company.findFirst({
          where: {
            OR: [
              { id: idOrName },
              { name: { equals: idOrName, mode: "insensitive" } },
              { normalizedName: { equals: normalizeCompanyName(idOrName), mode: "insensitive" } }
            ]
          },
          include: {
            salaryEntries: {
              orderBy: { createdAt: "desc" }
            }
          }
        });
        if (company) return company;
      } catch (err) {
        console.error("Prisma error in getCompany:", err);
        if (isProduction) {
          throw new Error("Service Temporarily Unavailable: Database query failed.");
        }
      }
    } else if (isProduction) {
      throw new Error("Service Temporarily Unavailable: Database connection offline.");
    }

    // Fallback: In-Memory
    initMockData();
    const query = idOrName.toLowerCase();
    const normalizedQuery = normalizeCompanyName(idOrName).toLowerCase();
    const company = mockCompanies.find(
      c => c.id === idOrName || c.name.toLowerCase() === query || c.normalizedName.toLowerCase() === normalizedQuery
    );

    if (!company) return null;

    const salaryEntries = mockSalaries
      .filter(s => s.companyId === company.id)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return { ...company, salaryEntries };
  },

  async submitSalary(data: {
    companyName: string;
    role: string;
    level: string;
    location: string;
    baseSalary: number;
    bonus: number;
    stock: number;
    userId?: string;
  }) {
    const normalizedCompany = normalizeCompanyName(data.companyName);
    const normalizedLevel = normalizeLevelName(data.level, data.companyName);
    const tc = calculateTotalCompensation(data.baseSalary, data.bonus, data.stock);

    const useDb = await checkDbConnection();
    const isProduction = process.env.NODE_ENV === "production";

    if (useDb) {
      try {
        // Upsert Company
        let company = await prisma.company.findFirst({
          where: { normalizedName: { equals: normalizedCompany, mode: "insensitive" } }
        });

        if (!company) {
          company = await prisma.company.create({
            data: {
              name: data.companyName.trim(),
              normalizedName: normalizedCompany,
              logo: data.companyName.trim().charAt(0).toUpperCase(),
              headquarters: "Unknown",
              industry: "Technology"
            }
          });
        }

        const newEntry = await prisma.salaryEntry.create({
          data: {
            companyId: company.id,
            userId: data.userId || null,
            role: data.role.trim(),
            level: normalizedLevel,
            rawLevel: data.level.trim(),
            normalizedLevel: normalizedLevel,
            location: data.location.trim(),
            baseSalary: data.baseSalary,
            bonus: data.bonus,
            stock: data.stock,
            totalCompensation: tc
          },
          include: { 
            company: {
              select: {
                id: true,
                name: true,
                logo: true
              }
            }
          }
        });

        return newEntry;
      } catch (err) {
        console.error("Prisma error in submitSalary:", err);
        if (isProduction) {
          throw new Error("Service Temporarily Unavailable: Database operation failed.");
        }
      }
    } else if (isProduction) {
      throw new Error("Service Temporarily Unavailable: Database connection offline.");
    }

    // Fallback: In-Memory
    initMockData();
    let company = mockCompanies.find(c => c.normalizedName.toLowerCase() === normalizedCompany.toLowerCase());
    
    if (!company) {
      company = {
        id: `company-${mockCompanies.length + 1}`,
        name: data.companyName.trim(),
        normalizedName: normalizedCompany,
        logo: data.companyName.trim().charAt(0).toUpperCase(),
        headquarters: "Unknown",
        industry: "Technology"
      };
      mockCompanies.push(company);
    }

    const newEntry = {
      id: `salary-${mockSalaries.length + 1}`,
      companyId: company.id,
      company: company,
      userId: data.userId || "guest-user-id",
      role: data.role.trim(),
      level: normalizedLevel,
      rawLevel: data.level.trim(),
      normalizedLevel: normalizedLevel,
      location: data.location.trim(),
      baseSalary: data.baseSalary,
      bonus: data.bonus,
      stock: data.stock,
      totalCompensation: tc,
      createdAt: new Date()
    };

    mockSalaries.push(newEntry);
    return newEntry;
  },

  async updateSalary(id: string, data: {
    role: string;
    level: string;
    location: string;
    baseSalary: number;
    bonus: number;
    stock: number;
    userId: string;
  }) {
    const tc = calculateTotalCompensation(data.baseSalary, data.bonus, data.stock);
    const useDb = await checkDbConnection();
    const isProduction = process.env.NODE_ENV === "production";

    if (useDb) {
      try {
        const existing = await prisma.salaryEntry.findUnique({ where: { id } });
        if (!existing) throw new Error("Salary entry not found");
        if (existing.userId !== data.userId) throw new Error("Unauthorized");

        const normalizedLevel = normalizeLevelName(data.level);

        return await prisma.salaryEntry.update({
          where: { id },
          data: {
            role: data.role.trim(),
            level: normalizedLevel,
            rawLevel: data.level.trim(),
            normalizedLevel: normalizedLevel,
            location: data.location.trim(),
            baseSalary: data.baseSalary,
            bonus: data.bonus,
            stock: data.stock,
            totalCompensation: tc
          },
          include: { 
            company: {
              select: {
                id: true,
                name: true,
                logo: true
              }
            }
          }
        });
      } catch (err) {
        console.error("Prisma error in updateSalary:", err);
        if (isProduction) {
          throw new Error("Service Temporarily Unavailable: Database operation failed.");
        }
        throw err;
      }
    } else if (isProduction) {
      throw new Error("Service Temporarily Unavailable: Database connection offline.");
    }

    // Fallback: In-Memory
    initMockData();
    const index = mockSalaries.findIndex(s => s.id === id);
    if (index === -1) throw new Error("Salary entry not found");
    if (mockSalaries[index].userId !== data.userId) throw new Error("Unauthorized");

    const normalizedLevel = normalizeLevelName(data.level);

    mockSalaries[index] = {
      ...mockSalaries[index],
      role: data.role.trim(),
      level: normalizedLevel,
      rawLevel: data.level.trim(),
      normalizedLevel: normalizedLevel,
      location: data.location.trim(),
      baseSalary: data.baseSalary,
      bonus: data.bonus,
      stock: data.stock,
      totalCompensation: tc
    };

    return mockSalaries[index];
  },

  async deleteSalary(id: string, userId: string) {
    const useDb = await checkDbConnection();
    const isProduction = process.env.NODE_ENV === "production";

    if (useDb) {
      try {
        const existing = await prisma.salaryEntry.findUnique({ where: { id } });
        if (!existing) throw new Error("Salary entry not found");
        if (existing.userId !== userId) throw new Error("Unauthorized");

        return await prisma.salaryEntry.delete({ where: { id } });
      } catch (err) {
        console.error("Prisma error in deleteSalary:", err);
        if (isProduction) {
          throw new Error("Service Temporarily Unavailable: Database operation failed.");
        }
        throw err;
      }
    } else if (isProduction) {
      throw new Error("Service Temporarily Unavailable: Database connection offline.");
    }

    // Fallback: In-Memory
    initMockData();
    const index = mockSalaries.findIndex(s => s.id === id);
    if (index === -1) throw new Error("Salary entry not found");
    if (mockSalaries[index].userId !== userId) throw new Error("Unauthorized");

    const deleted = mockSalaries[index];
    mockSalaries = mockSalaries.filter(s => s.id !== id);
    return deleted;
  },

  async saveComparison(userId: string, comparisonData: any) {
    const useDb = await checkDbConnection();
    const isProduction = process.env.NODE_ENV === "production";

    if (useDb) {
      try {
        return await prisma.savedComparison.create({
          data: {
            userId,
            comparisonData: comparisonData as any
          }
        });
      } catch (err) {
        console.error("Prisma error in saveComparison:", err);
        if (isProduction) {
          throw new Error("Service Temporarily Unavailable: Database operation failed.");
        }
      }
    } else if (isProduction) {
      throw new Error("Service Temporarily Unavailable: Database connection offline.");
    }

    // Fallback: In-Memory
    const newSave = {
      id: `save-${mockSavedComparisons.length + 1}`,
      userId,
      comparisonData,
      createdAt: new Date()
    };
    mockSavedComparisons.push(newSave);
    return newSave;
  },

  async getSavedComparisons(userId: string) {
    const useDb = await checkDbConnection();
    const isProduction = process.env.NODE_ENV === "production";

    if (useDb) {
      try {
        return await prisma.savedComparison.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" }
        });
      } catch (err) {
        console.error("Prisma error in getSavedComparisons:", err);
        if (isProduction) {
          throw new Error("Service Temporarily Unavailable: Database query failed.");
        }
      }
    } else if (isProduction) {
      throw new Error("Service Temporarily Unavailable: Database connection offline.");
    }

    // Fallback: In-Memory
    return mockSavedComparisons
      .filter(c => c.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  async getSubmittedSalaries(userId: string) {
    const useDb = await checkDbConnection();
    const isProduction = process.env.NODE_ENV === "production";

    if (useDb) {
      try {
        return await prisma.salaryEntry.findMany({
          where: { userId },
          include: { 
            company: {
              select: {
                id: true,
                name: true,
                logo: true
              }
            }
          },
          orderBy: { createdAt: "desc" }
        });
      } catch (err) {
        console.error("Prisma error in getSubmittedSalaries:", err);
        if (isProduction) {
          throw new Error("Service Temporarily Unavailable: Database query failed.");
        }
      }
    } else if (isProduction) {
      throw new Error("Service Temporarily Unavailable: Database connection offline.");
    }

    // Fallback: In-Memory
    initMockData();
    return mockSalaries
      .filter(s => s.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  async getUserByEmail(email: string) {
    const useDb = await checkDbConnection();
    const isProduction = process.env.NODE_ENV === "production";

    if (useDb) {
      try {
        return await prisma.user.findUnique({
          where: { email }
        });
      } catch (err) {
        console.error("Prisma error in getUserByEmail:", err);
        if (isProduction) {
          throw new Error("Service Temporarily Unavailable: Database query failed.");
        }
      }
    } else if (isProduction) {
      throw new Error("Service Temporarily Unavailable: Database connection offline.");
    }

    // Fallback: In-Memory
    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  },

  async createUser(data: any) {
    const useDb = await checkDbConnection();
    const isProduction = process.env.NODE_ENV === "production";

    if (useDb) {
      try {
        return await prisma.user.create({
          data: {
            name: data.name,
            email: data.email,
            password: data.password
          }
        });
      } catch (err) {
        console.error("Prisma error in createUser:", err);
        if (isProduction) {
          throw new Error("Service Temporarily Unavailable: Database operation failed.");
        }
        throw err;
      }
    } else if (isProduction) {
      throw new Error("Service Temporarily Unavailable: Database connection offline.");
    }

    // Fallback: In-Memory
    const existing = mockUsers.find(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) throw new Error("User with this email already exists");

    const newUser = {
      id: `user-${mockUsers.length + 1}`,
      name: data.name,
      email: data.email,
      password: data.password,
      createdAt: new Date()
    };
    mockUsers.push(newUser);
    return newUser;
  },

  async createSharedComparison(slug: string, comparisonData: any, title?: string) {
    const useDb = await checkDbConnection();
    const isProduction = process.env.NODE_ENV === "production";

    if (useDb) {
      try {
        return await prisma.sharedComparison.create({
          data: {
            slug,
            title: title || null,
            comparisonData: comparisonData as any
          }
        });
      } catch (err) {
        console.error("Prisma error in createSharedComparison:", err);
        if (isProduction) {
          throw new Error("Service Temporarily Unavailable: Database operation failed.");
        }
      }
    } else if (isProduction) {
      throw new Error("Service Temporarily Unavailable: Database connection offline.");
    }

    // Fallback: In-Memory
    const newShare = {
      id: `share-${mockSharedComparisons.length + 1}`,
      slug,
      title: title || null,
      views: 0,
      lastViewedAt: null,
      comparisonData,
      createdAt: new Date()
    };
    mockSharedComparisons.push(newShare);
    return newShare;
  },

  async getSharedComparisonBySlug(slug: string) {
    const useDb = await checkDbConnection();
    const isProduction = process.env.NODE_ENV === "production";

    if (useDb) {
      try {
        return await prisma.sharedComparison.update({
          where: { slug },
          data: {
            views: { increment: 1 },
            lastViewedAt: new Date()
          }
        });
      } catch (err) {
        console.error("Prisma error in getSharedComparisonBySlug update:", err);
        try {
          return await prisma.sharedComparison.findUnique({
            where: { slug }
          });
        } catch (e) {
          console.error("Prisma findUnique fallback error:", e);
          if (isProduction) {
            throw new Error("Service Temporarily Unavailable: Database query failed.");
          }
        }
      }
    } else if (isProduction) {
      throw new Error("Service Temporarily Unavailable: Database connection offline.");
    }

    // Fallback: In-Memory
    const shared = mockSharedComparisons.find(s => s.slug === slug);
    if (shared) {
      shared.views = (shared.views || 0) + 1;
      shared.lastViewedAt = new Date();
    }
    return shared || null;
  }
};
