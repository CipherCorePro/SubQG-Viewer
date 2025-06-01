
# 🌟 SubQG-Viewer: Simulation emergenter Strukturen aus subquanten Fluktuationen

[![Lizenz: GPL v3](https://img.shields.io/badge/Lizenz-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0.html)



## 🚀 Überblick

Der **SubQG-Viewer** ist eine interaktive Webanwendung zur Simulation und Analyse des theoretischen "SubQuantumField-Grundfeld" (SubQG). Dieses Projekt untersucht die Hypothese, dass Raumzeit, Materie und Energie aus Interferenzmustern subquanter Energie- und Phasenwellen entstehen.

### Funktionen:
- ⚙️ **Simulation konfigurieren**: Dauer, Schwelle, Rauschen, RNG-Typ, Seed
- 📈 **Echtzeitbeobachtung**: Visualisierung von Wellen, Interferenz und Knotenbildung (inkl. `spin` und `topologyType`)
- 🤖 **Analyse durch KI**: Berichte mit der Google Gemini API generieren, inkl. Kontexten wie CDT, GFT, LQG

Ziel ist es, ein Werkzeug zur Erforschung emergenter Prinzipien und verborgener Strukturen im scheinbaren Zufall subquanter Felder bereitzustellen.

## ✨ Hauptmerkmale

- 🔧 Interaktive Konfiguration
- 📊 Echtzeit-Charts für Energie-/Phasenwellen, Interferenz, Knoten
- 📑 KI-gestützte Analyseberichte (Markdown, wissenschaftlich)
- 🔍 Cluster-Zeitkarten, Riemann-Histogramme
- 📂 Exportfunktionen (CSV, JSON)
- 🛡️ Sicherer Proxy für Gemini API

## 🛠️ Technologie-Stack

- **Frontend**: React 19, TypeScript, Vite, TailwindCSS, Recharts
- **Backend**: Node.js, Express, @google/generative-ai, dotenv, cors, body-parser
- **KI-Integration**: Google Gemini API (`gemini-2.5-flash-preview-04-17`)

## ⚙️ Installation & Setup

### 1. Voraussetzungen
- Node.js (>=16.x), npm
- Optional: Git

### 2. Projekt klonen oder herunterladen
```bash
git clone https://deine-url/subqg-viewer.git
cd subqg-viewer
````

### 3. Abhängigkeiten installieren

```bash
npm install
```

### 4. API-Key einrichten

Datei `.env` erstellen:

```env
GEMINI_API_KEY=DEIN_KEY
```

**Wichtig:** Datei `.env` in `.gitignore` aufnehmen.

### 5. Anwendung starten (zwei Terminals)

```bash
npm run start-proxy  # Terminal A (Backend)
npm run dev          # Terminal B (Frontend)
```

Zugriff über: [http://localhost:3000](http://localhost:3000)

## 🗂️ Projektstruktur (Kurzfassung)

```
subqg-viewer/
├── server/index.js          # Proxy-Backend
├── src/components/          # UI-Module (Charts, Panels, etc.)
├── src/services/            # Simulation und Analyse
├── src/utils/               # RNGs, Exporte, Konstanten
├── .env                     # (nicht versionieren)
├── vite.config.ts           # Devserver & Proxy
└── README.md
```

## 📘 Konzepte des SubQG-Modells

* **SubQG-Feld**: Fundamentales, unterliegendes Wellenfeld
* **Energie-/Phasenwellen**: chaotisch vs. kohärent
* **Knotenbildung**: bei starker Interferenz → + `spin`, `topologyType`

## 🚦 Ablauf & Logik

* **Frontend (React SPA)**: Parameter, Charts, Statusanzeige
* **Backend (Express)**: sicheres Routing zur Gemini API
* **Simulation**:

  * RNG: SubQGRNG (det.) oder QuantumRNG (Math.random)
  * Interferenzwert > Schwelle → Node (inkl. `spin` + Typ)
* **Analyse**:

  * Knotenzählung, Riemann-Daten, Cluster-Zeitkarte
* **Gemini-Prompts**: Vergleiche, Tiefenanalyse, Theoriekontexte

## 🧭 Benutzeroberfläche

* **Sidebar**: Parameter, Seed, RNG-Typ, Kontext
* **Simulation View**: Live-Wellen und Knoten
* **Analyse View**: Diagramme, Verteilungen
* **Aktionen**: Export, Bericht erstellen, Vergleich starten

## 🧠 Comparative Context (Optional)

Ein mehrzeiliges Texteingabefeld zur Formulierung eines theoretischen Rahmens oder gezielter Hypothesen für die Analyse durch Gemini. Beispieleingaben:

* „Untersuche mögliche Korrespondenzen zu Skalierungseigenschaften in der Kausalen Dynamischen Triangulation (CDT).“
* „Gibt es Analogien zur Kondensatphase in der Group Field Theory (GFT) bezüglich der Knotendichte?“
* „Analysiere die Spin-Verteilung im Kontext von Loop Quantum Gravity (LQG) Elementen.“
* „Fokus auf Phasenübergänge bei Variation des Noise Levels.“

Dieser Kontext wird an die Gemini API übergeben, um die Analyse entlang spezifizierter theoretischer Perspektiven zu lenken.

## 🧮 Formeln & Berechnungen

```ts
spin = Math.random() > 0.5 ? 1 : -1
interference = (energy + phase) / 2
if (interference > threshold) {
   topology = 'Low/Mid/High' // je nach Stärke
}
```

## 🚑 Fehlerbehebung

* ⚠️ Beide Terminals gestartet?
* ⚠️ .env korrekt?
* ⚠️ Browserkonsole (F12) auf Fehler prüfen

## 📖 Glossar

| Begriff             | Bedeutung                                 |
| ------------------- | ----------------------------------------- |
| SubQG RNG           | Deterministischer Generator (SubQG-Ebene) |
| Quantum RNG         | Stochastisch (klassisch)                  |
| spin                | +1 oder -1 je Knoten                      |
| topologyType        | Low/Mid/High Interferenztyp               |
| Cluster Time Map    | Tick vs. Interferenz (farbig nach Spin)   |
| Comparative Context | Nutzertext für gezielte KI-Analyse        |

## 🚀 Zukunftsideen

* Dynamischere Topologie-Logik
* Interaktive Filter für Diagramme
* Vergleich mit CDT/GFT/LQG quantifizieren
* Simulationen abspeichern/laden

```


