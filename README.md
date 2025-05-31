# SubQG-Viewer: Umfassende Dokumentation

## 1. Einleitung & Überblick

Der SubQG-Viewer ist eine interaktive Webanwendung, die zur Simulation und Analyse des theoretischen "SubQuantenfeld-Grundfeld" (SubQG) Systems entwickelt wurde. Die Kernidee des SubQG-Modells postuliert, dass die wahrgenommene physikalische Realität – einschließlich Raumzeit, Materie und Energie – aus der Interferenz fundamentalerer Energie- und Phasenwellen in einem fluktuierenden Subquantenfeld emergiert.

Diese Anwendung ermöglicht es Benutzern:
*   Simulationsparameter zu konfigurieren, um verschiedene Szenarien des SubQG-Modells zu untersuchen.
*   Die Simulation in Echtzeit zu beobachten, einschließlich der Dynamik der Energie- und Phasenwellen sowie der Bildung von "Knoten".
*   Die resultierenden Daten zu analysieren, um emergente Phänomene und Muster zu identifizieren.
*   Wissenschaftliche Analysen und Berichte mithilfe der Google Gemini API zu generieren, basierend auf den Simulationsergebnissen.

Ziel ist es, ein Werkzeug zur Verfügung zu stellen, das Einblicke in die Prinzipien der Emergenz und die potenziellen mathematischen Strukturen bietet, die im scheinbaren Zufall des Subquantenfeldes verborgen liegen könnten.

## 2. Installation und Setup

Um den SubQG-Viewer lokal auszuführen, folgen Sie diesen Schritten:

