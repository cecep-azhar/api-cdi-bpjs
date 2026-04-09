import type { Metadata } from "next";
import Link from "next/link";
import LogoutButton from "./logout-button";

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
              <rect width="40" height="40" rx="10" fill="url(#grad2)" />
              <path d="M12 20C12 15.58 15.58 12 20 12C22.76 12 25.2 13.38 26.7 15.5L29.5 13.5C27.38 10.56 24 8.75 20 8.75C13.76 8.75 8.75 13.76 8.75 20C8.75 26.24 13.76 31.25 20 31.25C24 31.25 27.38 29.44 29.5 26.5L26.7 24.5C25.2 26.62 22.76 28 20 28C15.58 28 12 24.42 12 20Z" fill="white" />
              <circle cx="27" cy="20" r="4" fill="white" />
              <defs>
                <linearGradient id="grad2" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            Dashboard
          </Link>

          <div className="nav-section-label" style={{ marginTop: "1.5rem" }}>MASTER DATA</div>
          <Link href="/admin/tindakan" className="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            Tindakan
          </Link>
          <Link href="/admin/diagnosa" className="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4l3 3" />
            </svg>
            Diagnosa
          </Link>
          <Link href="/admin/bpjs" className="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M2 10h20" />
            </svg>
            BPJS
          </Link>
        </nav>

        <div className="sidebar-footer">
          <LogoutButton />
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-content">
          {children}
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .admin-root {
          display: flex;
          min-height: 100vh;
          background: #0d1117;
          font-family: 'Inter', 'Segoe UI', sans-serif;
          color: #e6edf3;
        }

        /* SIDEBAR */
        .sidebar {
          width: 260px;
          min-height: 100vh;
          background: rgba(22, 27, 34, 0.95);
          border-right: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          flex-direction: column;
          padding: 1.5rem 1rem;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          z-index: 100;
          backdrop-filter: blur(10px);
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0.75rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          margin-bottom: 1.5rem;
        }

        .brand-icon {
          flex-shrink: 0;
          filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.4));
        }

        .brand-name {
          display: block;
          color: #fff;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: -0.3px;
        }

        .brand-tag {
          display: block;
          color: rgba(255, 255, 255, 0.35);
          font-size: 0.7rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .nav-section-label {
          color: rgba(255, 255, 255, 0.25);
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 1px;
          padding: 0 0.75rem;
          margin-bottom: 0.5rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.7rem 0.75rem;
          color: rgba(255, 255, 255, 0.55);
          text-decoration: none;
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.15s ease;
        }

        .nav-item:hover {
          background: rgba(99, 102, 241, 0.1);
          color: #a5b4fc;
        }

        .nav-item.active {
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
        }

        .sidebar-footer {
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding-top: 1rem;
          margin-top: 1rem;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.7rem 0.75rem;
          color: rgba(248, 113, 113, 0.7);
          text-decoration: none;
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
        }

        /* MAIN CONTENT */
        .admin-main {
          margin-left: 260px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .admin-content {
          padding: 2rem;
          flex: 1;
        }

        /* PAGE HEADER UTILITIES (used in child pages) */
        :global(.page-header) {
          margin-bottom: 2rem;
        }

        :global(.page-title) {
          font-size: 1.75rem;
          font-weight: 700;
          color: #e6edf3;
          letter-spacing: -0.5px;
        }

        :global(.page-desc) {
          color: rgba(230, 237, 243, 0.5);
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        /* CARD */
        :global(.admin-card) {
          background: rgba(22, 27, 34, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        /* TABLE */
        :global(.data-table) {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }

        :global(.data-table th) {
          text-align: left;
          padding: 0.75rem 1rem;
          color: rgba(230, 237, 243, 0.45);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        :global(.data-table td) {
          padding: 0.875rem 1rem;
          color: rgba(230, 237, 243, 0.85);
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        :global(.data-table tr:hover td) {
          background: rgba(99, 102, 241, 0.04);
        }

        :global(.data-table tr:last-child td) {
          border-bottom: none;
        }

        /* BUTTONS */
        :global(.btn) {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.55rem 1rem;
          border: none;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          text-decoration: none;
        }

        :global(.btn-primary) {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
        }

        :global(.btn-primary:hover) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        }

        :global(.btn-danger) {
          background: rgba(239, 68, 68, 0.12);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        :global(.btn-danger:hover) {
          background: rgba(239, 68, 68, 0.2);
        }

        :global(.btn-secondary) {
          background: rgba(255, 255, 255, 0.06);
          color: rgba(230, 237, 243, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        :global(.btn-secondary:hover) {
          background: rgba(255, 255, 255, 0.1);
          color: #e6edf3;
        }

        /* FORM */
        :global(.form-grid) {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
        }

        :global(.form-field) {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        :global(.form-field label) {
          font-size: 0.8rem;
          color: rgba(230, 237, 243, 0.55);
          font-weight: 500;
        }

        :global(.form-input) {
          padding: 0.65rem 0.875rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          color: #e6edf3;
          font-size: 0.875rem;
          transition: all 0.15s ease;
          font-family: inherit;
        }

        :global(.form-input:focus) {
          outline: none;
          border-color: #6366f1;
          background: rgba(99, 102, 241, 0.06);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
        }

        :global(.form-input option) {
          background: #1c2130;
        }

        /* BADGE */
        :global(.badge-active) {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
          background: rgba(34, 197, 94, 0.12);
          color: #4ade80;
          border: 1px solid rgba(34, 197, 94, 0.2);
        }

        :global(.badge-inactive) {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
          background: rgba(239, 68, 68, 0.12);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        /* STAT CARD */
        :global(.stats-grid) {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        :global(.stat-card) {
          background: rgba(22, 27, 34, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          transition: border-color 0.2s;
        }

        :global(.stat-card:hover) {
          border-color: rgba(99, 102, 241, 0.3);
        }

        :global(.stat-icon) {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
        }

        :global(.stat-value) {
          font-size: 2rem;
          font-weight: 700;
          color: #e6edf3;
          line-height: 1;
        }

        :global(.stat-label) {
          font-size: 0.8rem;
          color: rgba(230, 237, 243, 0.45);
          font-weight: 500;
        }

        /* MODAL OVERLAY */
        :global(.modal-overlay) {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        :global(.modal-box) {
          background: #161b22;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 2rem;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
          animation: modalIn 0.2s ease-out;
        }

        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(-10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        :global(.modal-title) {
          font-size: 1.1rem;
          font-weight: 700;
          color: #e6edf3;
          margin-bottom: 1.25rem;
        }

        :global(.modal-actions) {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          margin-top: 1.5rem;
        }

        /* SEARCH BAR */
        :global(.search-bar-wrapper) {
          position: relative;
          flex: 1;
          max-width: 360px;
        }

        :global(.search-icon) {
          position: absolute;
          left: 0.875rem;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(230, 237, 243, 0.3);
          pointer-events: none;
        }

        :global(.search-bar) {
          width: 100%;
          padding: 0.65rem 1rem 0.65rem 2.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          color: #e6edf3;
          font-size: 0.875rem;
          transition: all 0.15s ease;
          font-family: inherit;
        }

        :global(.search-bar::placeholder) { color: rgba(230, 237, 243, 0.3); }

        :global(.search-bar:focus) {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
        }

        :global(.toolbar) {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
        }

        :global(.empty-state) {
          text-align: center;
          padding: 3rem;
          color: rgba(230, 237, 243, 0.3);
        }

        :global(.empty-state svg) {
          margin-bottom: 1rem;
          opacity: 0.4;
        }
      `}</style>
    </div>
  );
}
