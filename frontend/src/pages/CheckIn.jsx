import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { listCampuses, listVenues, checkInVenue } from "../services/api";
import { ErrorState, Spinner } from "../components/states";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const NOISE = [
  { key: "silent", label: "Silent", icon: "ph:moon-stars" },
  { key: "ambient", label: "Ambient", icon: "ph:waveform" },
  { key: "loud", label: "Loud", icon: "ph:speaker-high" },
];
const CROWD = [
  { key: "quiet", label: "Quiet" },
  { key: "moderate", label: "Moderate" },
  { key: "packed", label: "Packed" },
];

export default function CheckIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { push } = useToast();

  const preVenue = location.state?.venueId;
  const [campuses, setCampuses] = useState([]);
  const [campusId, setCampusId] = useState(localStorage.getItem("perch.campus") || "");
  const [venues, setVenues] = useState([]);
  const [venueId, setVenueId] = useState(preVenue || "");
  const [loadingVenues, setLoadingVenues] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [outlets, setOutlets] = useState(2);
  const [noise, setNoise] = useState("ambient");
  const [crowd, setCrowd] = useState("moderate");
  const [laptopOk, setLaptopOk] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);

  useEffect(() => {
    if (!user) navigate("/login", { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    listCampuses()
      .then((d) => {
        setCampuses(d.campuses);
        if (!campusId && d.campuses.length) setCampusId(user?.campusId || d.campuses[0].id);
      })
      .catch((e) => setLoadError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadVenues = useCallback(() => {
    if (!campusId) return;
    setLoadingVenues(true);
    setLoadError("");
    listVenues({ campusId, sort: "distance" })
      .then((d) => {
        setVenues(d.venues);
        if (preVenue && d.venues.some((v) => v.id === preVenue)) setVenueId(preVenue);
        else if (!d.venues.some((v) => v.id === venueId)) setVenueId(d.venues[0]?.id || "");
      })
      .catch((e) => setLoadError(e.message))
      .finally(() => setLoadingVenues(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campusId]);

  useEffect(() => { loadVenues(); }, [loadVenues]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!venueId) { setError("Pick the café you're at."); return; }
    setSubmitting(true);
    try {
      const { checkIn } = await checkInVenue(venueId, {
        outletsFree: outlets,
        noiseTier: noise,
        laptopOk,
        crowding: crowd,
      });
      const venueName = venues.find((v) => v.id === venueId)?.name || "this café";
      setDone({ ...checkIn, venueName });
      push("Checked in. Thanks for keeping it honest.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) return <Confirmation done={done} onAgain={() => setDone(null)} navigate={navigate} />;

  return (
    <div className="min-h-[100dvh]" style={{ background: "var(--surface-2)" }}>
      <header className="glass-nav">
        <div className="max-w-2xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-2)" }}>
            <Icon icon="ph:arrow-left" width="18" /> Back
          </button>
          <span className="font-semibold tracking-tight">One-tap check-in</span>
          <span className="w-12" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-8 py-8">
        {loadError ? (
          <ErrorState message={loadError} onRetry={loadVenues} />
        ) : (
          <form onSubmit={submit} className="card space-y-7">
            {/* venue picker */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ci-campus" className="block text-sm font-medium mb-1.5">Campus</label>
                <select id="ci-campus" className="input" value={campusId} onChange={(e) => setCampusId(e.target.value)}>
                  {campuses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="ci-venue" className="block text-sm font-medium mb-1.5">Café</label>
                <select id="ci-venue" className="input" value={venueId} onChange={(e) => setVenueId(e.target.value)} disabled={loadingVenues}>
                  {loadingVenues && <option>Loading…</option>}
                  {venues.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
            </div>

            {/* outlets stepper */}
            <div>
              <label className="block text-sm font-medium mb-2">Outlets free right now</label>
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => setOutlets((n) => Math.max(0, n - 1))} className="btn-secondary !px-0 w-11 h-11" aria-label="Fewer outlets">
                  <Icon icon="ph:minus" width="18" />
                </button>
                <span className="text-3xl font-semibold tabular-nums w-12 text-center">{outlets}</span>
                <button type="button" onClick={() => setOutlets((n) => Math.min(99, n + 1))} className="btn-secondary !px-0 w-11 h-11" aria-label="More outlets">
                  <Icon icon="ph:plus" width="18" />
                </button>
              </div>
            </div>

            {/* noise segmented */}
            <Segmented label="Noise level now" options={NOISE} value={noise} onChange={setNoise} />

            {/* crowding segmented */}
            <Segmented label="How crowded" options={CROWD} value={crowd} onChange={setCrowd} />

            {/* laptop toggle */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium">Laptops allowed right now</span>
              <button
                type="button"
                role="switch"
                aria-checked={laptopOk}
                onClick={() => setLaptopOk((v) => !v)}
                className="relative w-12 h-7 rounded-full transition-colors"
                style={{ background: laptopOk ? "var(--brand)" : "var(--surface-2)", border: "1px solid var(--hairline)" }}
              >
                <span
                  className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow"
                  style={{ left: laptopOk ? "calc(100% - 1.625rem)" : "0.125rem", transition: "left var(--dur-fast) var(--ease-hover)" }}
                />
              </button>
            </label>

            {error && (
              <p className="text-sm flex items-center gap-1.5" style={{ color: "#dc2626" }}>
                <Icon icon="ph:warning-circle" width="15" /> {error}
              </p>
            )}

            <button type="submit" className="btn-primary w-full" disabled={submitting || !venueId}>
              {submitting ? <><Spinner /> Posting…</> : <><Icon icon="ph:hand-tap" width="18" /> Post check-in</>}
            </button>
            <p className="mono text-[11px] text-center" style={{ color: "var(--text-2)" }}>
              Your signal expires automatically in 90 minutes.
            </p>
          </form>
        )}
      </main>
    </div>
  );
}

function Segmented({ label, options, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}>
        {options.map((o) => {
          const on = value === o.key;
          return (
            <button
              key={o.key}
              type="button"
              onClick={() => onChange(o.key)}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-[var(--radius)] text-sm font-medium transition-colors"
              style={{
                background: on ? "var(--brand-soft)" : "var(--surface)",
                color: on ? "var(--brand-600)" : "var(--text-2)",
                border: `1px solid ${on ? "var(--brand)" : "var(--hairline)"}`,
              }}
            >
              {o.icon && <Icon icon={o.icon} width="15" />}
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Confirmation({ done, onAgain, navigate }) {
  const [left, setLeft] = useState(90);
  useEffect(() => {
    const t = setInterval(() => {
      const m = Math.max(0, Math.round((new Date(done.expiresAt).getTime() - Date.now()) / 60000));
      setLeft(m);
    }, 1000);
    return () => clearInterval(t);
  }, [done]);

  return (
    <div className="min-h-[100dvh] grid place-items-center p-6" style={{ background: "var(--surface-2)" }}>
      <div className="card max-w-sm w-full text-center !p-8">
        <span className="w-14 h-14 grid place-items-center rounded-full mx-auto" style={{ background: "var(--brand-soft)" }}>
          <Icon icon="ph:check" width="28" style={{ color: "var(--brand)" }} />
        </span>
        <h1 className="text-xl font-semibold mt-5">You&rsquo;re on the board</h1>
        <p className="text-sm mt-1.5" style={{ color: "var(--text-2)" }}>
          {done.outletsFree} outlets free, {done.noiseTier} at {done.venueName}.
        </p>
        <div className="mt-6 p-4 rounded-[var(--radius)]" style={{ background: "var(--surface-2)" }}>
          <p className="mono text-[11px] uppercase tracking-wide" style={{ color: "var(--text-2)" }}>Signal expires in</p>
          <p className="text-3xl font-semibold tabular-nums mt-1" style={{ color: "var(--brand)" }}>{left}m</p>
        </div>
        <div className="mt-6 flex gap-2">
          <button onClick={onAgain} className="btn-secondary flex-1">Check in again</button>
          <button onClick={() => navigate("/map")} className="btn-primary flex-1">Back to map</button>
        </div>
      </div>
    </div>
  );
}