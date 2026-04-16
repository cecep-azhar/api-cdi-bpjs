import { FileText, Activity } from "lucide-react";
import type { Metadata } from "next";

/**
 * ============================================
 * CDI BPJS - Medical Data Synchronization API
 * ============================================
 * Author    : Cecep Saeful Azhar Hidayat, ST
 * WhatsApp  : 0852-2069-9117
 * Email     : cecepazhar126@gmail.com
 * ============================================
 */

import Link from "next/link";
import SidebarNav from "./sidebar-nav";
import LogoutButton from "./logout-button";
import "./admin.css";

export const metadata: Metadata = {
  title: "Admin Panel - CDI BPJS",
  description: "Panel administrasi data master CDI BPJS",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-root">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="4" fill="#0f172a" />
              <path d="M12 20C12 15.58 15.58 12 20 12C22.76 12 25.2 13.38 26.7 15.5L29.5 13.5C27.38 10.56 24 8.75 20 8.75C13.76 8.75 8.75 13.76 8.75 20C8.75 26.24 13.76 31.25 20 31.25C24 31.25 27.38 29.44 29.5 26.5L26.7 24.5C25.2 26.62 22.76 28 20 28C15.58 28 12 24.42 12 20Z" fill="white" />
              <circle cx="27" cy="20" r="4" fill="#6366f1" />
            </svg>
          </div>
          <div>
            <span className="brand-name">CDI BPJS</span>
            <span className="brand-tag">Admin Panel</span>
          </div>
        </div>

        <SidebarNav />

        <div className="sidebar-footer" />
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div className="admin-header-title">Admin Panel..</div>
          <div className="admin-header-actions">
            <LogoutButton />
          </div>
        </header>

        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
}
