import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - CDI BPJS Admin",
  description: "Halaman login admin CDI BPJS API",
};

export default function LoginPage() {
  return (
    <div className="login-root">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="12" fill="url(#grad)" />
              <path d="M12 20C12 15.58 15.58 12 20 12C22.76 12 25.2 13.38 26.7 15.5L29.5 13.5C27.38 10.56 24 8.75 20 8.75C13.76 8.75 8.75 13.76 8.75 20C8.75 26.24 13.76 31.25 20 31.25C24 31.25 27.38 29.44 29.5 26.5L26.7 24.5C25.2 26.62 22.76 28 20 28C15.58 28 12 24.42 12 20Z" fill="white" />
              <circle cx="27" cy="20" r="4" fill="white" />
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="login-title">CDI BPJS Admin</h1>
          <p className="login-subtitle">Masuk ke panel administrator</p>
        </div>

        <form action="/api/auth" method="POST" className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input
                id="username"
                type="text"
                name="username"
                placeholder="Masukkan username"
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Masukkan password"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          {/* Error handled via client component or we use a simple approach */}
          <div id="login-error" className="login-error" style={{ display: "none" }}>
            Username atau password salah.
          </div>

          <button type="submit" className="login-btn">
            <span>Masuk</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </form>
      </div>

      <style>{`
        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(ellipse at top left, #1e1b4b 0%, #0f0f1a 50%, #0d1117 100%);
          font-family: 'Inter', 'Segoe UI', sans-serif;
          padding: 1rem;
        }

        .login-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 3rem 2.5rem;
          width: 100%;
          max-width: 420px;
          backdrop-filter: blur(20px);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(99, 102, 241, 0.1);
          animation: fadeInUp 0.5s ease-out;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .login-logo {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .login-logo-icon {
          display: inline-flex;
          margin-bottom: 1rem;
          filter: drop-shadow(0 0 20px rgba(99, 102, 241, 0.5));
        }

        .login-title {
          color: #fff;
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0 0 0.5rem;
          letter-spacing: -0.5px;
        }

        .login-subtitle {
          color: rgba(255, 255, 255, 0.45);
          font-size: 0.9rem;
          margin: 0;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          color: rgba(255, 255, 255, 0.65);
          font-size: 0.85rem;
          font-weight: 500;
          letter-spacing: 0.3px;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.3);
          pointer-events: none;
        }

        .login-form input {
          width: 100%;
          padding: 0.85rem 1rem 0.85rem 3rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #fff;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .login-form input::placeholder {
          color: rgba(255, 255, 255, 0.25);
        }

        .login-form input:focus {
          outline: none;
          border-color: #6366f1;
          background: rgba(99, 102, 241, 0.08);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }

        .login-error {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 10px;
          color: #f87171;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          text-align: center;
        }

        .login-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.9rem 1.5rem;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 0.5rem;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
        }

        .login-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
          background: linear-gradient(135deg, #4f52e0, #7c3aed);
        }

        .login-btn:active {
          transform: translateY(0);
        }
      `}</style>

      <script dangerouslySetInnerHTML={{
        __html: `
          const params = new URLSearchParams(window.location.search);
          if (params.get('error') === '1') {
            document.getElementById('login-error').style.display = 'block';
          }
        `
      }} />
    </div>
  );
}
