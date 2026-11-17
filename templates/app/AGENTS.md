# AGENTS.md

Dieses Projekt nutzt die gemeinsame Oberfläche **Common UI** (`@ki/common-ui`).
Vor jeder Arbeit an der Oberfläche lesen und befolgen:

- `node_modules/@ki/common-ui/AGENTS.md` – Seitenaufbau und verbindliche Regeln
- `node_modules/@ki/common-ui/docs/components.md` – alle Bausteine mit Props

Keine eigenen Farben oder zusätzlichen UI-Bibliotheken. Fehlt ein Baustein, im Repo
https://github.com/moechr/CommonUI ergänzen statt hier nachzubauen.

## Projekt

- `src/App.tsx` – App-Gerüst und Navigation
- `src/views/` – eine Datei je Ansicht
- Datenzugriff: <hier beschreiben, z. B. REST-API des Geräts unter http://…>
