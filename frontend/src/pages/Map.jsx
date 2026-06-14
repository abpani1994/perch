import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import AppShell from "../components/AppShell";
import { VenueReadoutCard } from "../components/telemetry";
import { CardSkeleton, EmptyState, ErrorState } from "../components/states";
import { listCampuses, listVenues, openCheckinStream } from "../services/api";
import { useAuth } from "../context/AuthContext";

const SORTS = [
  { key: "distance", label: "Nearest" },
  { key: "outlets", label: "Most outlets" },
  { key: "noise", label: "Quietest" },
  { key: "freshness", label: "Freshest signal" },
];

export default function Map() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [campuses, setCampuses] = useState([]);
  const [campusId, setCampusId] = useState(localStorage.getItem("perch.campus") || "");
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sort, setSort] = useState("distance");
  const [filters, setFilters] = useState({ laptop: false, minOutlets: 0, maxNoise: "" });
  const [activeId, setActiveId] = useState(null);
  const [liveBump, setLiveBump] = useState(0);

  // load campuses
  useEffect(() => {
    listCampuses()
      .then((d) => {
        setCampuses(d.campuses);
        if (!campusId && d.campuses.length) {
          const initial = user?.campusId || d.campuses[0].id;
          setCampusId(initial);
        }
      })
      .catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchVenues = useCallback(() => {
    if (!campusId) return;
    setLoading(true);
    setError("");
    listVenues({
      campusId,
      sort,
      laptop: filters.laptop ? "ok" : "",
      minOutlets: filters.minOutlets || "",
      maxNoise: filters.maxNoise,
    })
      .then((d) => setVenues(d.venues))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [campusId, sort, filters]);

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  useEffect(() => {
    if (campusId) localStorage.setItem("perch.campus", campusId);
  }, [campusId]);

  // live stream — refetch (debounced) when a check-in lands
  const timer = useRef(null);
  useEffect(() => {
    const es = openCheckinStream(() => {
      setLiveBump((n) => n + 1);
      clearTimeout(timer.current);
      timer.current = setTimeout(fetchVenues, 1200);
    });
    return () => { es.close(); clearTimeout(timer.current); };
  }, [fetchVenues]);

  const activeFilterCount = useMemo(
    () => (filters.laptop ? 1 : 0) + (filters.minOutlets ? 1 : 0) + (filters.maxNoise ? 1 : 0),
    [filters]
  );

  const campusName = campuses.find((c) => c.id === campusId)?.name || "your campus";

  return (
    <AppShell wide>
      <div className="max-w-6xl mx-auto w-full">
        {/* header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Cafés near {campusName}</h1>
            <p className="text-sm flex items-center gap-1.5 mt-0.5" style={{ color: "var(--text-2)" }}>
              <span className="live-dot" /> live readouts within 1.5 miles
            </p>
          </div>
          <select
            className="input !w-auto"
            value={campusId}
            onChange={(e) => setCampusId(e.target.value)}
            aria-label="Campus"
          >
            {campuses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* filter + sort bar */}
        <div className="card !p-3 mb-5 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilters((f) => ({ ...f, laptop: !f.laptop }))}
            className="pill"
            style={filters.laptop ? { background: "var(--brand-soft)", color: "var(--brand-600)", borderColor: "var(--brand)" } : {}}
          >
            <Icon icon="ph:laptop" width="14" /> Laptops OK
          </button>
          <select
            className="pill !pr-2"
            value={filters.minOutlets}
            onChange={(e) => setFilters((f) => ({ ...f, minOutlets: Number(e.target.value) }))}
            aria-label="Minimum outlets"
            style={filters.minOutlets ? { background: "var(--brand-soft)", color: "var(--brand-600)", borderColor: "var(--brand)" } : {}}
          >
            <option value={0}>Any outlets</option>
            <option value={2}>2+ outlets</option>
            <option value={4}>4+ outlets</option>
            <option value={6}>6+ outlets</option>
          </select>
          <select
            className="pill !pr-2"
            value={filters.maxNoise}
            onChange={(e) => setFilters((f) => ({ ...f, maxNoise: e.target.value }))}
            aria-label="Max noise"
            style={filters.maxNoise ? { background: "var(--brand-soft)", color: "var(--brand-600)", borderColor: "var(--brand)" } : {}}
          >
            <option value="">Any noise</option>
            <option value="silent">Silent only</option>
            <option value="ambient">Ambient or quieter</option>
          </select>

          {activeFilterCount > 0 && (
            <button
              onClick={() => setFilters({ laptop: false, minOutlets: 0, maxNoise: "" })}
              className="text-xs ml-1"
              style={{ color: "var(--text-2)" }}
            >
              Clear ({activeFilterCount})
            </button>
          )}

          <div className="ml-auto flex items-center gap-2">
            <span className="mono text-[11px] uppercase tracking-wide" style={{ color: "var(--text-2)" }}>Sort</span>
            <select className="pill !pr-2" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort venues">
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* content */}
        {error ? (
          <ErrorState message={error} onRetry={fetchVenues} />
        ) : loading ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : venues.length === 0 ? (
          <EmptyState
            icon="ph:coffee"
            title="No fresh signals near you"
            body="No venues match these filters yet. Loosen a filter, or be the first to check in at a café you know."
            action={
              <button onClick={() => setFilters({ laptop: false, minOutlets: 0, maxNoise: "" })} className="btn-secondary">
                Clear filters
              </button>
            }
          />
        ) : (
          <>
            <p className="mono text-xs mb-3" style={{ color: "var(--text-2)" }}>
              {venues.length} venue{venues.length === 1 ? "" : "s"}{liveBump > 0 ? " · just updated" : ""}
            </p>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {venues.map((v) => (
                <VenueReadoutCard
                  key={v.id}
                  venue={v}
                  active={activeId === v.id}
                  onClick={() => { setActiveId(v.id); navigate(`/venue/${v.id}`); }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}