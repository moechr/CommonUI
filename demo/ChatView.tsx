import { useRef, useState, type ReactNode } from "react";
import { Thread, Message, ToolCall, Citation, TypingIndicator, Composer, Chip } from "../src";

interface Msg { id: number; role: "user" | "assistant"; content: ReactNode; author?: string }

/** Demo-Chat mit simulierter Antwort. In echten Projekten onSubmit an die eigene API hängen. */
export function ChatView({ model, showCitations }: { model: string; showCitations: boolean }) {
  const cite = (n: number, t: string) => (showCitations ? <> <Citation n={n} title={t} /></> : null);
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: 1, role: "user", content: "Welche Botschaften im Trace von heute 09:14 haben eine Zykluszeit über 100 ms?" },
    {
      id: 2, role: "assistant", author: `Assistent · ${model}`,
      content: (
        <>
          <ToolCall name="trace.filter(cycle_ms > 100)" meta="0,8 s" detail={{ file: "trace_0914.blf", rows: 18422, match: 3 }} />
          <p>
            Drei Botschaften liegen über 100 ms: <b>0x1A0 EngineStatus</b> mit 142 ms{cite(1, "trace_0914.blf, Zeile 4 812")},{" "}
            <b>0x2F4 BrakeInfo</b> mit 118 ms{cite(2, "trace_0914.blf, Zeile 9 207")} und <b>0x330 Diag</b> mit 104 ms.
            Bei 0x1A0 steigt die Zeit ab 09:14:32 sprunghaft an.
          </p>
        </>
      ),
    },
  ]);
  const [busy, setBusy] = useState(false);
  const timer = useRef<number>();
  const nextId = useRef(3);

  const submit = (text: string) => {
    setMsgs((m) => [...m, { id: nextId.current++, role: "user", content: text }]);
    setBusy(true);
    timer.current = window.setTimeout(() => {
      setMsgs((m) => [
        ...m,
        {
          id: nextId.current++, role: "assistant", author: `Assistent · ${model}`,
          content: <p>Demo-Antwort auf „{text}“. Hier hängt später der echte Modellaufruf.</p>,
        },
      ]);
      setBusy(false);
    }, 1400);
  };

  const stop = () => { window.clearTimeout(timer.current); setBusy(false); };

  return (
    <>
      <Thread>
        {msgs.map((m) => (
          <Message key={m.id} role={m.role} author={m.author} initials="CM">
            {typeof m.content === "string" ? <p>{m.content}</p> : m.content}
          </Message>
        ))}
        {busy && <Message role="assistant"><TypingIndicator /></Message>}
      </Thread>
      <Composer
        onSubmit={submit}
        busy={busy}
        onStop={stop}
        onAttach={() => {}}
        attachments={<Chip tone="neutral" dot={false}>trace_0914.blf</Chip>}
      />
    </>
  );
}
