# SubQG-Viewer: Umfassende Dokumentation

## 1. Einleitung & Überblick

Der SubQG-Viewer ist eine interaktive Webanwendung, die zur Simulation und Analyse des theoretischen "SubQuantenfeld-Grundfeld" (SubQG) Systems entwickelt wurde. Die Kernidee des SubQG-Modells postuliert, dass die wahrgenommene physikalische Realität – einschließlich Raumzeit, Materie und Energie – aus der Interferenz fundamentalerer Energie- und Phasenwellen in einem fluktuierenden Subquantenfeld emergiert.

Diese Anwendung ermöglicht es Benutzern:

* Simulationsparameter zu konfigurieren, um verschiedene Szenarien des SubQG-Modells zu untersuchen.
* Die Simulation in Echtzeit zu beobachten, einschließlich der Dynamik der Energie- und Phasenwellen sowie der Bildung von "Knoten".
* Die resultierenden Daten zu analysieren, um emergente Phänomene und Muster zu identifizieren.
* Wissenschaftliche Analysen und Berichte mithilfe der Google Gemini API zu generieren, basierend auf den Simulationsergebnissen.

Ziel ist es, ein Werkzeug zur Verfügung zu stellen, das Einblicke in die Prinzipien der Emergenz und die potenziellen mathematischen Strukturen bietet, die im scheinbaren Zufall des Subquantenfeldes verborgen liegen könnten.

## 2. Installation und Setup

### 2.1 Voraussetzungen

* **Node.js** (empfohlen: v16.x oder höher)
* npm
* optional: Git

### 2.2 Projektdateien erhalten

* ZIP-Datei entpacken **oder**
* Repository klonen:

```bash
git clone <REPOSITORY_URL>
cd subqg-viewer
```

### 2.3 Abhängigkeiten installieren

```bash
npm install
```

Dieser Befehl liest die `package.json`-Datei und installiert alle dort aufgeführten Pakete, einschließlich React, Vite, Express und das Google Generative AI SDK.

### 2.4 API-Schlüssel einrichten

Die Anwendung verwendet die Google Gemini API für erweiterte Analysen. Hierfür benötigen Sie einen API-Schlüssel.

1. Erstellen Sie eine Datei namens `.env` im Hauptverzeichnis des Projekts.
2. Fügen Sie Ihren Gemini API-Schlüssel in die Datei ein:

```env
GEMINI_API_KEY=DEIN_GOOGLE_API_SCHLUESSEL_HIER
```

> **Wichtig**: `.env` darf nicht versioniert werden. Tragen Sie sie in `.gitignore` ein.

### 2.5 Anwendung starten

Die Anwendung besteht aus zwei Teilen: einem Backend-Proxy-Server und einem Frontend-Vite-Server.

**Backend starten:**

```bash
npm run start-proxy
```

**Frontend starten:**

```bash
npm run dev
```

Aufruf im Browser unter: [http://localhost:3000](http://localhost:3000)

## 3. Projektstruktur

```plaintext
subqg-viewer/
├── src/
│   ├── components/        # UI-Komponenten (Charts, Panels)
│   ├── services/          # Simulation & Analyse
│   ├── utils/             # RNG, Exporte, Hilfsfunktionen
│   ├── icons/             # SVG-Icons
│   ├── App.tsx            # Hauptlogik
│   ├── index.tsx
│   ├── constants.ts
│   └── types.ts
├── server/
│   └── index.js           # Express-Proxy
├── metadata.json
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
├── .env
└── README.md
```

## 4. Theoretische Grundlagen

### 4.1 Subquantenfeld (SubQG)

Ein nicht-räumliches, dynamisches Grundfeld aus Energie- und Phasenwellen. Kein klassisches Vakuum, sondern eine Matrix überlagerter Zustände.

### 4.2 Welleninterferenz

* **Energiewelle**: Zufällig modulierte Amplitude mit lokalem Ordnungspotenzial.
* **Phasenwelle**: Kohärenz der Zustände, durch Zufall beeinflusst.

### 4.3 Knotenbildung

Wenn beide Wellen konstruktiv interferieren und eine definierte Schwelle überschreiten, entsteht ein Knoten. Dieser gilt als Keimzelle für makrophysikalische Struktur.

## 5. Systemlogik

### 5.1 Frontend

* React + TypeScript + Vite
* Hooks: `useState`, `useEffect`, `useRef`
* Komponentenarchitektur in `/components`
* Styling: TailwindCSS

### 5.2 Backend (Gemini-Proxy)

* Express.js-Server in `server/index.js`
* Endpoint: `POST /api/gemini`
* Nutzung des Google SDK

### 5.3 Simulation

* `SimulationEngine` in `simulationService.ts`
* Schrittweise Berechnung pro Tick:

  * Energie- und Phasenwerte
  * Interferenz
  * Prüfung auf Knotenbildung

### 5.4 Analyse

* `analysisService.ts`
* Segmentierung, Knotenzählung, Histogramm
* Riemann-Proxy als Metapher für mathematische Tiefe

### 5.5 Gemini-Prompting

* Markdown-Bericht (wissenschaftlich)
* Publikationsanalyse (Executive Summary, Hypothesen etc.)

## 6. Benutzeroberfläche

### 6.1 Configuration Panel

* Dauer, Schwelle, Noise, RNG, Seed, Analyse-Intervalle

### 6.2 Steuerung

* Start / Pause / Resume / Reset

### 6.3 Visualisierung

* Live-Wellen-Diagramm
* Knotenliste

### 6.4 Analyse-Ansicht

* Knotenanzahl pro Segment (BarChart)
* Riemann-Histogramm mit Referenzlinie

### 6.5 Report-Modal

* Spinner, Ergebnisse, Download
* Zwei Modi: Report / Publication

## 7. Formeln & Kernfunktionen

### 7.1 RNG (utils/rng.ts)

```ts
X_n+1 = (a * X_n + c) mod m
```

Mit:
`a = 1103515245`, `c = 12345`, `m = 2^31`

### 7.2 Wellenberechnung

```ts
energy = current + (rng - 0.5) * noise * DAMPING;
phase = sin(asin(current) + (rng - 0.5) * noise * DAMPING);
```

### 7.3 Interferenz & Knoten

```ts
interference = (energy + phase) / 2;
if (interference > threshold) → Knoten
```

## 8. Troubleshooting

| Problem                   | Lösung                                 |
| ------------------------- | -------------------------------------- |
| Leere Seite               | Beide Server gestartet? Konsole prüfen |
| Gemini ohne Antwort       | `.env` prüfen, Netz & Key gültig?      |
| Export funktioniert nicht | Daten vorhanden? Console prüfen        |
| Port 3000/3001 belegt     | In Config ändern                       |

## 9. Glossar

* **SubQG**: Grundfeld aus Energie-/Phasenwellen
* **Tick**: Diskreter Simulationsschritt
* **Knoten**: Stabiler Interferenzpunkt > Schwelle
* **Riemann-Proxy**: Histogramm über Interferenzwerte
* **LCG**: Linearer Pseudo-Zufallszahlengenerator

## 10. Zukünftige Erweiterungen

* 2D/3D Knotendarstellung
* Speicherung von Runs und Parametern
* Erweiterte Statistik (Cluster, Korrelation)
* Vergleich multipler Läufe
* Erweiterung um räumliche Logik

---

> **Lizenz**: GNU GPL v2.0
> **Autor**: Ralf Krümmel
> **Ziel**: Validierung einer subquanteninduzierten Emergenz kosmologischer Strukturen
