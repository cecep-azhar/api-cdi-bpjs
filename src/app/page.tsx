import styles from "./page.module.css";
import "./globals.css";
import Link from "next/link";

/**
 * ============================================
 * CDI BPJS - Medical Data Synchronization API
 * ============================================
 * Author    : Cecep Saeful Azhar Hidayat, ST
 * WhatsApp  : 0852-2069-9117
 * Email     : cecepazhar126@gmail.com
 * ============================================
 */

export default function Home() {
  return (
    <div className="container min-h-screen flex flex-col items-center justify-center text-center">
      <div className="glass card shadow-2xl transition-all">
        <div className="icon-container mb-6">
          <svg
            className="w-12 h-12 text-sky-500 icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>
        <h1 className="hero-title mb-4">
          Medical CDI Sync Hub
        </h1>
        <p className="hero-subtitle mb-10 leading-relaxed font-light">
          A robust, offline-first synchronization engine for ICD-9, ICD-10, and BPJS Tariffs. 
          Seamless data parity between desktop clients and the cloud.
        </p>

        <div className="stats-grid mb-10">
          <div className="stat-card">
            <span className="stat-value text-sky-400">ICD-10</span>
            <span className="stat-label">Ready</span>
          </div>
          <div className="stat-card">
            <span className="stat-value text-indigo-400">ICD-9</span>
            <span className="stat-label">Ready</span>
          </div>
          <div className="stat-card">
            <span className="stat-value text-rose-400">Tariffs</span>
            <span className="stat-label">Ready</span>
          </div>
        </div>

        <div className="actions flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/status"
            className="btn btn-primary"
            style={{ gap: '0.75rem' }}
          >
            <span className="status-dot"></span>
            Check API Status
          </Link>
          <div className="btn btn-outline">
            v1.0.0 Stable
          </div>
        </div>
      </div>
      
      <footer className="footer mt-12">
        &copy; 2026 Medical Data Systems &bull; Powered by Turso & Drizzle
      </footer>
    </div>
  );
}
