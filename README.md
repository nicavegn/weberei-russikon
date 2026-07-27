# Alte Weberei Russikon, Website

> **Projektkontext und Übergabe:** Eine ausführliche Übergabe für neue
> Arbeitssitzungen liegt in der Datei `CLAUDE.md` im übergeordneten Projektordner
> `weberei-russikon/` (nicht Teil dieses Git-Repos). Sie erklärt Ziel, Struktur,
> Stilregeln, den interaktiven Plan, das Hosting und die offenen Punkte.
> Dieses Repo enthält nur den Ordner `webseite/`. Die Rohmaterialien (Fotos,
> Word-Dokument, Grundriss-Scans) liegen im Nachbarordner `unterlagen/` und sind
> ebenfalls nicht im Repo. Live: https://nicavegn.github.io/weberei-russikon/

Konzept-Prototyp für die Website des Areals der ehemaligen Weberei Russikon
(Madetswilerstrasse 27/29, 8332 Russikon). Die Seite stellt das Areal vor,
erzählt seine Geschichte und zeigt die verfügbaren Gewerbeflächen in einem
interaktiven Gebäudeplan.

Stand: lauffähiger Prototyp mit echten Fotos und Geschichtstexten. Der
Gebäudeplan ist eine schematische Darstellung auf Basis der vorliegenden Pläne,
Flächenaufteilung und Status sind noch Platzhalter.

## Projektziel

Hochwertiger, klickbarer Prototyp für eine Präsentation. Look im Stil alter
Baupläne und Vintage-Plakate (Papierton, Tusche, Backstein-Akzent), kombiniert
mit moderner, intuitiver Interaktion. Eigene Marke, kein SOLIDA-Branding.

## Starten

Es ist kein Server und kein Build-Prozess nötig. Die Datei `index.html` einfach
im Browser öffnen (Doppelklick). Alle Schriften und Bilder sind lokal
eingebunden, die Seite läuft auch ohne Internet.

## Struktur

```
webseite/
├── index.html            Startseite (Hero, Intro, Teaser, Call-to-Action)
├── geschichte.html       Geschichte als Zeitstrahl in fünf Kapiteln
├── vermietung.html       Interaktiver Gebäudeplan mit Detail-Panel
├── README.md             dieses Dokument
├── css/
│   ├── fonts.css         lokale Schriften (@font-face)
│   ├── style.css         Design-System und gemeinsames Layout
│   └── plan.css          Stile für den interaktiven Gebäudeplan
├── js/
│   ├── main.js           Navigation, Scroll-Effekte, Jahreszahl im Footer
│   └── plan.js           Logik des Gebäudeplans (Status, Panel, Mailto)
├── data/
│   └── flaechen.js       alle Flächendaten (einzige Pflegestelle)
└── assets/
    ├── fonts/            Schriftdateien (woff2)
    └── img/              Bilder (Fotos als jpg, Platzhalter als svg)
```

## Design-System

Farben und Typografie sind als CSS-Variablen in `css/style.css` unter `:root`
definiert und an einer Stelle anpassbar.

- Papierton: `--color-paper`
- Tusche (Tiefblau-Anthrazit): `--color-ink`
- Backstein-Rot (Akzent): `--color-brick`
- Statusfarben: `--status-frei` (grün), `--status-bald` (gelb), `--status-vermietet` (rot)
- Titelschrift (Serif): Playfair Display, `--font-serif`
- Lauftext (Sans-Serif): Source Sans 3, `--font-sans`

## Flächendaten pflegen

Alle Mietflächen liegen in `data/flaechen.js` in der Konstante `FLAECHEN`.
Das ist die einzige Stelle, an der Status und Angaben gepflegt werden. Das
JavaScript liest daraus und färbt den Plan, füllt das Panel und baut den
Kontakt-Link. Bewusst eine JS-Datei (kein JSON), damit die Seite auch beim
direkten Öffnen im Browser läuft (kein fetch, kein CORS-Problem).