### 2.1. Voraussetzungen
*   **Node.js**: Stellen Sie sicher, dass Node.js (Version 16.x oder höher empfohlen) und npm (Node Package Manager) auf Ihrem System installiert sind. Sie können sie von [nodejs.org](https://nodejs.org/) herunterladen.
*   **Git**: (Optional) Wenn Sie das Projekt direkt aus einem Git-Repository klonen möchten.

### 2.2. Projektdateien erhalten
Wenn Sie die Projektdateien als ZIP-Archiv haben, entpacken Sie es in einen Ordner Ihrer Wahl. Andernfalls klonen Sie das Repository (falls vorhanden).

### 2.3. Abhängigkeiten installieren
Navigieren Sie im Terminal zum Hauptverzeichnis des Projekts (z.B. `subqg-viewer`) und installieren Sie die notwendigen Frontend- und Backend-Abhängigkeiten:
```bash
npm install
Use code with caution.
Markdown
Dieser Befehl liest die package.json-Datei und installiert alle dort aufgeführten Pakete, einschließlich React, Vite, Express, und das Google Generative AI SDK.
2.4. API-Schlüssel einrichten
Die Anwendung verwendet die Google Gemini API für erweiterte Analysen. Hierfür benötigen Sie einen API-Schlüssel.
Erstellen Sie eine Datei namens .env im Hauptverzeichnis des Projekts (auf derselben Ebene wie package.json).
Fügen Sie Ihren Gemini API-Schlüssel in die .env-Datei ein:
GEMINI_API_KEY=DEIN_GOOGLE_API_SCHLUESSEL_HIER
Use code with caution.
Env
Ersetzen Sie DEIN_GOOGLE_API_SCHLUESSEL_HIER mit Ihrem tatsächlichen API-Schlüssel.
Wichtig: Fügen Sie die .env-Datei zu Ihrer .gitignore-Datei hinzu, um zu verhindern, dass Ihr API-Schlüssel versehentlich in ein Git-Repository hochgeladen wird.
2.5. Anwendung starten
Die Anwendung besteht aus zwei Teilen: einem Backend-Proxy-Server für die Gemini-Kommunikation und einem Frontend-Entwicklungsserver (Vite). Sie müssen beide in separaten Terminals starten.
Terminal A: Backend-Proxy-Server starten
npm run start-proxy
Use code with caution.
Bash
Dies startet den Node.js/Express-Server (standardmäßig auf http://localhost:3001), der Anfragen an die Gemini API weiterleitet. Sie sollten eine Konsolenausgabe sehen, die bestätigt, dass der Server läuft.
Terminal B: Frontend-Vite-Server starten
npm run dev
Use code with caution.
Bash
Dies startet den Vite-Entwicklungsserver (standardmäßig auf http://localhost:3000) und öffnet die Anwendung automatisch in Ihrem Standardbrowser.
Nun sollte der SubQG-Viewer in Ihrem Browser laufen und einsatzbereit sein.
3. Projektstruktur
Das Projekt ist wie folgt strukturiert:
/ (Hauptverzeichnis)
package.json: Definiert Projektabhängigkeiten und Skripte (wie dev, build, start-proxy).
vite.config.ts: Konfigurationsdatei für Vite, den Frontend-Build-Tool und Entwicklungsserver. Enthält die Proxy-Konfiguration für API-Anfragen.
.env: (Von Ihnen erstellt) Speichert den Gemini API-Schlüssel. Wichtig: Nicht versionieren!
index.html: Der Haupteinstiegspunkt für die Webanwendung. Lädt das Frontend-JavaScript.
README.md: (Diese Dokumentationsdatei)
tsconfig.json / tsconfig.node.json: TypeScript-Konfigurationsdateien.
/server
index.js: Der Node.js-Express-Server, der als Proxy für Anfragen an die Google Gemini API dient.
/src (Frontend-Quellcode)
index.tsx: Der TypeScript-Einstiegspunkt für die React-Anwendung. Initialisiert React und rendert die Hauptkomponente App.
App.tsx: Die Haupt-React-Komponente, die den globalen Zustand, die Layouts und die Kernlogik der Benutzeroberfläche verwaltet.
/components: Enthält wiederverwendbare React-UI-Komponenten.
ConfigurationPanel.tsx: Seitenleiste zur Einstellung von Simulationsparametern und zum Auslösen von Aktionen.
SimulationView.tsx: Ansicht zur Darstellung der Live-Simulationsdynamik.
AnalysisView.tsx: Ansicht zur Darstellung der Analyseergebnisse.
WaveChart.tsx, NodeCountChart.tsx, RiemannHistogramChart.tsx: Spezifische Diagrammkomponenten (basierend auf Recharts).
/icons: SVG-Icon-Komponenten.
/services: Enthält die Geschäftslogik für Simulation und Analyse.
simulationService.ts: Beinhaltet die SimulationEngine-Klasse für die Durchführung der Simulation.
analysisService.ts: Enthält Funktionen zur Analyse der Simulationsdaten.
geminiService.ts: Wurde entfernt, da die Gemini-Interaktion nun serverseitig erfolgt. Könnte für Frontend-Hilfsfunktionen (z.B. Prompt-Formatierung, falls ausgelagert) wiederverwendet werden.
/utils: Hilfsfunktionen.
rng.ts: Implementierungen für Zufallszahlengeneratoren (SeededRNG, QuantumRNG).
exportUtils.ts: Funktionen zum Exportieren von Daten als JSON, CSV und Markdown.
types.ts: Definiert TypeScript-Typen und -Schnittstellen, die in der gesamten Anwendung verwendet werden.
constants.ts: Enthält globale Konstanten, wie z.B. Standard-Simulationsparameter und Diagrammfarben.
metadata.json: Metadaten der Anwendung, die von bestimmten Plattformen verwendet werden könnten.
4. Kernkonzepte des SubQG-Modells
Die Simulation im SubQG-Viewer basiert auf folgenden theoretischen Annahmen:
Subquantenfeld (SubQuantenfeld-Grundfeld): Anstelle eines leeren Vakuums existiert ein fundamentales, dynamisches Feld, das aus Energie- und Phasenwellen besteht. Dieses Feld ist nicht räumlich im klassischen Sinne, sondern eher eine Matrix von Zustandsüberlagerungen, die das Potenzial zur Strukturbildung in sich trägt.
Energie- & Phasenwellen: In jedem Zeitschritt ("Tick") der Simulation werden zwei gekoppelte Wellentypen betrachtet:
Energiewelle: Diese Welle wird als chaotisch moduliert beschrieben, besitzt jedoch ein lokales Ordnungsprinzip. Ihre Amplitude fluktuiert zufällig.
Phasenwelle: Diese Welle beschreibt die kohärente Kopplung der Zustände im Feld und beeinflusst, wie die Energiewelle konstruktiv oder destruktiv interferieren kann. Ihre Entwicklung ist ebenfalls von zufälligen Einflüssen geprägt.
Interferenz & Knotenbildung: Der zentrale Mechanismus der Strukturbildung ist die Interferenz dieser beiden Wellen.
Wenn Energie- und Phasenwelle konstruktiv interferieren (d.h., ihre kombinierten Amplituden einen bestimmten Wert erreichen), kann ein "SubQG-Knoten" entstehen.
Ein Knoten ist ein resonantes Interferenzmuster mit einer besonders hohen Dichte an geordneten Zuständen.
Diese Knoten werden als die Keimzellen für Makrostrukturen betrachtet – die Bausteine für Raumzeit, Materie und Energie, wie wir sie in unserer physikalischen Realität wahrnehmen.
5. Wie die Anwendung funktioniert
5.1. Frontend (Vite + React)
Das Frontend ist eine Single-Page Application (SPA), die mit React und TypeScript entwickelt und mithilfe von Vite als Entwicklungsserver und Build-Tool bereitgestellt wird.
UI-Rendering und Zustandsmanagement: Die Hauptkomponente App.tsx verwaltet den Großteil des Anwendungszustands (Simulationsparameter, laufende Simulationsdaten, Analyseergebnisse, UI-Zustände wie isRunning, isPaused). React Hooks (useState, useCallback, useEffect, useRef) werden intensiv genutzt, um den Zustand zu verwalten und auf Benutzerinteraktionen zu reagieren.
Komponentenbasierte Architektur: Die Benutzeroberfläche ist in wiederverwendbare Komponenten (im Ordner /src/components) unterteilt, was die Entwicklung und Wartung erleichtert.
Styling: TailwindCSS wird für das schnelle und konsistente Styling der UI-Elemente verwendet.
5.2. Backend (Node.js + Express Proxy für Gemini API)
Um den Gemini API-Schlüssel sicher zu halten und CORS-Probleme sowie SDK-Kompatibilitätsprobleme im Browser zu umgehen, wurde ein einfacher Node.js-Backend-Server mit Express.js implementiert (server/index.js).
Zweck:
Sichere Aufbewahrung des GEMINI_API_KEY (aus der .env-Datei).
Direkte Verwendung des @google/generative-ai Node.js SDK.
Bereitstellung eines lokalen API-Endpunkts, den das Frontend sicher aufrufen kann.
API-Endpunkt (/api/gemini):
Das Frontend sendet eine POST-Anfrage mit einem prompt-String an diesen Endpunkt.
Der Express-Server empfängt den Prompt, initialisiert die GoogleGenerativeAI-Klasse mit dem API-Schlüssel und dem Modellnamen (gemini-pro oder das im Frontend spezifizierte Modell).
Er ruft die generateContent-Methode des Gemini-Modells auf.
Die Textantwort von Gemini wird extrahiert und als JSON-Antwort an das Frontend zurückgesendet.
Fehler werden abgefangen und als 500er-Statuscode mit einer Fehlermeldung zurückgegeben.
Proxy-Konfiguration: Die vite.config.ts-Datei ist so konfiguriert, dass alle Anfragen vom Frontend, die an /api/... gehen, an den Backend-Server auf http://localhost:3001 weitergeleitet werden. Dies vereinfacht die Frontend-Aufrufe.
5.3. Simulationslogik (services/simulationService.ts)
Die Kernlogik der SubQG-Simulation befindet sich in der SimulationEngine-Klasse.
Initialisierung: Nimmt Simulationsparameter, Callback-Funktionen für Tick-Updates und den Abschluss der Simulation sowie optional einen initialen RNG-Zustand (zum Fortsetzen) entgegen. Wählt den RNG-Typ basierend auf den Parametern.
simulationStep(): Diese Methode wird in regelmäßigen Intervallen (gesteuert durch SIMULATION_INTERVAL_MS) aufgerufen. In jedem Schritt:
Generiert Zufallszahlen vom ausgewählten RNG.
Berechnet die neuen Werte für die Energie- und Phasenwelle (siehe Abschnitt 7).
Berechnet den Interferenzwert der beiden Wellen.
Prüft, ob die Interferenz den konfigurierten Schwellenwert überschreitet, um einen Knoten zu bilden.
Ruft den onTickUpdate-Callback (definiert in App.tsx) mit den Daten des aktuellen Ticks (Wellenwerte, Interferenz, gebildeter Knoten) und dem aktuellen RNG-Zustand (für SeededRNG) auf.
Steuerung: Bietet start()- und stop()-Methoden, um die Simulation zu kontrollieren.
5.4. Analyselogik (services/analysisService.ts)
Die analyzeData-Funktion verarbeitet die Liste der gebildeten Knoten nach Abschluss einer Simulation.
Knotenzählung pro Segment: Zählt, wie viele Knoten in jedem definierten Zeitsegment (z.B. alle 10 Ticks) gebildet wurden.
Riemann-Proxy-Daten: Extrahiert die Interferenzwerte aller gebildeten Knoten. Diese Werte dienen als Proxy für die Verteilung der "Knotenresonanzen" und werden für das Riemann-Histogramm verwendet.
Gibt ein AnalysisData-Objekt mit den Ergebnissen zurück.
5.5. Gemini API Integration (via Backend)
Die Interaktion mit der Gemini API erfolgt nun ausschließlich über den Backend-Proxy.
Prompt Engineering: In App.tsx werden spezifische Prompts für die "Scientific Analysis" (für den Markdown-Report) und die "Publication Analysis" erstellt. Diese Prompts strukturieren die Simulationsparameter, eine Zusammenfassung der Knotendaten und spezifische Anweisungen für Gemini, um eine relevante und formatierte Antwort zu generieren.
Request-Ablauf:
Das Frontend (App.tsx) sendet einen fetch-Aufruf (POST) an /api/gemini (Vite leitet dies an http://localhost:3001/api/gemini weiter). Der Body der Anfrage enthält den konstruierten prompt.
Der Backend-Server (server/index.js) empfängt die Anfrage.
Das Backend verwendet das @google/generative-ai SDK, um den Prompt an die Gemini API zu senden.
Die Antwort von Gemini wird vom Backend empfangen.
Das Backend sendet die Textantwort von Gemini als JSON zurück an das Frontend.
Das Frontend (App.tsx) verarbeitet die Antwort und zeigt sie im "Report Modal" an oder verwendet sie im Markdown-Report.
6. User Interface (UI) Explained
6.1. Header
Zeigt den Titel der Anwendung "SubQG-Viewer" und einen Untertitel an.
6.2. Configuration Panel (Linke Seitenleiste)
Hier können Benutzer die Parameter für die Simulation einstellen, bevor sie gestartet wird. Die Felder sind während einer laufenden Simulation deaktiviert.
Duration (Ticks): Gibt die Gesamtzahl der Zeitschritte an, über die die Simulation laufen soll. (Standard: 100, Min: 10, Max: 1000)
Node Threshold: Ein Schwellenwert (zwischen 0.1 und 1.0) für den Interferenzwert. Überschreitet die Interferenz von Energie- und Phasenwelle diesen Wert, wird ein Knoten gebildet. (Standard: 0.7)
Noise Level: Ein Faktor (zwischen 0.0 und 0.5), der die Stärke der zufälligen Fluktuationen ("Rauschen") in der Entwicklung der Energie- und Phasenwellen bestimmt. Ein höherer Wert führt zu stärkeren, chaotischeren Schwankungen. (Standard: 0.1)
RNG Type: Wählt den Typ des Zufallszahlengenerators:
Pseudo RNG: Verwendet einen deterministischen Algorithmus (Linear Congruential Generator). Mit demselben Seed erzeugt er immer dieselbe Sequenz von Zufallszahlen, was für reproduzierbare Simulationen nützlich ist.
Quantum RNG (Simulated): Verwendet Math.random(), um eine Annäherung an Quantenrauschen zu simulieren (nicht-deterministisch).
Seed (for Pseudo RNG): Ein optionaler Startwert (Ganzzahl) für den Pseudo RNG. Wenn leer, wird ein zufälliger Seed verwendet. (Standard: 42)
Analysis Segment Duration (Ticks): Bestimmt die Länge der Zeitsegmente für die Analyse der Knotenhäufigkeit (z.B. wie viele Knoten alle X Ticks gebildet werden). (Standard: 10, Min: 1, Max: 100)
6.3. Controls (Linke Seitenleiste)
Start Simulation / Pause / Resume Button:
Start Simulation: Wenn keine Simulation läuft, startet dieser Button eine neue Simulation mit den aktuellen Parametern.
Pause: Wenn eine Simulation läuft, pausiert dieser Button die Simulation. Die internen Berechnungen und der Zustand der Engine werden eingefroren (bzw. die UI-Updates gestoppt, während der RNG-Zustand für SeededRNG gesichert wird).
Resume: Wenn eine Simulation pausiert ist, setzt dieser Button die Simulation fort.
Der Button ändert sein Aussehen und seine Beschriftung entsprechend dem aktuellen Zustand.
Reset Button: Stoppt jede laufende oder pausierte Simulation und setzt alle Parameter, Simulationsdaten und Analyseergebnisse auf ihre Standardwerte zurück.
6.4. Progress Display (Linke Seitenleiste)
Wird angezeigt, sobald eine Simulation gestartet wurde oder gelaufen ist.
Textanzeige: Zeigt den aktuellen Tick und die Gesamtdauer der Simulation an (z.B. "Tick 50/100").
Fortschrittsbalken: Visualisiert den Fortschritt der aktuellen Simulation.
6.5. Actions (Linke Seitenleiste)
Ermöglicht den Export von Daten und die Interaktion mit der Gemini API. Diese Buttons sind typischerweise deaktiviert, während eine Simulation läuft oder eine Gemini-Analyse generiert wird.
Export Nodes to JSON: Exportiert die Daten aller gebildeten Knoten der letzten abgeschlossenen (oder gepufferten) Simulation als .json-Datei.
Export Nodes to CSV: Exportiert dieselben Knotendaten als .csv-Datei.
Generate Report (Gemini):
Setzt voraus, dass eine Simulation abgeschlossen wurde und Analyseergebnisse vorliegen.
Öffnet ein Modal-Fenster.
Sendet die aktuellen Simulationsparameter, eine Zusammenfassung der Knotendaten, die Analyseergebnisse (Knotenzahlen, Riemann-Daten-Stichprobe) und SVG-Daten der Diagramme (falls verfügbar) an den Backend-Proxy.
Das Backend ruft die Gemini API auf, um eine wissenschaftliche Interpretation dieser Daten im Markdown-Format zu generieren.
Der generierte Markdown-Text wird im Modal angezeigt.
Bietet eine Option zum Herunterladen des vollständigen Berichts (inkl. Parameter, Diagramm-SVGs und Gemini-Analyse) als .md-Datei.
Publication Analysis (Gemini):
Setzt voraus, dass eine Simulation abgeschlossen wurde und Knotendaten vorhanden sind.
Öffnet ein Modal-Fenster.
Sendet die aktuellen Simulationsparameter und eine Stichprobe der Rohdaten der gebildeten Knoten (bis zu 200 Knoten) an den Backend-Proxy.
Das Backend ruft die Gemini API auf, um eine strukturierte Analyse im Stil einer wissenschaftlichen Publikation zu generieren.
Der generierte Text wird im Modal angezeigt.
6.6. Main View Area (Rechter Panel)
Zeigt die Hauptinhalte der Anwendung, umschaltbar über Tabs.
View Tabs:
Simulation: Zeigt die Live-Simulationsansicht.
Analysis: Zeigt die Ergebnisse der Analyse nach Abschluss einer Simulation.
6.6.1. Simulation View (components/SimulationView.tsx)
Wave Dynamics Chart: Ein Linien-Diagramm (mit Recharts), das den zeitlichen Verlauf der Energiewelle, Phasenwelle und des Interferenzwertes anzeigt. Zeigt standardmäßig die letzten MAX_DATA_POINTS_WAVE_CHART (z.B. 200) Ticks an, um die Performance bei langen Simulationen zu gewährleisten.
Formed Nodes List: Eine scrollbare Liste, die jeden gebildeten Knoten mit seinem Entstehungs-Tick und dem Interferenzwert anzeigt.
6.6.2. Analysis View (components/AnalysisView.tsx)
Wird aktiv, nachdem eine Simulation abgeschlossen wurde und Analyseergebnisse (analysisResults) vorhanden sind.
Analysis Summary: Zeigt die Gesamtzahl der in der Simulation gebildeten Knoten an.
Node Counts per Segment Chart: Ein Balkendiagramm (mit Recharts), das anzeigt, wie viele Knoten in jedem Zeitsegment (definiert durch Analysis Segment Duration) gebildet wurden.
Riemann Hypothesis Proxy Chart: Ein Histogramm (als Balkendiagramm mit Recharts realisiert), das die Verteilung der Interferenzwerte aller gebildeten Knoten darstellt. Eine vertikale Referenzlinie bei 0.5 ist eingezeichnet, um einen visuellen Vergleich mit der kritischen Linie der Riemannschen Zeta-Funktion (Re(s) ≈ 0.5) zu ermöglichen, wie im ursprünglichen SubQG-Konzept angedeutet.
6.7. Report Modal
Ein modales Fenster, das erscheint, wenn "Generate Report" oder "Publication Analysis" geklickt wird.
Titel: Zeigt an, welche Art von Inhalt generiert wird oder ob ein Fehler aufgetreten ist.
Inhalt:
Während der Generierung: Ein Ladeindikator (Spinner) und eine Statusmeldung.
Nach erfolgreicher Generierung: Der von Gemini zurückgegebene Text (Markdown für den Report, strukturierter Text für die Publikationsanalyse).
Bei Fehlern: Eine Fehlermeldung.
Buttons:
Download Report (.md): Nur sichtbar und aktiv, wenn ein Markdown-Report erfolgreich generiert wurde. Löst den Download des im Modal angezeigten Inhalts (plus Diagramm-SVGs und Parameter) als .md-Datei aus.
Close: Schließt das Modal.
7. Key Functions, Calculations, and Formulas
7.1. Random Number Generators (utils/rng.ts)
SeededRNG: Implementiert einen Linear Congruential Generator (LCG).
Formel: X_n+1 = (a * X_n + c) mod m
a (LCG_A): 1103515245
c (LCG_C): 12345
m (LCG_M): 2^31
Die Methode next() gibt X_n+1 / m zurück, um eine Fließkommazahl im Intervall [0, 1) zu erhalten.
getState() und setState() ermöglichen das Speichern und Wiederherstellen des internen Zustands (Seed) des Generators, was für die Pause/Resume-Funktionalität wichtig ist.
QuantumRNG: Verwendet Math.random() als einfache Simulation von Quantenrauschen für die Frontend-Anwendung. Diese Implementierung ist für die Demo zustandslos im Sinne von speicherbarem Zustand.
7.2. Wave Calculations (services/simulationService.ts)
calculateEnergyWave(currentValue, rngInput, noiseLevel):
Formel (vereinfacht): newValue = currentValue + (rngInput - 0.5) * noiseLevel * DAMPING_FACTOR_ENERGY
currentValue: Wert der Energiewelle aus dem vorherigen Tick.
rngInput: Zufallszahl [0, 1). (rngInput - 0.5) zentriert den Zufallseinfluss.
noiseLevel: Skaliert die Amplitude der zufälligen Fluktuation.
DAMPING_FACTOR_ENERGY (im Code 0.5): Ein Dämpfungsfaktor für die Fluktuation.
Das Ergebnis wird auf das Intervall [-1, 1] begrenzt.
calculatePhaseWave(currentValue, rngInput, noiseLevel):
Formel (vereinfacht):
phase_accumulator_rad = Math.asin(currentValue): Konvertiert den aktuellen Sinuswert der Phasenwelle (Bereich [-1, 1]) zurück in einen Phasenwinkel (Bereich [-PI/2, PI/2]).
phase_accumulator_norm = phase_accumulator_rad / Math.PI: Normalisiert diesen Winkel (Bereich [-0.5, 0.5]).
phase_accumulator_norm += (rngInput - 0.5) * noiseLevel * DAMPING_FACTOR_PHASE: Addiert eine zufällige, skalierte Fluktuation. DAMPING_FACTOR_PHASE (im Code 0.2).
newValue = Math.sin(phase_accumulator_norm * Math.PI): Konvertiert den modifizierten Phasenakkumulator zurück in einen Sinuswert.
Simuliert eine sich chaotisch entwickelnde Phase.
7.3. Interference Calculation
calculateInterference(energy, phase):
Formel: interference = (energy + phase) / 2
Eine einfache additive Überlagerung der beiden Wellenwerte.
7.4. Node Formation
checkNodeFormation(tick, interference, threshold):
Logik: Wenn interference > threshold, wird ein Knotenobjekt { tick, interferenceValue } erstellt.
7.5. Analysis Calculations (services/analysisService.ts)
Node Counts per Segment:
Iteriert durch Zeitsegmente definierter Länge (segmentDuration).
Zählt für jedes Segment die Anzahl der Knoten, deren tick in das Intervall [segmentStartTick, segmentEndTick) fällt.
Riemann Proxy Data:
Sammelt die interferenceValue aller gebildeten Knoten. Diese dienen als Proxy-Daten für die "Resonanzstärken" oder Re(s)-Werte, die im Riemann-Histogramm visualisiert werden.
7.6. Prompt Engineering for Gemini API (in App.tsx callGeminiApi und den Handler-Funktionen)
Die Prompts sind sorgfältig strukturiert, um Gemini den Kontext der SubQG-Simulation zu geben und spezifische Analyse- oder Berichtsformate anzufordern.
Markdown Report Prompt: Bittet um eine wissenschaftliche Analyse der Knotenhäufigkeit, des Riemann-Histogramms, der Auswirkungen der Parameter und um überraschende Beobachtungen, alles im Markdown-Format. Enthält auch Anleitungen zur Interpretation der Diagramme.
Publication Analysis Prompt: Fordert eine strukturierte Analyse (Executive Summary, Quantitative Findings, Patterns, Parameter Korrelationen (Hypothesen), Signifikanz, Weitere Untersuchungen) basierend auf Rohdaten (Parameter und Knotenliste) an, formuliert für ein wissenschaftliches Publikum.
8. Troubleshooting
Leere Seite / UI wird nicht geladen:
Stellen Sie sicher, dass sowohl der Backend-Proxy (npm run start-proxy) als auch der Vite-Frontend-Server (npm run dev) ohne Fehler in ihren jeweiligen Terminals laufen.
Überprüfen Sie die Browser-Konsole (Rechtsklick -> Untersuchen -> Konsole) auf JavaScript-Fehler.
Stellen Sie sicher, dass Node.js und npm korrekt installiert sind und die Versionen aktuell genug sind.
Leeren Sie den Browser-Cache oder versuchen Sie es in einem Inkognito-Fenster.
Gemini API Fehler / Keine Antwort von Gemini:
API-Schlüssel: Überprüfen Sie, ob die Datei .env im Projekt-Root existiert und Ihren korrekten GEMINI_API_KEY enthält. Stellen Sie sicher, dass der Schlüssel für das gemini-pro Modell (oder das von Ihnen verwendete Modell) aktiviert ist und über Guthaben verfügt (falls zutreffend).
Backend-Server-Log: Überprüfen Sie die Ausgabe im Terminal, in dem npm run start-proxy läuft, auf Fehlermeldungen vom Express-Server oder vom Gemini SDK.
Netzwerk: Stellen Sie sicher, dass Ihr Computer eine aktive Internetverbindung hat. Firewalls oder Proxys könnten die Kommunikation mit der Gemini API blockieren.
Vite Proxy: Überprüfen Sie die vite.config.ts auf korrekte Proxy-Einstellungen.
Export-Probleme:
Stellen Sie sicher, dass eine Simulation durchgeführt wurde und Daten zum Exportieren vorhanden sind (die Buttons sind deaktiviert, wenn keine Daten vorhanden sind oder eine Simulation läuft).
Überprüfen Sie die Browser-Konsole auf Fehler während des Download-Prozesses.
Stellen Sie sicher, dass Ihr Browser Downloads von der Seite erlaubt.
Vite/Proxy Server startet nicht:
Überprüfen Sie, ob die Ports (standardmäßig 3000 für Vite, 3001 für den Proxy) bereits von anderen Anwendungen verwendet werden. Sie können die Ports in vite.config.ts und server/index.js ändern, falls nötig.
Stellen Sie sicher, dass alle Abhängigkeiten korrekt mit npm install installiert wurden.
9. Glossary
SubQG (SubQuantenfeld-Grundfeld): Das theoretische, fundamentale Feld aus Energie- und Phasenwellen, aus dem laut Modell die Realität emergiert.
Tick: Ein diskreter Zeitschritt in der Simulation.
Knoten (Node): Ein Punkt hoher, geordneter Energie, der entsteht, wenn Energie- und Phasenwellen konstruktiv interferieren und einen bestimmten Schwellenwert überschreiten. Gilt als Baustein der Makrostruktur.
Interferenz: Die Überlagerung von Wellen, die zu Verstärkung (konstruktiv) oder Abschwächung (destruktiv) führen kann. Im SubQG-Modell ist die konstruktive Interferenz entscheidend für die Knotenbildung.
RNG (Random Number Generator): Algorithmus oder Prozess zur Erzeugung von Zufallszahlen, die die Fluktuationen im Subquantenfeld simulieren.
LCG (Linear Congruential Generator): Ein einfacher Typ eines Pseudo-Zufallszahlengenerators.
Riemann Hypothesis Proxy: Im Kontext dieser Anwendung ist dies das Histogramm der Interferenzwerte der gebildeten Knoten. Es dient als Analogie oder Vergleichspunkt zur Verteilung von Werten auf der kritischen Linie (Re(s) = 0.5) der Riemannschen Zeta-Funktion, was auf tiefere mathematische Strukturen hindeuten könnte.
Vite: Ein modernes Frontend-Build-Tool und Entwicklungsserver, das für schnelle Startzeiten und Hot Module Replacement bekannt ist.
Express.js: Ein minimalistisches und flexibles Node.js-Webanwendungs-Framework, das hier für den Backend-Proxy-Server verwendet wird.
CORS (Cross-Origin Resource Sharing): Ein Mechanismus, der es Webseiten erlaubt, Ressourcen von anderen Domains anzufordern. Im Backend-Server aktiviert, um Anfragen vom Vite-Frontend (anderer Port) zu erlauben.
.env file: Eine Datei zur Speicherung von Umgebungsvariablen, wie z.B. API-Schlüsseln, außerhalb des versionierten Codes.

10. Zukünftige Entwicklung (Optionale Ideen)
Erweiterte Visualisierungen (z.B. 2D/3D-Darstellung der Knotenbildung, falls räumliche Aspekte hinzugefügt werden).
Speichern und Laden von Simulationsparametern und -ergebnissen.
Verfeinerung der mathematischen Modelle für Energie- und Phasenwellen.
Integration weiterer Analyse-Tools oder statistischer Tests.
Möglichkeit, mehrere Simulationsläufe zu vergleichen.
Interaktivere Untersuchung der Auswirkungen einzelner Parameter auf die Emergenzphänomene.
```