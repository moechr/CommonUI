# Mein Tool

Erstellt aus der Startvorlage von [Common UI](https://github.com/moechr/CommonUI).

```bash
npm install
npm run dev
```

## Anpassen

1. App-Name in `src/App.tsx` (`TitleBar appName`), `index.html` (`<title>`) und `package.json`.
2. Ansichten in `src/App.tsx` (`views`) eintragen, je Ansicht eine Datei in `src/views/`.
3. In `src/views/ControlView.tsx` `readDevice()` durch den echten Datenzugriff ersetzen.

Regeln und Bausteine: `node_modules/@ki/common-ui/AGENTS.md` und `node_modules/@ki/common-ui/docs/components.md`.
