export interface MockCompany {
  name: string;
  headquarters: string;
  industry: string;
  logo: string;
}

export interface MockSalaryEntry {
  companyName: string;
  role: string;
  level: string;
  location: string;
  baseSalary: number;
  bonus: number;
  stock: number;
  createdAt: string;
}

export const COMPANIES: MockCompany[] = [
  { name: "Google", headquarters: "Mountain View, CA", industry: "Technology", logo: "G" },
  { name: "Meta", headquarters: "Menlo Park, CA", industry: "Technology", logo: "M" },
  { name: "Amazon", headquarters: "Seattle, WA", industry: "E-Commerce", logo: "A" },
  { name: "Microsoft", headquarters: "Redmond, WA", industry: "Technology", logo: "MS" },
  { name: "Apple", headquarters: "Cupertino, CA", industry: "Consumer Electronics", logo: "AP" },
  { name: "Netflix", headquarters: "Los Gatos, CA", industry: "Entertainment", logo: "N" },
  { name: "Uber", headquarters: "San Francisco, CA", industry: "Transportation", logo: "U" },
  { name: "Airbnb", headquarters: "San Francisco, CA", industry: "Hospitality", logo: "AB" }
];

export const ROLES = ["Software Engineer", "Product Manager", "Data Scientist", "UX Designer"];
export const LOCATIONS = ["Bangalore", "Hyderabad", "Chennai", "Pune", "Remote"];
export const LEVELS = ["L3", "L4", "L5", "L6"];

export function generateSeedData(): MockSalaryEntry[] {
  const entries: MockSalaryEntry[] = [];
  let id = 1;

  for (const company of COMPANIES) {
    for (const level of LEVELS) {
      for (const role of ROLES) {
        const locIndex = (id * 3) % LOCATIONS.length;
        const location = LOCATIONS[locIndex];
        
        let base = 0;
        let bonus = 0;
        let stock = 0;

        if (level === "L3") {
          base = 25000 + (id % 10) * 1500;
          bonus = 2500 + (id % 5) * 500;
          stock = 5000 + (id % 8) * 1000;
        } else if (level === "L4") {
          base = 45000 + (id % 12) * 2000;
          bonus = 5000 + (id % 6) * 1000;
          stock = 15000 + (id % 10) * 2000;
        } else if (level === "L5") {
          base = 75000 + (id % 15) * 2500;
          bonus = 12000 + (id % 8) * 1500;
          stock = 40000 + (id % 12) * 4000;
        } else { // L6
          base = 120000 + (id % 20) * 3500;
          bonus = 25000 + (id % 10) * 3000;
          stock = 90000 + (id % 15) * 8000;
        }

        if (company.name === "Netflix") {
          base = Math.round(base * 1.5);
          stock = Math.round(stock * 0.2);
        } else if (company.name === "Google" || company.name === "Meta") {
          stock = Math.round(stock * 1.2);
          bonus = Math.round(bonus * 1.1);
        }

        if (location === "Pune" || location === "Chennai") {
          base = Math.round(base * 0.85);
        } else if (location === "Bangalore") {
          base = Math.round(base * 1.05);
        }

        const daysAgo = (id * 7) % 180;
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);

        entries.push({
          companyName: company.name,
          role,
          level,
          location,
          baseSalary: base,
          bonus,
          stock,
          createdAt: date.toISOString()
        });

        id++;
      }
    }
  }

  return entries;
}

export const SALARIES = generateSeedData();
