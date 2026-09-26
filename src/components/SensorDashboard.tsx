/**
 * SensorDashboard — Panel de monitoreo en tiempo real para SentraCore.
 *
 * Muestra el estado de todos los sensores, las lecturas actuales, el
 * flujo de eventos de percepción y las acciones disparadas por el
 * SensorModule.
 */

import { useEffect, useRef, useState } from "react";
import {
  sensorHub,
  type SensorDescriptor,
  type SensorStatus,
  type SensorReading,
} from "../core/SensorHub";
import {
  perceptionEngine,
  type PerceptionEvent,
} from "../core/PerceptionEngine";
import {
  sensorModule,
  type SensorAction,
} from "../modules/SensorModule";

// ──────────────────────────────────────────────────────────────────────────
// Utilidades de presentación
// ──────────────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  ambient: "Ambiental",
  motion: "Movimiento",
  vision: "Visión",
  audio: "Audio",
  contact: "Contacto",
  gas: "Gas",
  flow: "Flujo",
  location: "Ubicación",
};

const STATUS_COLORS: Record<SensorStatus, { bg: string; dot: string; text: string }> = {
  online: { bg: "rgba(34,197,94,0.12)", dot: "#22c55e", text: "#4ade80" },
  offline: { bg: "rgba(100,116,139,0.12)", dot: "#64748b", text: "#94a3b8" },
  warning: { bg: "rgba(234,179,8,0.12)", dot: "#eab308", text: "#facc15" },
  error: { bg: "rgba(239,68,68,0.12)", dot: "#ef4444", text: "#f87171" },
};

const LEVEL_COLORS: Record<string, string> = {
  info: "#38bdf8",
  warning: "#facc15",
  critical: "#f87171",
};

const ACTION_COLORS: Record<string, string> = {
  alert: "#fbbf24",
  log: "#64748b",
  activate_ventilation: "#38bdf8",
  activate_alarm: "#f87171",
  shutdown_flow: "#fb7185",
  notify_operator: "#a78bfa",
  start_recording: "#34d399",
  dispatch_security: "#f472b6",
};

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// ──────────────────────────────────────────────────────────────────────────
// Componente principal
// ──────────────────────────────────────────────────────────────────────────

