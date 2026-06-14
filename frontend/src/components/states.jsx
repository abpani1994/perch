import { Icon } from "@iconify/react";

export function EmptyState({ icon = "ph:coffee", title, body, action }) {
  return (
    <div className="card flex flex-col items-center text-center py-12 px-6">
      <span className="w-12 h-12 grid place-items-center rounded-full mb-4" style={{ background: "var(--surface-2)" }}>
        <Icon icon={icon} width="24" style={{ color: "var(--text-2)" }} />
      </span>
      <h3 className="font-semibold text-base" style={{ color: "var(--text-1)" }}>{title}</h3>
      {body && <p className="text-sm mt-1.5 max-w-sm" style={{ color: "var(--text-2)" }}>{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="card flex flex-col items-center text-center py-10 px-6">
      <Icon icon="ph:warning-circle" width="26" style={{ color: "#dc2626" }} />
      <p className="text-sm mt-3 max-w-sm" style={{ color: "var(--text-1)" }}>
        {message || "We could not load this. Try again."}
      </p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary mt-4">
          <Icon icon="ph:arrow-clockwise" width="16" /> Retry
        </button>
      )}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card !p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="shimmer h-4 w-2/3 mb-2" />
          <div className="shimmer h-3 w-1/4" />
        </div>
        <div className="shimmer rounded-full" style={{ width: 44, height: 44 }} />
      </div>
      <div className="shimmer h-2 w-full mt-4 rounded-full" />
      <div className="flex gap-3 mt-4">
        <div className="shimmer h-3 w-20" />
        <div className="shimmer h-3 w-24" />
      </div>
      <div className="shimmer h-3 w-full mt-4" />
    </div>
  );
}

export function Spinner({ size = 16 }) {
  return (
    <Icon icon="ph:circle-notch" width={size} className="animate-spin" />
  );
}