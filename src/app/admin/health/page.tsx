import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { redirect } from "next/navigation";
import AdminHealthClient from "./AdminHealthClient";

export const metadata = {
  title: "CompIntel | Admin Data Integrity Scanner",
  description: "Real-time metrics, duplicate audits, and standard deviation outlier detection scanner."
};

export default async function AdminHealthPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/salaries?error=unauthorized");
  }

  return <AdminHealthClient />;
}
