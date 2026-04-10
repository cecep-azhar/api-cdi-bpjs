import type { Metadata } from "next";
import Link from "next/link";
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

        <nav className="sidebar-nav">
          <div className="nav-section-label">MENU UTAMA</div>
          <Link href="/admin" className="nav-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            Dashboard
          </Link>

          <div className="nav-section-label" style={{ marginTop: "1rem" }}>MASTER DATA</div>
          <Link href="/admin/tindakan" className="nav-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            Tindakan
          </Link>
          <Link href="/admin/diagnosa" className="nav-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4l3 3" />
            </svg>
            Diagnosa
          </Link>
          <Link href="/admin/bpjs" className="nav-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M2 10h20" />
            </svg>
            BPJS
          </Link>

          <div className="nav-section-label" style={{ marginTop: "1rem" }}>KEAMANAN</div>
          <Link href="/admin/api-keys" className="nav-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            API Keys
          </Link>
        </nav>

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
