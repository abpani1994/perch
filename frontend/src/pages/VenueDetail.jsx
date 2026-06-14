import { useEffect, useState, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { getVenue, getVenueCheckins, addFavorite, openCheckinStream } from "../services/api";
import { FreshnessRing, OutletGauge, LaptopFlag, NoiseChip, CrowdingPill } from "../components/telemetry";
import { NoiseHeatmap } from "../components/NoiseHeatmap";
import { ErrorState, Spinner } from "../components/states";
import { relativeTime, minutesLeft } from "../lib/format";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function VenueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { push } = useToast();

  const [venue, setVenue] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cursor, setCursor] = useState(14);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    Promise.all([getVenue(id), getVenueCheckins(id)])
      .then(([v, c]) => {
        setVenue(v.venue);
        setCheckins(c.checkIns);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // live refresh on check-in for this venue
  useEffect(() => {
    const es = openCheckinStream((ev) => {
      if (ev.venueId === id) load();
    });
    return () => es.close();
  }, [id, load]);

  async function save() {
    if (!user) { navigate("/login"); return; }
    setSaving(true);
    try {
      await addFavorite({ venueId: id });
      push("Saved to favorites.");
    } catch (e) {
      push(e.message, "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <DetailSkeleton />;
  if (error) return (
    <div className="min-h-[100dvh] grid place-items-center p-6" style={{ background: "var(--surface-2)" }}>
      <div className="w-full max-w-md"><ErrorState message={error} onRetry={load} /></div>
    </div>
  );
  if (!venue) return null;

  return (
    <div className="min-h-[100dvh]" style={{ background: "var(--surface-2)" }}>
      {/* topbar */}
      <header className="glass-nav">
        <div className="max-w-4xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-2)" }}>
            <Icon icon="ph:arrow-left" width="18" /> Back
          </button>
          <span className="font-semibold tracking-tight">Perch</span>
          <button onClick={save} className="btn-secondary !py-1.5 text-sm" disabled={saving}>
            {saving ? <Spinner /> : <Icon icon="ph:bookmark-simple" width="16" />} Save
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-6">
        {/* header card */}
        <div className="card">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight truncate">{venue.name}</h1>
              <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>{venue.address}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                <NoiseChip tier={venue.liveNoise} />
                <LaptopFlag policy={venue.laptopPolicy} timeLimitMinutes={venue.timeLimitMinutes} />
                <CrowdingPill crowding={venue.crowding} />
              </div>
            </div>
            <div className="text-center flex-shrink-0">
              <FreshnessRing freshness={venue.freshness} size={56} label={`${Math.round(venue.freshness * 90)}m`} />
              <p className="mono text-[10px] mt-1" style={{ color: "var(--text-2)" }}>freshness</p>
            </div>
          </div>
          <div className="mt-5 pt-5 hairline-t">
            <OutletGauge outletCount={venue.outletCount} outletsFree={venue.outletsFree} />
            <p className="mono text-[11px] mt-2" style={{ color: "var(--text-2)" }}>
              {venue.verifiedAt ? `last verified ${relativeTime(venue.verifiedAt)}` : "not yet verified — check in to set the baseline"}
            </p>
          </div>
          <button onClick={() => navigate("/checkin", { state: { venueId: id, venueName: venue.name } })} className="btn-primary w-full mt-5">
            <Icon icon="ph:hand-tap" width="18" /> Check in here
          </button>
        </div>

        {/* heatmap */}
        <div className="card">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-lg">Noise by hour</h2>
            <span className="mono text-[11px]" style={{ color: "var(--text-2)" }}>drag to plan</span>
          </div>
          <p className="text-sm mb-5" style={{ color: "var(--text-2)" }}>
            Aggregated from check-ins across the day. Scrub to your writing block.
          </p>
          <NoiseHeatmap data={venue.heatmap} cursorHour={cursor} onCursorChange={setCursor} windowHours={3} />
        </div>

        {/* check-in feed */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Recent check-ins</h2>
            <span className="mono text-[11px]" style={{ color: "var(--text-2)" }}>
              {checkins.length} active
            </span>
          </div>
          {checkins.length === 0 ? (
            <div className="text-center py-8">
              <Icon icon="ph:pulse" width="24" style={{ color: "var(--text-2)" }} />
              <p className="text-sm mt-2" style={{ color: "var(--text-2)" }}>
                No active signals. Be the first to check in.
              </p>
            </div>
          ) : (
            <ul className="space-y-px">
              {checkins.map((c) => (
                <li key={c.id} className="flex items-center gap-3 py-3 hairline-t first:border-t-0 first:pt-0">
                  <span className="w-8 h-8 rounded-full grid place-items-center text-[11px] font-semibold flex-shrink-0" style={{ background: "var(--surface-2)", color: "var(--text-1)" }}>
                    {c.by[0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{c.by}</span>
                      <span style={{ color: "var(--text-2)" }}> — {c.outletsFree} outlets free, {c.noiseTier}</span>
                    </p>
                    <p className="mono text-[11px]" style={{ color: "var(--text-2)" }}>
                      {relativeTime(c.createdAt)} · expires in {minutesLeft(c.expiresAt)}m
                    </p>
                  </div>
                  <span
                    className="mono text-[10px] uppercase px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      background: minutesLeft(c.expiresAt) > 60 ? "var(--brand-soft)" : "var(--surface-2)",
                      color: minutesLeft(c.expiresAt) > 60 ? "var(--brand-600)" : "var(--text-2)",
                    }}
                  >
                    {minutesLeft(c.expiresAt) > 60 ? "fresh" : "aging"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Link to="/map" className="inline-flex items-center gap-1.5 text-sm" style={{ color: "var(--brand)" }}>
          <Icon icon="ph:arrow-left" width="15" /> Back to map
        </Link>
      </main>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="min-h-[100dvh]" style={{ background: "var(--surface-2)" }}>
      <div className="glass-nav h-14" />
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-6">
        <div className="card">
          <div className="shimmer h-7 w-1/2 mb-3" />
          <div className="shimmer h-4 w-1/3 mb-5" />
          <div className="shimmer h-2 w-full rounded-full" />
          <div className="shimmer h-10 w-full mt-5" />
        </div>
        <div className="card">
          <div className="shimmer h-5 w-1/4 mb-5" />
          <div className="shimmer h-24 w-full" />
        </div>
      </div>
    </div>
  );
}