export function SensorDashboard() {
  const [descriptors, setDescriptors] = useState<SensorDescriptor[]>([]);
  const [readings, setReadings] = useState<Map<string, SensorReading>>(new Map());
  const [events, setEvents] = useState<PerceptionEvent[]>([]);
  const [actions, setActions] = useState<SensorAction[]>([]);
  const [running, setRunning] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const tickRef = useRef(0);

  // Suscribirse a lecturas, eventos y acciones
  useEffect(() => {
    const unsubReading = sensorHub.onReading((r) => {
      setReadings((prev) => {
        const next = new Map(prev);
        next.set(r.sensorId, r);
        return next;
      });
    });
    const unsubEvent = perceptionEngine.onEvent((e) => {
      setEvents((prev) => [e, ...prev].slice(0, 50));
    });
    const unsubAction = sensorModule.onAction((a) => {
      setActions((prev) => [a, ...prev].slice(0, 50));
    });

    return () => {
      unsubReading();
      unsubEvent();
      unsubAction();
    };
  }, []);

  // Actualizar descriptores periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      setDescriptors(sensorHub.getDescriptors());
      tickRef.current++;
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    sensorHub.startAll();
    perceptionEngine.start();
    sensorModule.start();
    setRunning(true);
    setDescriptors(sensorHub.getDescriptors());
  };

  const handleStop = () => {
    sensorHub.stopAll();
    perceptionEngine.stop();
    sensorModule.stop();
    setRunning(false);
  };

  const filteredDescriptors =
    activeCategory === "all"
      ? descriptors
      : descriptors.filter((d) => d.category === activeCategory);

  const onlineCount = descriptors.filter((d) => d.status === "online").length;
  const warningCount = descriptors.filter((d) => d.status === "warning").length;
  const errorCount = descriptors.filter((d) => d.status === "error").length;
  const criticalEvents = events.filter((e) => e.level === "critical").length;

  const categories = ["all", ...Object.keys(CATEGORY_LABELS)];

  return (
    <div style={styles.page}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logoDot} />
          <div>
            <h1 style={styles.title}>SentraCore</h1>
            <p style={styles.subtitle}>Red de Sensores · v4.2.1</p>
          </div>
        </div>
        <div style={styles.headerRight}>
          <StatusPill label="En línea" value={onlineCount} color="#4ade80" />
          <StatusPill label="Advertencia" value={warningCount} color="#facc15" />
          <StatusPill label="Error" value={errorCount} color="#f87171" />
          <StatusPill label="Críticos" value={criticalEvents} color="#fb7185" />
          <button
            style={running ? styles.btnStop : styles.btnStart}
            onClick={running ? handleStop : handleStart}
          >
            {running ? "Detener" : "Iniciar monitoreo"}
          </button>
        </div>
      </header>

      {/* ── Filtro por categoría ───────────────────────────────────────── */}
      <div style={styles.filterBar}>
        {categories.map((cat) => (
          <button
            key={cat}
            style={activeCategory === cat ? styles.filterBtnActive : styles.filterBtn}
            onClick={() => setActiveCategory(cat)}
          >
            {cat === "all" ? "Todos" : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* ── Grid de sensores ────────────────────────────────────────────── */}
      <section style={styles.gridSection}>
        <h2 style={styles.sectionTitle}>
          Sensores activos
          <span style={styles.sectionCount}>{filteredDescriptors.length}</span>
        </h2>
        <div style={styles.grid}>
          {filteredDescriptors.map((d) => (
            <SensorCard
              key={d.id}
              descriptor={d}
              reading={readings.get(d.id) ?? null}
            />
          ))}
          {filteredDescriptors.length === 0 && (
            <div style={styles.emptyState}>
              {running
                ? "No hay sensores registrados en esta categoría."
                : "Pulsa «Iniciar monitoreo» para activar la red de sensores."}
            </div>
          )}
        </div>
      </section>

      {/* ── Panel de eventos y acciones ─────────────────────────────────── */}
      <section style={styles.dualPanel}>
        <div style={styles.panelColumn}>
          <h2 style={styles.sectionTitle}>
            Eventos de percepción
            <span style={styles.sectionCount}>{events.length}</span>
          </h2>
          <div style={styles.logBox}>
            {events.length === 0 && (
              <div style={styles.logEmpty}>Sin eventos. Esperando lecturas…</div>
            )}
            {events.map((e) => (
              <div key={e.id} style={styles.logRow}>
                <span style={{ ...styles.logTime, color: LEVEL_COLORS[e.level] }}>
                  {formatTime(e.timestamp)}
                </span>
                <span
                  style={{
                    ...styles.logBadge,
                    backgroundColor: `${LEVEL_COLORS[e.level]}22`,
                    color: LEVEL_COLORS[e.level],
                  }}
                >
                  {e.level}
                </span>
                <span style={styles.logCategory}>
                  {CATEGORY_LABELS[e.category] ?? e.category}
                </span>
                <span style={styles.logMessage}>{e.message}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.panelColumn}>
          <h2 style={styles.sectionTitle}>
            Acciones disparadas
            <span style={styles.sectionCount}>{actions.length}</span>
          </h2>
          <div style={styles.logBox}>
            {actions.length === 0 && (
              <div style={styles.logEmpty}>Sin acciones. Las reglas se evaluarán automáticamente.</div>
            )}
            {actions.map((a, i) => (
              <div key={`${a.eventId}-${i}`} style={styles.logRow}>
                <span style={{ ...styles.logTime, color: ACTION_COLORS[a.type] ?? "#94a3b8" }}>
                  {formatTime(a.timestamp)}
                </span>
                <span
                  style={{
                    ...styles.logBadge,
                    backgroundColor: `${ACTION_COLORS[a.type] ?? "#94a3b8"}22`,
                    color: ACTION_COLORS[a.type] ?? "#94a3b8",
                  }}
                >
                  {a.type}
                </span>
                <span style={styles.logMessage}>{a.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer style={styles.footer}>
        Cuando todo lo demás se apaga, los sensores persisten.
      </footer>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Sub-componentes
// ──────────────────────────────────────────────────────────────────────────

function StatusPill({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div style={styles.pill}>
      <span style={{ ...styles.pillDot, backgroundColor: color }} />
      <span style={styles.pillLabel}>{label}</span>
      <span style={{ ...styles.pillValue, color }}>{value}</span>
    </div>
  );
}

function SensorCard({
  descriptor,
  reading,
}: {
  descriptor: SensorDescriptor;
  reading: SensorReading | null;
}) {
  const sc = STATUS_COLORS[descriptor.status];
  const valueLines = reading ? formatReading(reading) : ["—"];

  return (
    <div
      style={{
        ...styles.card,
        backgroundColor: sc.bg,
        borderColor: `${sc.dot}33`,
      }}
    >
      <div style={styles.cardHeader}>
        <div style={styles.cardHeaderLeft}>
          <span style={{ ...styles.cardDot, backgroundColor: sc.dot }} />
          <span style={{ ...styles.cardCategory, color: sc.text }}>
            {CATEGORY_LABELS[descriptor.category] ?? descriptor.category}
          </span>
        </div>
        <span style={{ ...styles.cardStatus, color: sc.text }}>
          {descriptor.status}
        </span>
      </div>
      <h3 style={styles.cardName}>{descriptor.name}</h3>
      <p style={styles.cardLocation}>{descriptor.location}</p>
      <div style={styles.cardReadings}>
        {valueLines.map((line, i) => (
          <div key={i} style={styles.cardReadingLine}>
            {line}
          </div>
        ))}
      </div>
      <div style={styles.cardFooter}>
        <span style={styles.cardRate}>{descriptor.sampleRateHz} Hz</span>
        {reading && (
          <span style={styles.cardConfidence}>
            {(reading.confidence * 100).toFixed(0)}% confianza
          </span>
        )}
      </div>
    </div>
  );
}

function formatReading(reading: SensorReading): string[] {
  const v = reading.value as Record<string, unknown>;
  const lines: string[] = [];
  for (const [key, val] of Object.entries(v)) {
    if (typeof val === "number") {
      lines.push(`${key}: ${val.toFixed(val % 1 === 0 ? 0 : 2)}`);
    } else if (typeof val === "boolean") {
      lines.push(`${key}: ${val ? "sí" : "no"}`);
    } else if (Array.isArray(val)) {
      lines.push(`${key}: [${val.length}]`);
    } else if (typeof val === "string") {
      lines.push(`${key}: ${val}`);
    }
  }
  return lines.length > 0 ? lines : ["—"];
}

// ──────────────────────────────────────────────────────────────────────────
// Estilos
// ──────────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  page: {
    position: "relative",
    zIndex: 20,
    minHeight: "100vh",
    backgroundColor: "#0a0e1a",
    color: "#e2e8f0",
    fontFamily: "'Inter', system-ui, sans-serif",
    padding: "24px 32px 48px",
    maxWidth: 1400,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap" as const,
    gap: 16,
    paddingBottom: 24,
    borderBottom: "1px solid rgba(148,163,184,0.1)",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  logoDot: {
    width: 12,
    height: 12,
    borderRadius: "50%",
    backgroundColor: "#22c55e",
    boxShadow: "0 0 12px #22c55e",
  flexShrink: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    margin: 0,
    letterSpacing: "-0.02em",
  },
  subtitle: {
    fontSize: 12,
    color: "#64748b",
    margin: "2px 0 0",
    fontFamily: "'JetBrains Mono', monospace",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap" as const,
  },
  pill: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    borderRadius: 8,
    backgroundColor: "rgba(148,163,184,0.08)",
    border: "1px solid rgba(148,163,184,0.12)",
  },
  pillDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
  },
  pillLabel: {
    fontSize: 12,
    color: "#94a3b8",
  },
  pillValue: {
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "'JetBrains Mono', monospace",
  },
  btnStart: {
    padding: "8px 18px",
    borderRadius: 8,
    border: "none",
    backgroundColor: "#22c55e",
    color: "#0a0e1a",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  btnStop: {
    padding: "8px 18px",
    borderRadius: 8,
    border: "1px solid #ef4444",
    backgroundColor: "transparent",
    color: "#f87171",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  filterBar: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap" as const,
    padding: "20px 0",
  },
  filterBtn: {
    padding: "6px 14px",
    borderRadius: 6,
    border: "1px solid rgba(148,163,184,0.15)",
    backgroundColor: "transparent",
    color: "#94a3b8",
    fontSize: 12,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  filterBtnActive: {
    padding: "6px 14px",
    borderRadius: 6,
    border: "1px solid #38bdf8",
    backgroundColor: "rgba(56,189,248,0.1)",
    color: "#38bdf8",
    fontSize: 12,
    cursor: "pointer",
    fontWeight: 600,
  },
  gridSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "#cbd5e1",
    margin: "0 0 16px",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  sectionCount: {
    fontSize: 11,
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: 10,
    backgroundColor: "rgba(148,163,184,0.12)",
    color: "#94a3b8",
    fontFamily: "'JetBrains Mono', monospace",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 14,
  },
  emptyState: {
    gridColumn: "1 / -1",
    padding: "40px 20px",
    textAlign: "center" as const,
    color: "#64748b",
    fontSize: 14,
    border: "1px dashed rgba(148,163,184,0.15)",
    borderRadius: 12,
  },
  card: {
    borderRadius: 12,
    border: "1px solid",
    padding: 16,
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
    cursor: "default",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  cardDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    flexShrink: 0,
  },
  cardCategory: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
  },
  cardStatus: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: "capitalize" as const,
    fontFamily: "'JetBrains Mono', monospace",
  },
  cardName: {
    fontSize: 15,
    fontWeight: 600,
    margin: "0 0 2px",
    color: "#f1f5f9",
  },
  cardLocation: {
    fontSize: 12,
    color: "#64748b",
    margin: "0 0 12px",
  },
  cardReadings: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 3,
    padding: "10px 0",
    borderTop: "1px solid rgba(148,163,184,0.08)",
    borderBottom: "1px solid rgba(148,163,184,0.08)",
    marginBottom: 10,
    minHeight: 60,
  },
  cardReadingLine: {
    fontSize: 12,
    fontFamily: "'JetBrains Mono', monospace",
    color: "#cbd5e1",
    lineHeight: 1.6,
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 11,
    color: "#64748b",
    fontFamily: "'JetBrains Mono', monospace",
  },
  cardRate: {},
  cardConfidence: {},
  dualPanel: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
  },
  panelColumn: {
    display: "flex",
    flexDirection: "column" as const,
  },
  logBox: {
    backgroundColor: "rgba(15,23,42,0.6)",
    border: "1px solid rgba(148,163,184,0.1)",
    borderRadius: 12,
    padding: 12,
    maxHeight: 340,
    overflowY: "auto" as const,
  display: "flex",
    flexDirection: "column" as const,
    gap: 6,
  },
  logEmpty: {
    color: "#475569",
    fontSize: 13,
    textAlign: "center" as const,
    padding: "24px 0",
  },
  logRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "6px 8px",
    borderRadius: 6,
    transition: "background-color 0.15s ease",
  },
  logTime: {
    fontSize: 11,
    fontFamily: "'JetBrains Mono', monospace",
    flexShrink: 0,
    width: 64,
  },
  logBadge: {
    fontSize: 10,
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: 4,
    textTransform: "uppercase" as const,
    flexShrink: 0,
    letterSpacing: "0.03em",
  },
  logCategory: {
    fontSize: 11,
    color: "#94a3b8",
    flexShrink: 0,
    width: 80,
  },
  logMessage: {
    fontSize: 12,
    color: "#cbd5e1",
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: "1px solid rgba(148,163,184,0.08)",
    textAlign: "center" as const,
    fontSize: 12,
    color: "#475569",
    fontFamily: "'JetBrains Mono', monospace",
    fontStyle: "italic" as const,
  },
};
