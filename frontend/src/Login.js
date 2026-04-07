import { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setError("");
    setLoading(true);
    // Replace with your real auth call
    setTimeout(() => {
      localStorage.setItem("token", "12345");
      window.location.reload();
    }, 1000);
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ marginBottom: 12 }}>
          <rect x="28" y="8" width="6" height="40" rx="3" fill="#f0c040" />
          <path d="M34 22 Q48 14 46 30 Q40 28 34 34Z" fill="#86c840" />
          <path d="M28 30 Q14 22 16 38 Q22 36 28 42Z" fill="#a0d050" />
          <rect x="30" y="46" width="4" height="10" rx="2" fill="#c8a020" />
        </svg>
        <div style={styles.brandName}>KisanAI</div>
        <div style={styles.brandSub}>Smart Farming Assistant</div>
      </div>

      {/* Card */}
      <div style={styles.card}>
        {/* Progress Bar */}
        <div style={styles.progressBar}>
          <div style={styles.progressFill} />
        </div>

        <div style={styles.cardTitle}>Welcome to KisanAI 🌱</div>
        <div style={styles.cardDesc}>Sign in to your account to continue.</div>

        <div style={styles.fieldWrap}>
          <label style={styles.fieldLabel} htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            style={styles.input}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div style={styles.fieldWrap}>
          <label style={styles.fieldLabel} htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            style={styles.input}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          style={{
            ...styles.btn,
            opacity: loading ? 0.8 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Signing in..." : "Next →"}
        </button>

        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "'Inter', sans-serif",
    background: "#1a6b2a",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    background: "#1a6b2a",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "32px 20px 28px",
  },
  brandName: {
    color: "#fff",
    fontSize: 26,
    fontWeight: 700,
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  brandSub: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    fontWeight: 400,
    letterSpacing: 0.3,
  },
  card: {
    background: "#f0faf0",
    borderRadius: "20px 20px 0 0",
    flex: 1,
    padding: "0 28px 36px",
  },
  progressBar: {
    height: 4,
    background: "#d0e8d0",
    borderRadius: 2,
    margin: "0 -28px 28px",
  },
  progressFill: {
    height: 4,
    width: "33%",
    background: "#22c55e",
    borderRadius: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#111",
    marginBottom: 6,
    paddingTop: 24,
  },
  cardDesc: {
    fontSize: 13,
    color: "#666",
    marginBottom: 28,
  },
  fieldWrap: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: "#222",
    marginBottom: 8,
    display: "block",
  },
  input: {
    width: "100%",
    border: "1.5px solid #e0e0e0",
    borderRadius: 10,
    padding: "14px 16px",
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    color: "#222",
    background: "#fff",
    outline: "none",
    boxSizing: "border-box",
  },
  btn: {
    width: "100%",
    padding: 15,
    background: "#22c55e",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontFamily: "'Inter', sans-serif",
    fontSize: 15,
    fontWeight: 600,
    marginTop: 8,
    letterSpacing: 0.2,
  },
  error: {
    fontSize: 12,
    color: "#dc2626",
    marginTop: 10,
    textAlign: "center",
  },
};

export default Login;