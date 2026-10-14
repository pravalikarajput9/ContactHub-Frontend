import { useState } from "react";
import { EyeIcon, EyeOffIcon, SparklesIcon, MoonIcon, SunIcon } from "./Icons";

export default function AuthPage({
  onLogin,
  onRegister,
  onGuestLogin,
  theme,
  onToggleTheme,
}) {
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!formData.email.trim() || !formData.password) {
      setError("Please fill in both email and password.");
      return;
    }

    if (mode === "signup") {
      if (!formData.name.trim()) {
        setError("Please enter your name.");
        return;
      }
      if (formData.password.length < 6) {
        setError("Password should be at least 6 characters.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setBusy(true);
    try {
      if (mode === "login") {
        await onLogin({
          email: formData.email,
          password: formData.password,
        });
      } else {
        await onRegister({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
      }
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-top-controls">
        <button
          type="button"
          className="btn-theme-auth"
          onClick={onToggleTheme}
          title="Toggle Dark/Light Mode"
        >
          {theme === "dark" ? <SunIcon size={18} /> : <MoonIcon size={18} />}
        </button>
      </div>

      <section className="auth-card">
        <div className="auth-header">
          <div className="brand-mark">C</div>
          <div className="brand-name">
            ContactHub <span>✦</span>
          </div>
        </div>

        <h1 className="auth-title">
          {mode === "login" ? "Welcome back!" : "Create your account"}
        </h1>
        <p className="auth-subtitle">
          {mode === "login"
            ? "Access your contacts with offline local browser storage."
            : "Keep all your professional and personal connections organized."}
        </p>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => {
              setMode("login");
              setError("");
            }}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === "signup" ? "active" : ""}
            onClick={() => {
              setMode("signup");
              setError("");
            }}
          >
            Sign Up
          </button>
        </div>

        {error && <div className="notice error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "signup" && (
            <div className="form-group">
              <label htmlFor="auth-name">Full Name</label>
              <input
                id="auth-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Jane Doe"
                autoComplete="name"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email">Email Address</label>
            <input
              id="auth-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">Password</label>
            <div className="password-input-wrap">
              <input
                id="auth-password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                required
              />
              <button
                type="button"
                className="btn-toggle-pw"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </button>
            </div>
          </div>

          {mode === "signup" && (
            <div className="form-group">
              <label htmlFor="auth-confirm-pw">Confirm Password</label>
              <input
                id="auth-confirm-pw"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-type password"
                autoComplete="new-password"
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block auth-submit-btn"
            disabled={busy}
          >
            {busy
              ? "Authenticating..."
              : mode === "login"
              ? "Sign In →"
              : "Create Account →"}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <button
          type="button"
          className="btn-guest-login"
          onClick={onGuestLogin}
        >
          <SparklesIcon size={16} />
          <span>Explore as Guest (Instant Demo)</span>
        </button>

        <p className="auth-switch">
          {mode === "login"
            ? "Don't have an account yet?"
            : "Already registered?"}{" "}
          <button
            type="button"
            className="link-btn"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError("");
            }}
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>

        <p className="footnote">
          🔒 Offline-first architecture. Your contacts and accounts are saved
          safely inside your browser without external server requirements.
        </p>
      </section>
    </main>
  );
}
