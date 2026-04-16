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

export default function LogoutButton() {
  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    window.location.href = "/login";
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontSize: '0.8375rem',
        fontWeight: 600,
        color: '#64748b',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '0.4rem 0.75rem',
        borderRadius: '6px',
        transition: 'all 0.15s',
        fontFamily: 'inherit',
        letterSpacing: '0.01em',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.background = '#f1f5f9';
        (e.currentTarget as HTMLButtonElement).style.color = '#0f172a';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        (e.currentTarget as HTMLButtonElement).style.color = '#64748b';
      }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      Keluar
    </button>
  );
}
