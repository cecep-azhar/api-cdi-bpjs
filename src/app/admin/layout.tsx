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

          <div className="nav-section-label" style={{ marginTop: "1.5rem" }}>KEAMANAN</div>
          <Link href="/admin/api-keys" className="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            API Keys
          </Link>
        </nav>

        <div className="sidebar-footer">
          {/* Footer content if any, otherwise can be removed */}
        </div>
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

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .admin-root {
          display: flex;
          min-height: 100vh;
          background: #ffffff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #334155;
        }

        /* SIDEBAR */
        .sidebar {
          width: 260px;
          min-height: 100vh;
          background: #ffffff;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          padding: 1.5rem 1rem;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          z-index: 100;
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          padding: 0 0.5rem;
        }

        .brand-icon {
          flex-shrink: 0;
          filter: drop-shadow(0 4px 6px rgba(99, 102, 241, 0.4));
        }

        .brand-name {
          display: block;
          color: #0f172a;
          font-size: 1.25rem;
          font-weight: 800;
          font-family: 'Outfit', sans-serif;
          letter-spacing: -0.5px;
        }

        .brand-tag {
          display: block;
          color: #64748b;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .nav-section-label {
          color: #94a3b8;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 1.5px;
          padding: 0 0.75rem;
          margin-bottom: 0.5rem;
          font-family: 'Outfit', sans-serif;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1rem;
          color: #64748b;
          text-decoration: none;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .nav-item:hover {
          background: #f8fafc;
          color: #0f172a;
        }

        .nav-item.active {
          background: #0f172a;
          color: #ffffff;
        }

        .sidebar-footer {
          border-top: 1px solid #f1f5f9;
          padding-top: 1.5rem;
          margin-top: 1rem;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.85rem 1rem;
          color: #ef4444;
          text-decoration: none;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
          background: transparent;
          border: none;
          width: 100%;
          font-family: inherit;
        }

        .logout-btn:hover {
          background: #fef2f2;
          transform: translateX(4px);
        }

        /* MAIN CONTENT */
        .admin-main {
          margin-left: 260px;
          flex: 1;
          display: flex;
          flex-direction: column;
          background-color: #fafafa;
          min-height: 100vh;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 64px;
          padding: 0 2rem;
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .admin-header-title {
          font-weight: 700;
          font-size: 1.1rem;
          color: #0f172a;
        }

        .admin-header-actions {
          display: flex;
          align-items: center;
        }

        .admin-content {
          padding: 2rem 3rem;
          flex: 1;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        /* PAGE HEADER UTILITIES */
        :global(.page-header) {
          margin-bottom: 2.5rem;
        }

        :global(.page-title) {
          font-size: 2.25rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -1px;
          font-family: 'Outfit', sans-serif;
        }

        :global(.page-desc) {
          color: #64748b;
          font-size: 1.05rem;
          margin-top: 0.5rem;
          font-weight: 400;
        }

        /* CARD */
        :global(.admin-card) {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.04);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        :global(.admin-card:hover) {
            box-shadow: 0 20px 40px -10px rgba(0,0,0,0.08);
        }

        /* TABLE (Tailwind Standard Style) */
        :global(.data-table) {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
          min-width: 100%;
        }

        :global(.data-table thead) {
          background-color: #f9fafb;
        }

        :global(.data-table th) {
          text-align: left;
          padding: 0.75rem 1.5rem;
          color: #6b7280;
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          border-bottom: 1px solid #e5e7eb;
        }

        :global(.data-table tbody) {
          background-color: #ffffff;
        }

        :global(.data-table tr) {
          border-bottom: 1px solid #e5e7eb;
          transition: background-color 0.15s ease;
        }

        :global(.data-table tr:last-child) {
          border-bottom: none;
        }

        :global(.data-table td) {
          padding: 1rem 1.5rem;
          color: #374151;
          white-space: nowrap;
        }

        :global(.data-table tr:hover) {
          background-color: #f9fafb;
        }

        /* BUTTONS */
        :global(.btn) {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.7rem 1.2rem;
          border: none;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
          font-family: inherit;
        }

        :global(.btn-primary) {
          background: #0f172a;
          color: #ffffff;
          border-radius: 8px;
        }

        :global(.btn-primary:hover) {
          background: #1e293b;
        }
        
        :global(.btn-icon) {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: #475569;
          cursor: pointer;
          border-radius: 6px;
          padding: 0.4rem;
          transition: all 0.2s ease;
        }

        :global(.btn-icon:hover) {
          background: #f1f5f9;
          color: #0f172a;
        }

        :global(.btn-icon.danger) {
          color: #ef4444;
        }

        :global(.btn-icon.danger:hover) {
          background: #fef2f2;
          color: #dc2626;
        }
        
        :global(.btn-success) {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        :global(.btn-success:hover) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
        }

        :global(.btn-danger) {
          background: #fef2f2;
          color: #ef4444;
          border: 1px solid #fecaca;
        }

        :global(.btn-danger:hover) {
          background: #fee2e2;
          border-color: #fca5a5;
          transform: translateY(-1px);
        }

        :global(.btn-secondary) {
          background: #ffffff;
          color: #475569;
          border: 1px solid #cbd5e1;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }

        :global(.btn-secondary:hover) {
          background: #f8fafc;
          color: #0f172a;
          border-color: #94a3b8;
          transform: translateY(-1px);
        }

        /* FORM */
        :global(.form-grid) {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        :global(.form-field) {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        :global(.form-field label) {
          font-size: 0.85rem;
          color: #64748b;
          font-weight: 700;
        }

        :global(.form-input) {
          padding: 0.85rem 1rem;
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          color: #0f172a;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        :global(.form-input:focus) {
          outline: none;
          border-color: #6366f1;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }

        /* BADGE */
        :global(.badge-active) {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.8rem;
          border-radius: 24px;
          font-size: 0.75rem;
          font-weight: 700;
          background: #dcfce7;
          color: #166534;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        :global(.badge-inactive) {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.8rem;
          border-radius: 24px;
          font-size: 0.75rem;
          font-weight: 700;
          background: #fee2e2;
          color: #991b1b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* STAT CARD */
        :global(.stats-grid) {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        :global(.stat-card) {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 1.25rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        :global(.stat-header) {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        :global(.stat-label) {
          font-size: 0.85rem;
          color: #0f172a;
          font-weight: 600;
        }
        
        :global(.stat-icon) {
          color: #64748b;
        }

        :global(.stat-value) {
          font-size: 2rem;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.2;
          font-family: inherit;
        }

        :global(.stat-desc) {
          font-size: 0.75rem;
          color: #64748b;
        }

        /* MODAL OVERLAY */
        :global(.modal-overlay) {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(8px);
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        :global(.modal-box) {
          background: #ffffff;
          border-radius: 24px;
          padding: 2.5rem;
          width: 100%;
          max-width: 550px;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
          animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        :global(.modal-title) {
          font-size: 1.5rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 1.5rem;
          font-family: 'Outfit', sans-serif;
        }

        :global(.modal-actions) {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
        }

        /* SEARCH BAR */
        :global(.search-bar-wrapper) {
          position: relative;
          flex: 1;
          max-width: 400px;
        }

        :global(.search-icon) {
          position: absolute;
          left: 1.2rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
        }

        :global(.search-bar) {
          width: 100%;
          padding: 0.85rem 1.2rem 0.85rem 3rem;
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          color: #0f172a;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        :global(.search-bar::placeholder) { color: #94a3b8; font-weight: 500; }

        :global(.search-bar:focus) {
          outline: none;
          border-color: #6366f1;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }

        :global(.toolbar) {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        :global(.empty-state) {
          text-align: center;
          padding: 5rem 2rem;
          color: #94a3b8;
          background: #f8fafc;
          border-radius: 16px;
          border: 2px dashed #e2e8f0;
        }

        :global(.empty-state svg) {
          margin-bottom: 1.5rem;
          color: #cbd5e1;
        }
        
        :global(.empty-state p) {
            font-size: 1.1rem;
            font-weight: 500;
        }
      `}</style>
    </div>
  );
}
