"use client";

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
import { usePathname } from "next/navigation";
import { FileText, Activity } from "lucide-react";

export default function SidebarNav() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    if (path === "/admin") return pathname === "/admin";
    return pathname.startsWith(path);
  };

  return (
    <nav className="sidebar-nav">
      <div className="nav-section-label">MENU UTAMA</div>
      <Link href="/admin" className={`nav-item ${isActive("/admin") ? "active" : ""}`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        Dashboard
      </Link>

      <div className="nav-section-label" style={{ marginTop: "1rem" }}>MASTER DATA</div>
      <Link href="/admin/procedures" className={`nav-item ${isActive("/admin/procedures") ? "active" : ""}`}>
        <FileText size={20} />
        Procedures
      </Link>
      <Link href="/admin/diagnoses" className={`nav-item ${isActive("/admin/diagnoses") ? "active" : ""}`}>
        <Activity size={20} />
        Diagnoses
      </Link>
      <Link href="/admin/bpjs" className={`nav-item ${isActive("/admin/bpjs") ? "active" : ""}`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
        </svg>
        BPJS
      </Link>
      <Link href="/admin/icd10" className={`nav-item ${isActive("/admin/icd10") ? "active" : ""}`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        ICD-10
      </Link>
      <Link href="/admin/icd9" className={`nav-item ${isActive("/admin/icd9") ? "active" : ""}`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
        </svg>
        ICD-9
      </Link>

      <div className="nav-section-label" style={{ marginTop: "1rem" }}>KEAMANAN</div>
      <Link href="/admin/api-keys" className={`nav-item ${isActive("/admin/api-keys") ? "active" : ""}`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        API Keys
      </Link>
    </nav>
  );
}
