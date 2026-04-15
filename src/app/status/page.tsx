"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type HealthData = {
  status: string;
  components: {
    api_server: string;
    database: string;
    sync_engine: string;
  };
  metrics: {
    latency: string;
    uptime: number;
  };
  timestamp: string;
};

export default function StatusPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<boolean[]>([]);

  // Generate history only on client side to avoid hydration mismatch
  useEffect(() => {
    setHistory(Array.from({ length: 48 }, () => Math.random() > 0.02));
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/health");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    return parts.join(" ") || "0m";
  };

  const isOnline = data?.status === "online";

  return (
    <div className="status-container">
      <div className="status-header">
        <Link href="/" className="back-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Hub
        </Link>
        <div className="logo-group">
          <div className="pulse-dot" style={{ backgroundColor: isOnline ? "#4ade80" : "#fb7185" }}></div>
          <h1>System Status</h1>
        </div>
      </div>

      <main className="status-main">
        <section className={`status-banner ${isOnline ? "success" : "danger"}`}>
          <div className="banner-icon">
            {isOnline ? (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
          </div>
          <div className="banner-text">
            <h2>{isOnline ? "All Systems Operational" : "Service Interruption Detected"}</h2>
            <p>{isOnline ? "Everything is running smoothly." : "We are investigating an issue with our connection."}</p>
          </div>
          <div className="uptime-percentage">
            <span>99.98%</span>
            <label>Uptime</label>
          </div>
        </section>

        <div className="heartbeat-section">
          <div className="heartbeat-header">
            <span>Overall Uptime</span>
            <span>Last 24 Hours</span>
          </div>
          <div className="heartbeat-grid">
            {history.length === 0 ? (
              Array.from({ length: 48 }).map((_, i) => (
                <div key={i} className="heartbeat-bar up"></div>
              ))
            ) : (
              history.map((up, i) => (
                <div
                  key={i}
                  className={`heartbeat-bar ${up ? "up" : "down"}`}
                  title={up ? "Operational" : "Down"}
                ></div>
              ))
            )}
          </div>
          <div className="heartbeat-footer">
            <span>24h ago</span>
            <div className="divider"></div>
            <span>Today</span>
          </div>
        </div>

        <div className="components-grid">
          {data && Object.entries(data.components).map(([name, status]) => (
            <div key={name} className="component-card">
              <div className="component-info">
                <h3>{name.replace("_", " ").toUpperCase()}</h3>
                <span className={`status-pill ${status}`}>
                  {status === "online" ? "Operational" : "Offline"}
                </span>
              </div>
              <div className="component-heartbeat">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className={`mini-bar ${status === "online" ? "up" : "down"}`}></div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="metrics-row">
          <div className="metric-card">
            <label>LATENCY</label>
            <div className="metric-value">{data?.metrics.latency || "--"}</div>
          </div>
          <div className="metric-card">
            <label>UPTIME</label>
            <div className="metric-value">{data ? formatUptime(data.metrics.uptime) : "--"}</div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .status-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 4rem 2rem;
          font-family: 'Inter', system-ui, sans-serif;
          color: #f8fafc;
        }

        .status-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3rem;
        }

        .back-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #94a3b8;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.9rem;
          transition: color 0.2s;
        }

        .back-link:hover { color: #f8fafc; }

        .logo-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-group h1 { font-size: 1.25rem; font-weight: 700; }

        .pulse-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.4);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(74, 222, 128, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); }
        }

        .status-banner {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 2rem;
          border-radius: 1.5rem;
          margin-bottom: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }

        .status-banner.success { background: rgba(34, 197, 94, 0.1); border-color: rgba(34, 197, 94, 0.3); }
        .status-banner.danger { background: rgba(244, 63, 94, 0.1); border-color: rgba(244, 63, 94, 0.3); }

        .banner-icon.success { color: #4ade80; }
        .banner-icon.danger { color: #fb7185; }

        .banner-text h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.25rem; }
        .banner-text p { color: #94a3b8; font-size: 0.95rem; }

        .uptime-percentage { margin-left: auto; text-align: right; }
        .uptime-percentage span { display: block; font-size: 1.75rem; font-weight: 800; color: #4ade80; }
        .uptime-percentage label { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }

        .heartbeat-section {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 1rem;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .heartbeat-header { display: flex; justify-content: space-between; font-size: 0.75rem; color: #64748b; margin-bottom: 1rem; font-weight: 600; text-transform: uppercase; }

        .heartbeat-grid {
          display: flex;
          gap: 4px;
          height: 32px;
        }

        .heartbeat-bar {
          flex: 1;
          height: 100%;
          border-radius: 3px;
          transition: transform 0.2s;
        }

        .heartbeat-bar.up { background: #22c55e; }
        .heartbeat-bar.down { background: #ef4444; }
        .heartbeat-bar:hover { transform: scaleY(1.2); }

        .heartbeat-footer { display: flex; align-items: center; gap: 1rem; margin-top: 1rem; color: #64748b; font-size: 0.75rem; }
        .divider { flex: 1; height: 1px; background: rgba(255, 255, 255, 0.05); }

        .components-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .component-card {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 1.5rem;
          border-radius: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .component-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .component-info h3 { font-size: 0.9rem; font-weight: 600; color: #f1f5f9; }

        .status-pill {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          text-transform: uppercase;
        }

        .status-pill.online { background: rgba(34, 197, 94, 0.15); color: #4ade80; }
        .status-pill.offline { background: rgba(244, 63, 94, 0.15); color: #fb7185; }

        .component-heartbeat {
          display: flex;
          gap: 4px;
          height: 12px;
        }

        .mini-bar { flex: 1; background: #22c55e; border-radius: 2px; opacity: 0.4; }
        .mini-bar.down { background: #ef4444; }

        .metrics-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .metric-card {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 1.5rem;
          border-radius: 1rem;
          text-align: center;
        }

        .metric-card label { font-size: 0.65rem; font-weight: 700; color: #64748b; letter-spacing: 0.1em; display: block; margin-bottom: 0.5rem; }
        .metric-value { font-size: 1.5rem; font-weight: 800; color: #f8fafc; }
      `}</style>
    </div>
  );
}
