import { useEffect, useLayoutEffect, useRef, useState, type HTMLAttributes, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../utils";
import { Icon } from "../components/Icon";
import { Avatar, Chip } from "../components/Display";
import { Button, IconButton } from "../components/Button";

/* ---------- Thread ---------- */
export interface ThreadProps extends HTMLAttributes<HTMLDivElement> {
  /** Bei neuen Nachrichten automatisch nach unten scrollen (Standard: ja). */
  autoScroll?: boolean;
}

export function Thread({ autoScroll = true, className, children, ...rest }: ThreadProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!autoScroll || !el) return;
    // Nur mitscrollen, wenn der Nutzer schon nahe am Ende ist
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 160) el.scrollTop = el.scrollHeight;
  });
  return (
    <div ref={ref} className={cx("cui-thread", className)} role="log" aria-live="polite" {...rest}>
      {children}
    </div>
  );
}

/* ---------- Message ---------- */
export type MessageRole = "user" | "assistant" | "error";

export interface MessageProps {
  role: MessageRole;
  /** Anzeigename, z. B. "Du" oder "Assistent · claude-sonnet-5-5". */
  author?: ReactNode;
  initials?: string;
  children: ReactNode;
}

export function Message({ role, author, initials = "DU", children }: MessageProps) {
  const isUser = role === "user";
  return (
    <div className={cx("cui-msg", `cui-msg--${role}`)}>
      {isUser ? (
        <Avatar initials={initials} />
      ) : (
        <span className="cui-ai-dot" aria-hidden>
          <Icon name={role === "error" ? "warning" : "sparkle"} />
        </span>
      )}
      <div style={{ minWidth: 0 }}>
        <div className="cui-msg__who">{author ?? (isUser ? "Du" : role === "error" ? "Fehler" : "Assistent")}</div>
        <div className="cui-msg__body">{children}</div>
      </div>
    </div>
  );
}

/* ---------- ToolCall ---------- */
export type ToolStatus = "running" | "done" | "error";

export interface ToolCallProps {
  name: string;
  status?: ToolStatus;
  /** z. B. "0,8 s" */
  meta?: ReactNode;
  /** Eingabe/Ausgabe; Objekte werden als JSON formatiert. */
  detail?: unknown;
  defaultOpen?: boolean;
}

const statusChip: Record<ToolStatus, { tone: "ai" | "warn" | "err"; text: string }> = {
  running: { tone: "warn", text: "Läuft" },
  done: { tone: "ai", text: "Werkzeug" },
  error: { tone: "err", text: "Fehler" },
};

export function ToolCall({ name, status = "done", meta, detail, defaultOpen }: ToolCallProps) {
  const s = statusChip[status];
  const text = detail === undefined ? null : typeof detail === "string" ? detail : JSON.stringify(detail, null, 2);
  return (
    <details className="cui-tool" open={defaultOpen}>
      <summary>
        <Chip tone={s.tone}>{s.text}</Chip>
        <span className="cui-tool__name">{name}</span>
        {meta && <span className="cui-tool__meta">{meta}</span>}
      </summary>
      {text && <pre>{text}</pre>}
    </details>
  );
}

/* ---------- Citation ---------- */
export function Citation({ n, title, onClick }: { n: number; title?: string; onClick?: () => void }) {
  return (
    <button type="button" className="cui-cite" title={title} aria-label={title ? `Quelle ${n}: ${title}` : `Quelle ${n}`} onClick={onClick}>
      {n}
    </button>
  );
}

/* ---------- Typing ---------- */
export function TypingIndicator() {
  return (
    <span className="cui-typing" role="status" aria-label="Antwort wird erzeugt">
      <i /><i /><i />
    </span>
  );
}

/* ---------- Composer ---------- */
export interface ComposerProps {
  onSubmit: (text: string) => void;
  /** Während einer laufenden Antwort: Stopp-Button statt Senden. */
  busy?: boolean;
  onStop?: () => void;
  placeholder?: string;
  /** Links neben dem Hinweis, z. B. angehängte Dateien als Chips. */
  attachments?: ReactNode;
  onAttach?: () => void;
  disabled?: boolean;
}

/** Enter sendet, Shift+Enter macht eine neue Zeile. Feld wächst bis 240 px mit. */
export function Composer({ onSubmit, busy, onStop, placeholder = "Frage stellen oder Datei ablegen …", attachments, onAttach, disabled }: ComposerProps) {
  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  const fit = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
  };
  useLayoutEffect(fit, [text]);
  // Neu messen, wenn sich die Breite ändert (Fenster, Sidebar) oder Styles erst später laden
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    let w = el.clientWidth;
    const ro = new ResizeObserver(() => {
      if (el.clientWidth !== w) { w = el.clientWidth; fit(); }
    });
    ro.observe(el);
    const raf = requestAnimationFrame(fit);
    return () => { ro.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  const send = () => {
    const t = text.trim();
    if (!t || busy || disabled) return;
    onSubmit(t);
    setText("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  return (
    <form className="cui-composer" onSubmit={(e) => { e.preventDefault(); send(); }}>
      <textarea
        ref={ref}
        rows={1}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        aria-label="Nachricht"
        disabled={disabled}
      />
      <div className="cui-composer__bar">
        {onAttach && <IconButton icon="attach" label="Datei anhängen" onClick={onAttach} />}
        {attachments}
        <span className="cui-spacer" />
        <span className="cui-composer__hint">Enter senden · Shift+Enter Zeile</span>
        {busy ? (
          <Button variant="secondary" icon="stop" onClick={onStop}>Stopp</Button>
        ) : (
          <Button variant="primary" type="submit" disabled={!text.trim() || disabled}>Senden</Button>
        )}
      </div>
    </form>
  );
}
