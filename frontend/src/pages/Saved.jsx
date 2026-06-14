import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import AppShell from "../components/AppShell";
import { CardSkeleton, EmptyState, ErrorState, Spinner } from "../components/states";
import { FreshnessRing, NoiseChip, LaptopFlag, OutletGauge } from "../components/telemetry";
import {
  listFavorites, removeFavorite, updateFavorite,
  listPrefs, createPref, deletePref,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { hourLabel, relativeTime } from "../lib/format";

const NOISE = ["silent", "ambient", "loud"];

export default function Saved() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { push } = useToast();
  const isPro = user?.plan === "pro";

  const [tab, setTab] = useState("favorites");
  const [favs, setFavs] = useState([]);
  const [prefs, setPrefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    Promise.all([listFavorites(), listPrefs()])
      .then(([f, p]) => { setFavs(f.favorites); setPrefs(p.prefs); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function unfav(id) {
    setFavs((f) => f.filter((x) => x.id !== id));
    try { await removeFavorite(id); push("Removed from favorites."); }
    catch (e) { push(e.message, "error"); load(); }
  }

  async function toggleNotify(fav) {
    if (!isPro) { push("Notify alerts are a Pro feature.", "info"); return; }
    const next = !fav.notify;
    setFavs((f) => f.map((x) => x.id === fav.id ? { ...x, notify: next } : x));
    try { await updateFavorite(fav.id, { notify: next }); }
    catch (e) { push(e.message, "error"); load(); }
  }

  async function rmPref(id) {
    setPrefs((p) => p.filter((x) => x.id !== id));
    try { await deletePref(id); push("Preset deleted."); }
    catch (e) { push(e.message, "error"); load(); }
  }

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold tracking-tight">Saved</h1>
      <p className="text-sm mt-0.5" style={{ color: "var(--text-2)" }}>
        Your favorite venues and the session presets you plan around.
      </p>

      <div className="flex gap-2 mt-5 mb-6">
        {[["favorites", "Favorites"], ["presets", "Session presets"]].map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className="px-4 py-2 rounded-[var(--radius)] text-sm font-medium transition-colors"
            style={tab === k
              ? { background: "var(--brand-soft)", color: "var(--brand-600)" }
              : { color: "var(--text-2)" }}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          <CardSkeleton /><CardSkeleton />
        </div>
      ) : tab === "favorites" ? (
        favs.length === 0 ? (
          <EmptyState
            icon="ph:bookmark-simple"
            title="No favorites yet"
            body="Save a café from the map and it shows up here with its live readout — plus Pro alerts when it opens up."
            action={<button onClick={() => navigate("/map")} className="btn-primary">Browse the map</button>}
          />
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {favs.map((f) => (
              <div key={f.id} className="card !p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <button onClick={() => navigate(`/venue/${f.venue.id}`)} className="font-semibold text-base text-left truncate hover:underline">
                      {f.venue.name}
                    </button>
                    <p className="mono text-[11px] mt-0.5" style={{ color: "var(--text-2)" }}>
                      {f.venue.verifiedAt ? `verified ${relativeTime(f.venue.verifiedAt)}` : "no recent signal"}
                    </p>
                  </div>
                  <FreshnessRing freshness={f.venue.freshness} />
                </div>
                <div className="mt-3"><OutletGauge outletCount={f.venue.outletCount} outletsFree={f.venue.outletsFree} /></div>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                  <NoiseChip tier={f.venue.liveNoise} />
                  <LaptopFlag policy={f.venue.laptopPolicy} timeLimitMinutes={f.venue.timeLimitMinutes} />
                </div>
                <div className="mt-3 pt-3 hairline-t flex items-center justify-between">
                  <button onClick={() => toggleNotify(f)} className="flex items-center gap-2 text-sm" style={{ color: f.notify ? "var(--brand)" : "var(--text-2)" }}>
                    <Icon icon={f.notify ? "ph:bell-ringing-fill" : "ph:bell"} width="16" />
                    {f.notify ? "Alerts on" : "Alerts off"}
                    {!isPro && <span className="pill !py-0 !text-[10px]">Pro</span>}
                  </button>
                  <button onClick={() => unfav(f.id)} className="text-sm" style={{ color: "var(--text-2)" }} aria-label="Remove favorite">
                    <Icon icon="ph:trash" width="16" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <PresetsTab prefs={prefs} setPrefs={setPrefs} onDelete={rmPref} push={push} />
      )}
    </AppShell>
  );
}

function PresetsTab({ prefs, onDelete, setPrefs, push }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ label: "", hour: 14, minNoise: "silent", minOutlets: 2, laptopRequired: true });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function add(e) {
    e.preventDefault();
    setErr("");
    if (!form.label.trim()) { setErr("Name this preset."); return; }
    setSaving(true);
    try {
      const { pref } = await createPref(form);
      setPrefs((p) => [pref, ...p]);
      setOpen(false);
      setForm({ label: "", hour: 14, minNoise: "silent", minOutlets: 2, laptopRequired: true });
      push("Preset saved.");
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setOpen((v) => !v)} className="btn-secondary">
          <Icon icon="ph:plus" width="16" /> New preset
        </button>
      </div>

      {open && (
        <form onSubmit={add} className="card mb-5 space-y-4">
          <div>
            <label htmlFor="p-label" className="block text-sm font-medium mb-1.5">Label</label>
            <input id="p-label" className="input" placeholder="2pm silent, 2+ outlets" value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="p-hour" className="block text-sm font-medium mb-1.5">Hour</label>
              <select id="p-hour" className="input" value={form.hour} onChange={(e) => setForm((f) => ({ ...f, hour: Number(e.target.value) }))}>
                {Array.from({ length: 24 }).map((_, h) => <option key={h} value={h}>{hourLabel(h)}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="p-noise" className="block text-sm font-medium mb-1.5">Max noise</label>
              <select id="p-noise" className="input" value={form.minNoise} onChange={(e) => setForm((f) => ({ ...f, minNoise: e.target.value }))}>
                {NOISE.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="p-outlets" className="block text-sm font-medium mb-1.5">Min outlets</label>
              <input id="p-outlets" type="number" min="0" max="20" className="input" value={form.minOutlets} onChange={(e) => setForm((f) => ({ ...f, minOutlets: Number(e.target.value) }))} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.laptopRequired} onChange={(e) => setForm((f) => ({ ...f, laptopRequired: e.target.checked }))} />
            Laptops must be allowed
          </label>
          {err && <p className="text-sm" style={{ color: "#dc2626" }}>{err}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? <Spinner /> : "Save preset"}</button>
          </div>
        </form>
      )}

      {prefs.length === 0 ? (
        <EmptyState
          icon="ph:sliders-horizontal"
          title="No session presets yet"
          body="Save a preset like “2pm silent, 2+ outlets” and Perch remembers exactly what your writing block needs."
          action={<button onClick={() => setOpen(true)} className="btn-primary">Create your first preset</button>}
        />
      ) : (
        <ul className="space-y-3">
          {prefs.map((p) => (
            <li key={p.id} className="card !p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium truncate">{p.label}</p>
                <p className="mono text-[11px] mt-0.5" style={{ color: "var(--text-2)" }}>
                  {hourLabel(p.hour)} · ≤ {p.minNoise} · {p.minOutlets}+ outlets{p.laptopRequired ? " · laptops OK" : ""}
                </p>
              </div>
              <button onClick={() => onDelete(p.id)} aria-label="Delete preset" style={{ color: "var(--text-2)" }}>
                <Icon icon="ph:trash" width="17" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}