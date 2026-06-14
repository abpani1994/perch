import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { login, register, listCampuses } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Spinner } from "../components/states";

export default function Auth({ mode }) {
  const isRegister = mode === "register";
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const { push } = useToast();

  const [form, setForm] = useState({ name: "", email: "", password: "", campusId: "" });
  const [campuses, setCampuses] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) navigate("/map", { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    if (isRegister) {
      listCampuses().then((d) => setCampuses(d.campuses)).catch(() => {});
    }
  }, [isRegister]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = isRegister
        ? await register({
            name: form.name,
            email: form.email,
            password: form.password,
            campusId: form.campusId || undefined,
          })
        : await login({ email: form.email, password: form.password });
      signIn(res.token, res.user);
      push(isRegister ? "Account created. Welcome to Perch." : "Signed in.");
      navigate("/map", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[100dvh] grid lg:grid-cols-2">
      {/* left brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-12" style={{ background: "var(--accent)" }}>
        <Link to="/" className="flex items-center gap-2 text-white">
          <Icon icon="ph:coffee-fill" width="24" style={{ color: "var(--brand)" }} />
          <span className="font-semibold text-lg tracking-tight">Perch</span>
        </Link>
        <div>
          <p className="mono text-xs uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.5)" }}>
            Campus telemetry · live
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white max-w-sm leading-tight">
            Read the building before you leave it.
          </h2>
          <p className="mt-4 text-sm max-w-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
            Outlet density, noise by hour, laptop policy — verified by the person who just sat down, and expiring
            in 90 minutes so it&rsquo;s always current.
          </p>
        </div>
        <span className="mono text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
          Ann Arbor · Berkeley · Madison · Austin
        </span>
      </div>

      {/* form */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
            <Icon icon="ph:coffee-fill" width="22" style={{ color: "var(--brand)" }} />
            <span className="font-semibold text-lg tracking-tight">Perch</span>
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isRegister ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: "var(--text-2)" }}>
            {isRegister ? "Pick your campus and start reading cafés." : "Sign in to see live café telemetry."}
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4" noValidate>
            {isRegister && (
              <Field label="Name" htmlFor="name">
                <input id="name" className="input" value={form.name} onChange={set("name")} placeholder="Maya Chen" autoComplete="name" />
              </Field>
            )}
            <Field label="Email" htmlFor="email">
              <input id="email" type="email" className="input" value={form.email} onChange={set("email")} placeholder="you@university.edu" autoComplete="email" />
            </Field>
            <Field label="Password" htmlFor="password">
              <input id="password" type="password" className="input" value={form.password} onChange={set("password")} placeholder={isRegister ? "At least 8 characters" : "Your password"} autoComplete={isRegister ? "new-password" : "current-password"} />
            </Field>
            {isRegister && (
              <Field label="Campus (optional)" htmlFor="campus">
                <select id="campus" className="input" value={form.campusId} onChange={set("campusId")}>
                  <option value="">Choose later</option>
                  {campuses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </Field>
            )}

            {error && (
              <p className="text-sm flex items-center gap-1.5" style={{ color: "#dc2626" }}>
                <Icon icon="ph:warning-circle" width="15" /> {error}
              </p>
            )}

            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? <><Spinner /> {isRegister ? "Creating…" : "Signing in…"}</> : isRegister ? "Create account" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-sm text-center" style={{ color: "var(--text-2)" }}>
            {isRegister ? "Already have an account? " : "New to Perch? "}
            <Link to={isRegister ? "/login" : "/register"} className="font-medium" style={{ color: "var(--brand)" }}>
              {isRegister ? "Sign in" : "Create an account"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, htmlFor, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium mb-1.5">{label}</label>
      {children}
    </div>
  );
}