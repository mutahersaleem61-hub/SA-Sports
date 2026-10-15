import type { Metadata } from "next";
import { AdminApp } from "@/components/admin/AdminApp";
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export default function AdminPage() { return <AdminApp />; }
