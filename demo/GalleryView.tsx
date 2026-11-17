import { useState } from "react";
import {
  Text, Panel, Button, IconButton, Chip, Banner, EmptyState, Field, Input, Textarea, Switch, Segmented, Meter,
  DataTable, Icon, iconNames, useToast, type Column,
} from "../src";

interface Run { id: string; name: string; model: string; status: "ok" | "warn" | "err"; duration: string; cost: string }
const runs: Run[] = [
  { id: "r1", name: "CAN-Trace auswerten", model: "sonnet-5-5", status: "ok", duration: "4,2 s", cost: "0,12 €" },
  { id: "r2", name: "Handbuch indexieren", model: "haiku-5-5", status: "warn", duration: "1:48 min", cost: "0,03 €" },
  { id: "r3", name: "Regel für Heizung", model: "lokal · llama", status: "err", duration: "0,4 s", cost: "0,00 €" },
];
const statusText = { ok: "Fertig", warn: "Läuft", err: "Fehler" } as const;
const columns: Column<Run>[] = [
  { key: "name", header: "Lauf", render: (r) => r.name },
  { key: "model", header: "Modell", render: (r) => r.model },
  { key: "status", header: "Status", render: (r) => <Chip tone={r.status}>{statusText[r.status]}</Chip> },
  { key: "dur", header: "Dauer", numeric: true, render: (r) => r.duration },
  { key: "cost", header: "Kosten", numeric: true, render: (r) => r.cost },
];

const swatches = ["bg", "surface", "surface-2", "fg", "accent", "ai", "ok", "warn", "err"];

export function GalleryView() {
  const toast = useToast();
  const [name, setName] = useState("Protokoll-Analyse");
  const [notify, setNotify] = useState(true);
  const [size, setSize] = useState<"sm" | "md" | "lg">("md");

  return (
    <div style={{ overflow: "auto", flex: 1 }}>
      <div className="cui-stack" style={{ padding: "var(--cui-s5)", gap: "var(--cui-s6)", maxWidth: 1100 }}>
        <div className="cui-stack" style={{ gap: "var(--cui-s1)" }}>
          <Text variant="eyebrow">KI Common UI</Text>
          <Text variant="large">Komponenten</Text>
          <Text muted>Alle Bausteine aus <code>@ki/common-ui</code>, live mit den aktuellen Tokens.</Text>
        </div>

        <Panel>
          <Text variant="headline">Farben</Text>
          <div style={{ display: "grid", gap: "var(--cui-s3)", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))" }}>
            {swatches.map((s) => (
              <div key={s} style={{ display: "grid", gap: 6 }}>
                <span style={{ height: 48, borderRadius: "var(--cui-r-m)", border: "1px solid var(--cui-line)", background: `var(--cui-${s})` }} />
                <code style={{ fontSize: 11, color: "var(--cui-fg-3)" }}>--cui-{s}</code>
              </div>
            ))}
          </div>
        </Panel>

        <div className="cui-grid">
          <Panel>
            <Text variant="headline">Buttons</Text>
            <Segmented aria-label="Größe" value={size} onChange={setSize}
              options={[{ value: "sm", label: "S" }, { value: "md", label: "M" }, { value: "lg", label: "L" }]} />
            <div className="cui-cluster">
              <Button variant="primary" size={size} icon="send">Ausführen</Button>
              <Button size={size}>Abbrechen</Button>
              <Button variant="plain" size={size}>Details</Button>
              <Button variant="danger" size={size}>Löschen</Button>
              <Button variant="primary" size={size} loading>Lädt</Button>
              <IconButton icon="copy" label="Kopieren" />
            </div>
          </Panel>

          <Panel>
            <Text variant="headline">Status</Text>
            <div className="cui-cluster">
              <Chip tone="ok">Fertig</Chip><Chip tone="warn">Langsam</Chip><Chip tone="err">Fehler</Chip>
              <Chip tone="ai">KI-generiert</Chip><Chip tone="accent">Neu</Chip><Chip>Entwurf</Chip>
            </div>
            <Meter value={38} max={200} label="Kontext" />
            <Meter value={160} max={200} label="Kontext" />
            <Meter value={190} max={200} label="Kontext" />
          </Panel>

          <Panel>
            <Text variant="headline">Formular</Text>
            <Field label="Projektname" hint="Erscheint in der Seitenleiste.">
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="API-Endpunkt" error={name.trim() ? undefined : "Bitte einen Projektnamen eingeben."}>
              <Input defaultValue="http://localhost:8080/v1" />
            </Field>
            <Field label="System-Prompt">
              <Textarea rows={3} defaultValue="Du bist ein Assistent für CAN-Trace-Analysen." />
            </Field>
            <Switch label="Benachrichtigen, wenn fertig" checked={notify} onChange={setNotify} />
          </Panel>

          <Panel>
            <Text variant="headline">Rückmeldung</Text>
            <Button onClick={() => toast({ message: "Vorlage gespeichert", icon: "check", actionLabel: "Rückgängig" })}>Toast zeigen</Button>
            <Banner tone="info" title="Neues Modell verfügbar">claude-opus-5-5 kann im Inspector gewählt werden.</Banner>
            <Banner tone="warn">Kontext zu 80 % gefüllt.</Banner>
            <Banner tone="err" title="Anfrage fehlgeschlagen" action={<Button size="sm">Erneut</Button>}>Der Server antwortet nicht (Zeitüberschreitung nach 30 s).</Banner>
          </Panel>
        </div>

        <Panel>
          <Text variant="headline">Tabelle</Text>
          <DataTable columns={columns} rows={runs} rowKey={(r) => r.id} onRowClick={(r) => toast({ message: `${r.name} geöffnet` })} />
        </Panel>

        <div className="cui-grid">
          <Panel>
            <Text variant="headline">Leerzustand</Text>
            <EmptyState title="Noch keine Läufe" description="Lege eine Datei ab oder stelle eine Frage, um zu starten." action={<Button variant="primary" icon="plus">Neuer Lauf</Button>} />
          </Panel>
          <Panel>
            <Text variant="headline">Icons</Text>
            <div className="cui-cluster" style={{ gap: "var(--cui-s3)", color: "var(--cui-fg-2)" }}>
              {iconNames.map((n) => <span key={n} title={n}><Icon name={n} size={20} /></span>)}
            </div>
          </Panel>
          <Panel>
            <Text variant="headline">Schriftskala</Text>
            <Text variant="title2">Title 2</Text>
            <Text variant="headline">Headline</Text>
            <Text>Body für Fließtext</Text>
            <Text variant="caption">Caption, Hinweise</Text>
          </Panel>
        </div>
      </div>
    </div>
  );
}