Felder pro Fläche:

| Feld          | Bedeutung                                                        |
|---------------|------------------------------------------------------------------|
| `nr`          | Flächennummer, muss mit `data-nr` des Polygons übereinstimmen    |
| `name`        | Bezeichnung der Fläche                                           |
| `geschoss`    | `"EG"` oder `"UG"`                                               |
| `gebaeude`    | Gebäudeteil, z.B. "Gebäude 27" oder "Grosse Halle, 29.1"        |
| `flaeche`     | Grösse in Quadratmetern (Zahl)                                   |
| `nutzung`     | Nutzungsart, z.B. "Atelier / Werkstatt"                         |
| `status`      | `"frei"` (grün), `"bald"` (gelb) oder `"vermietet"` (rot)        |
| `beschreibung`| kurzer Beschreibungstext fürs Panel                            |

Status ändern: in der betreffenden Fläche nur den Wert von `status` anpassen.
Farbe im Plan und Abzeichen im Panel folgen automatisch. Bei `"vermietet"` wird
der Anfrage-Button im Panel ausgegraut und der Mailto-Link entfernt.

### Plan und Geschosse

Der Plan in `vermietung.html` zeigt Erdgeschoss und Untergeschoss untereinander
(kein Umschalter). Jedes Geschoss ist ein Block `.plan-floor` mit einem eigenen
Inline-SVG. Jede Fläche ist eine Gruppe:

```html
<g class="flaeche" data-nr="27a">
  <rect class="flaeche__shape" x="60" y="70" width="180" height="75"/>
  <text class="flaeche__nr" x="150" y="103" text-anchor="middle">27a</text>
  <text class="flaeche__area" x="150" y="121" text-anchor="middle"></text>
</g>
```

Schritte für eine neue Fläche:

1. In `vermietung.html` eine solche Gruppe im passenden Geschoss-SVG ergänzen
   und Position und Grösse des `rect` anpassen. Das `data-nr` muss eindeutig sein.
2. Die Flächennummer als Text in `.flaeche__nr` setzen. Das Feld `.flaeche__area`
   bleibt leer, die Quadratmeter werden aus den Daten gefüllt.
3. In `data/flaechen.js` einen Eintrag mit derselben `nr` ergänzen.

Technische, nicht vermietbare Räume (z.B. Luftschutzanlage, Lüftung) sind als
`.tech-room` ohne `data-nr` eingezeichnet und nicht anklickbar.

## Inhalte ersetzen

- **Bilder:** Dateien in `assets/img/` durch echte Fotos ersetzen (gleiche
  Dateinamen beibehalten oder die `src`-Pfade in den HTML-Dateien anpassen).
  Die Fotos liegen web-optimiert vor (Originale im Nachbarordner `unterlagen/`).
- **Historische Kapitelbilder:** `k1.svg` bis `k4.svg` sind noch Platzhalter,
  da keine historischen Fotos vorliegen. Sie können durch echte oder
  KI-generierte Bilder ersetzt werden.
- **Geschichtstexte:** in `geschichte.html` je Kapitel den Text austauschen.
- **Kontakt-Adresse:** der Platzhalter `vermietung@weberei-russikon.ch` steht in
  `js/plan.js` (Konstante `KONTAKT_MAIL`).

## Sprach- und Stilregeln

- Deutsch mit Schweizer Rechtschreibung (immer ss statt ß).
- Umlaute korrekt als ä, ö, ü schreiben.
- Keine Gedankenstriche (kein Zeichen "—"), stattdessen Komma, Punkt, Doppelpunkt.
- Anrede formell mit Sie. Ton sachlich und hochwertig.

## Technik

Statische Website aus HTML, CSS und Vanilla-JavaScript. Kein Framework, keine
Abhängigkeiten, kein Build. Responsive für Laptop (Präsentation) und Mobile,
Desktop hat Priorität.
