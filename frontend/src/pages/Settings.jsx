import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import AppShell from "../components/AppShell";
import { Spinner } from "../components/states";
import { listCampuses, updateMe, billingStatus, startCheckout } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Settings() {
  const { user, setUser, refresh } = useAuth();
  const { push } = useToast();
  const [params] = useSearchParams();

  const [campuses, setCampuses] = useState([]);
  const [name, setName] = useState(user?.name || "");
  const [campusId, setCampusId] = useState(user?.campusId || "");
  const [reducedMotion, setReducedMotion] = useState(!!user?.reducedMotion);
  const [notifyEnabled, setNotifyEnabled] = useState(!!user?.notifyEnabled);
  const [savingProfile, setSavingProfile] = useState(false);

  const [payConfigured, setPayConfigured] = useState(null);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    listCampuses().then((d) => setCampuses(d.campuses)).catch(() => {});
    billingStatus().then((d) => setPayConfigured(d.configured)).catch(() => setPayConfigured(false));
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setCampusId(user.campusId || "");
      setReducedMotion(!!user.reducedMotion);
      setNotifyEnabled(!!user.notifyEnabled);
    }
  }, [user]);

  useEffect(() => {
    const u = params.get("upgrade");
    if (u === "success") { push("Welcome to Pro."); refresh(); }
    else if (u === "cancelled") push("Upgrade cancelled.", "info");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveProfile(e) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { user: updated } = await updateMe({
        name,
        campusId: campusId || null,
        reducedMotion,
        notifyEnabled,
      });
      setUser(updated);
      push("Settings saved.");
    } catch (err) {
      push(err.message, "error");
    } finally {
      setSavingProfile(false);
    }
  }

  async function upgrade() {
    setUpgrading(true);
    try {
      const { url } = await startCheckout();
      if (url) window.location.href = url;
    } catch (err) {
      push(err.message, "error");
    } finally {
      setUpgrading(false);
    }
  }

  const isPro = user?.plan === "pro";

  return (
    <AppShell>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-2)" }}>Account, campus, and your Pro plan.</p>

        {/* profile */}
        <form onSubmit={saveProfile} className="mt-8">
          <h2 className="font-semibold text-lg">Profile</h2>
          <div className="card mt-3 space-y-5">
            <div>
              <label htmlFor="s-name" className="block text-sm font-medium mb-1.5">Name</label>
              <input id="s-name" className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label htmlFor="s-email" className="block text-sm font-medium mb-1.5">Email</label>
              <input id="s-email" className="input" value={user?.email || ""} disabled />
            </div>
            <div>
              <label htmlFor="s-campus" className="block text-sm font-medium mb-1.5">Home campus</label>
              <select id="s-campus" className="input" value={campusId} onChange={(e) => setCampusId(e.target.value)}>
                <option value="">No campus selected</option>
                {campuses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <ToggleRow
              label="Reduced motion"
              hint="Freeze telemetry animations and scroll reveals."
              checked={reducedMotion}
              onChange={setReducedMotion}
            />
            <ToggleRow
              label="Notify me about favorites"
              hint={isPro ? "Get alerts when a saved café opens up." : "Available on Pro."}
              checked={notifyEnabled}
              onChange={setNotifyEnabled}
              disabled={!isPro}
            />
          </div>
          <div className="mt-4 flex justify-end">
            <button type="submit" className="btn-primary" disabled={savingProfile}>
              {savingProfile ? <><Spinner /> Saving…</> : "Save changes"}
            </button>
          </div>
        </form>

        {/* Pro */}
        <div className="mt-12">
          <h2 className="font-semibold text-lg">Perch Pro</h2>
          <div className="card mt-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{isPro ? "You're on Pro" : "Free plan"}</p>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-2)" }}>
                  {isPro ? "Real-time alerts, saved presets, and per-venue notify toggles." : "Upgrade for alerts and saved session presets."}
                </p>
              </div>
              <span className="pill" style={isPro ? { background: "var(--brand-soft)", color: "var(--brand-600)", borderColor: "var(--brand)" } : {}}>
                {isPro ? "Pro" : "Free"}
              </span>
            </div>

            {!isPro && (
              <div className="mt-5 pt-5 hairline-t">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold tabular-nums">$4.99</span>
                  <span className="text-sm" style={{ color: "var(--text-2)" }}>/ month · or $39 a year</span>
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  {["Real-time alerts when a favorite opens up", "Saved session preference presets", "Per-venue notify toggles", "Early access to new campuses"].map((t) => (
                    <li key={t} className="flex items-center gap-2">
                      <Icon icon="ph:check-circle-fill" width="16" style={{ color: "var(--brand)" }} /> {t}
                    </li>
                  ))}
                </ul>

                {payConfigured === false && (
                  <div className="mt-5 p-3 rounded-[var(--radius)] flex items-start gap-2" style={{ background: "var(--surface-2)" }}>
                    <Icon icon="ph:info" width="16" style={{ color: "var(--text-2)", marginTop: 1 }} />
                    <p className="text-xs" style={{ color: "var(--text-2)" }}>
                      Payments are not connected on this deployment. Add a Stripe key (STRIPE_SECRET_KEY and STRIPE_PRICE_ID) to enable checkout.
                    </p>
                  </div>
                )}

                <button
                  onClick={upgrade}
                  className="btn-primary w-full mt-5"
                  disabled={upgrading || payConfigured !== true}
                >
                  {upgrading ? <><Spinner /> Opening checkout…</> : payConfigured === true ? "Upgrade to Pro" : "Checkout not available"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function ToggleRow({ label, hint, checked, onChange, disabled }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium" style={{ opacity: disabled ? 0.6 : 1 }}>{label}</p>
        {hint && <p className="text-xs mt-0.5" style={{ color: "var(--text-2)" }}>{hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className="relative w-12 h-7 rounded-full transition-colors flex-shrink-0"
        style={{ background: checked ? "var(--brand)" : "var(--surface-2)", border: "1px solid var(--hairline)", opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
      >
        <span className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow" style={{ left: checked ? "calc(100% - 1.625rem)" : "0.125rem", transition: "left var(--dur-fast) var(--ease-hover)" }} />
      </button>
    </div>
  );
}