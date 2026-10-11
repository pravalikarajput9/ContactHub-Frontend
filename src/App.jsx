import { useState } from "react";
import "./App.css";

function App() {
  const [page, setPage] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (page === "signup") {
      if (form.name.trim().length < 2) {
        setMessage("Please enter your full name.");
        return;
      }

      if (form.password.length < 8) {
        setMessage("Password must contain at least 8 characters.");
        return;
      }

      if (form.password !== form.confirmPassword) {
        setMessage("Passwords do not match.");
        return;
      }

      setMessage(
        "Sign-up form validated. Backend connection is required to create your account."
      );
      return;
    }

    setMessage(
      "Login form validated. Backend connection is required to sign in."
    );
  }

  function changePage(nextPage) {
    setPage(nextPage);
    setMessage("");
    setForm({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  }

  return (
    <main className="app-container">
      <section className="brand-panel">
        <div className="brand">
          <div className="brand-icon">C</div>
          <span>ContactHub</span>
        </div>

        <div className="brand-content">
          <span className="eyebrow">YOUR CONNECTIONS, SIMPLIFIED</span>
          <h1>Everyone you know, all in one place.</h1>
          <p>
            Keep your contacts organized and make staying connected
            effortless with ContactHub.
          </p>

          <div className="feature">
            <span className="feature-icon">✓</span>
            <span>Keep your contacts organized</span>
          </div>

          <div className="feature">
            <span className="feature-icon">✓</span>
            <span>Access your connections in one place</span>
          </div>

          <div className="feature">
            <span className="feature-icon">✓</span>
            <span>Manage your account securely</span>
          </div>
        </div>

        <p className="brand-footer">
          ContactHub · Stay connected, always.
        </p>
      </section>

      <section className="form-panel">
        <div className="mobile-brand">
          <div className="brand-icon">C</div>
          <span>ContactHub</span>
        </div>

        <div className="form-box">
          <div className="welcome-icon">
            {page === "login" ? "↗" : "✦"}
          </div>

          <h2>
            {page === "login" ? "Welcome back!" : "Create your account"}
          </h2>

          <p className="subtitle">
            {page === "login"
              ? "Enter your details to access your account."
              : "Join ContactHub and keep your contacts organized."}
          </p>

          <div className="tab-switch">
            <button
              type="button"
              className={page === "login" ? "tab active" : "tab"}
              onClick={() => changePage("login")}
            >
              Login
            </button>

            <button
              type="button"
              className={page === "signup" ? "tab active" : "tab"}
              onClick={() => changePage("signup")}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {page === "signup" && (
              <div className="input-group">
                <label htmlFor="name">Full name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </div>
            )}

            <div className="input-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="password-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete={
                    page === "login" ? "current-password" : "new-password"
                  }
                  minLength={page === "signup" ? 8 : undefined}
                  required
                />

                <button
                  type="button"
                  className="show-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {page === "signup" && (
              <div className="input-group">
                <label htmlFor="confirmPassword">Confirm password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
              </div>
            )}

            {page === "login" && (
              <div className="form-options">
                <label className="remember-option">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <span className="forgot-text">
                  Forgot password?
                </span>
              </div>
            )}

            {message && (
              <div className="message" role="status">
                {message}
              </div>
            )}

            <button className="submit-button" type="submit">
              {page === "login" ? "Login to ContactHub" : "Create account"}
              <span>→</span>
            </button>
          </form>

          <p className="switch-text">
            {page === "login"
              ? "Don't have an account? "
              : "Already have an account? "}

            <button
              type="button"
              className="text-button"
              onClick={() =>
                changePage(page === "login" ? "signup" : "login")
              }
            >
              {page === "login" ? "Sign up" : "Login"}
            </button>
          </p>

          <p className="privacy-note">
            By continuing, you agree to use ContactHub responsibly.
          </p>
        </div>
      </section>
    </main>
  );
}

export default App;
