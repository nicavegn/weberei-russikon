# Alte Weberei Russikon, Website

> **Projektkontext und Übergabe:** Eine ausführliche Übergabe für neue
> Arbeitssitzungen liegt in der Datei `CLAUDE.md` im übergeordneten Projektordner
> `weberei-russikon/` (nicht Teil dieses Git-Repos). Sie erklärt Ziel, Struktur,
> Stilregeln, das Hosting und die offenen Punkte.
> Dieses Repo enthält nur den Ordner `webseite/`. Die Rohmaterialien (Fotos,
> Word-Dokument, Grundriss-PDF) liegen im Nachbarordner `unterlagen/` und sind
> ebenfalls nicht im Repo.
>
> Für die Inbetriebnahme auf einem eigenen Hoster siehe **[HOSTING.md](HOSTING.md)**.

Website für das Areal der ehemaligen Weberei Russikon (Madetswilerstrasse 27/29,
8332 Russikon). Die Seite stellt das Areal vor, erzählt seine Geschichte und
zeigt die Grundrisse mit einer Flächenliste.

## Aufbau der Vermietungsseite

Erst der Plan, dann die Liste. Erst sieht man, wo eine Fläche liegt, dann was
sie kostet.

1. **Grundrisse.** Pillen für den Gebäudeteil, daneben eine zweite Reihe für das
   Geschoss, sofern der Teil mehr als eines hat. Darunter der Grundriss als Bild
   des Originalplans. Er ist nicht anklickbar, ein Klick öffnet ihn nur in
   voller Grösse.
2. **Flächen.** Je Mieteinheit eine Karte mit der Einheit-Nr. als Marke
   (dieselbe Nummer steht im Grundriss), Bezeichnung, Fläche, Mietzins, Nutzung,
   Hinweis und den Einzelräumen zum Aufklappen. Je Karte ein Anfrage-Knopf, der
   die Fläche im Formular vorwählt, einen Nachrichtenentwurf ausfüllt und
   dorthin springt.

**Es gibt nur eine Bedienung.** Die Pillen oben steuern beides: den gezeigten
Grundriss und die Liste darunter. Diese zeigt genau den gewählten Gebäudeteil,
gegliedert nach Geschoss, und das Geschoss des gezeigten Blattes steht zuoberst.
Eigene Filter über der Liste gibt es bewusst nicht, so können Plan und Liste
nicht auseinanderlaufen. Geblieben ist ein einziges Häkchen, das die vermieteten
Flächen dazuschaltet; ohne es stehen nur die verfügbaren da.

Wer eine Fläche im Plan sieht, merkt sich also deren **Nummer** und findet sie
in der Liste darunter wieder. Deshalb müssen Plan und Liste dieselben Kennungen
tragen.

## Projektziel

Hochwertiger Auftritt im Look alter Baupläne und Vintage-Plakate (Papierton,
Tusche, Backstein-Akzent). Eigene Marke, kein SOLIDA-Branding.

## Starten

**Nur die öffentlichen Seiten:** `index.html` im Browser öffnen. Alle Schriften,
Bilder und Daten sind lokal eingebunden, es läuft auch ohne Internet.

**Mit Admin-Bereich und Formular:** Dafür braucht es PHP 8.

```bash
php -S localhost:8124 -t .
```

Danach `http://localhost:8124/admin/einrichten.php` aufrufen und die Zugangsdaten
festlegen. Der Mailversand funktioniert lokal nicht, gescheiterte Anfragen landen
zur Kontrolle in `api/anfragen-nicht-zugestellt.log`.

## Struktur

```
webseite/
├── index.html            Startseite
├── geschichte.html       Geschichte als Zeitstrahl in fünf Kapiteln
├── vermietung.html       Grundrisse, Flächenliste, Anfrageformular
├── README.md             dieses Dokument
├── HOSTING.md            Inbetriebnahme auf einem Schweizer Hoster
├── robots.txt            Disallow all, solange die Seite nicht öffentlich ist
├── admin/
│   ├── index.php         Anmeldung und Flächenverwaltung
│   ├── einrichten.php    einmalige Ersteinrichtung, sperrt sich danach selbst
│   ├── admin.css | admin.js
├── api/
│   ├── anfrage.php       nimmt das Anfrageformular entgegen und versendet es
│   ├── konfig.beispiel.php   Vorlage, die echte konfig.php ist nicht im Repo
│   ├── .htaccess         sperrt konfig.php, lib/ und Protokolle
│   └── lib/
│       ├── auth.php      Anmeldung, Sitzung, Zeitschloss, Token
│       ├── daten.php     Einheiten lesen, prüfen, schreiben
│       └── kompat.php    Rückfall, falls mbstring auf dem Server fehlt
├── css/
│   ├── fonts.css | style.css (Design-System) | plan.css (Vermietungsseite)
├── js/
│   ├── main.js           Navigation, Scroll-Effekte, Jahreszahl im Footer
│   └── plan.js           Pillen, Grundriss, Flächenliste, Anfrage
├── data/
│   ├── flaechen.json     Quelle der Wahrheit, vom Admin geschrieben
│   ├── flaechen.js       daraus erzeugt, wird von den Seiten geladen
│   └── .htaccess         sperrt Sicherungen und Zwischendateien
└── assets/
    ├── fonts/            Schriftdateien (woff2)
    ├── img/              Fotos (jpg) und Signets (svg)
    └── plaene/           die neun Grundrisse als PNG
```

## Grundrisse

Die neun Bilder in `assets/plaene/` sind die unveränderten Blätter der
Gebäudeaufnahme, gerendert aus den PDF in
`unterlagen/plaene/Pläne mit Bezeichnung/`. Dateinamen nach dem Muster
`<gebaeudeteil>-<geschoss>.png`, also `websaal-eg.png`, `gebaeude27-ug.png` und
so weiter. 3097 x 2190 Bildpunkte, je 110 bis 400 KB.

**In dieser Fassung trägt jede Fläche im Plan ihre Einheit-Nr.**, etwa `29EG05`
über «Raum 3.1». Genau diese Nummer ist die `id` in `data/flaechen.json` und
steht auf der Website als Marke oben auf jeder Karte. So findet man eine Fläche
vom Plan in die Liste und zurück. Bleibt beim Pflegen der Daten bitte so.

**Neu erzeugen**, wenn aktualisierte Pläne vorliegen:

```bash
py unterlagen/werkzeuge/plaene_exportieren.py
```

Das Werkzeug rendert bei 2.6-facher Vergrösserung, schneidet den weissen
Aussenrand weg und speichert als PNG mit reduzierter Palette. Bleiben die
PDF-Dateinamen gleich, ist danach nichts weiter zu ändern. Die Pfade stehen in
`data/flaechen.json` bei jedem Gebäudeteil unter `plaene`.

**Eine Ausnahme vom «eins zu eins»:** Das Blatt Gebäude 29 EG schreibt die
grosse Halle mit dem Namen des heutigen Mieters an. Mieternamen gehören nicht
auf die Website, darum ersetzt das Werkzeug diesen einen Namen beim Rendern
durch «Haupthalle», die Bezeichnung aus `flaechen.json`. Die PDF bleibt
unberührt. Geregelt ist das in der Liste `ERSETZUNGEN` im Werkzeug; wer das
Blatt unverändert will, leert die Liste und exportiert neu.

## Flächendaten pflegen

Normalfall ist der Admin-Bereich unter `/admin/`. Je Einheit eine Karte mit zwei
Häkchen und den Textfeldern.

**Die beiden Häkchen:**

- **Verfügbar** an, die Fläche erscheint auf der Website und lässt sich anfragen.
  Aus, sie gilt als vermietet.
- **Räume einzeln mietbar** steuert, ob unter «X Räume» auf der Website
  «einzeln mietbar» oder «nur zusammen mietbar» steht.

**Den Status setzt der Admin nicht direkt**, er ergibt sich:

| Häkchen «Verfügbar» | Feld «Frei ab»      | Status      |
|---------------------|---------------------|-------------|
| aus                 | egal                | `vermietet` |
| an                  | leer oder Vergangenheit | `frei`  |
| an                  | Datum in der Zukunft    | `bald`  |

Beim Speichern passiert Folgendes:

1. Alle Eingaben werden geprüft (Gebäudeteil, Geschoss, Zahlen, Datum, Preise).
2. Eine Sicherung des bisherigen Standes wandert nach `data/sicherungen/`,
   die letzten zehn bleiben erhalten.
3. `data/flaechen.json` wird geschrieben, über eine temporäre Datei, damit bei
   einem Abbruch nie ein Torso entsteht.
4. `data/flaechen.js` wird daraus neu erzeugt.

Die öffentlichen Seiten laden ausschliesslich `flaechen.js`. Bewusst als
JS-Datei und nicht per `fetch` auf die JSON, damit die Seiten auch ohne Server
und ohne PHP laufen.

### Datenmodell

`gebaeude` beschreibt die fünf Gebäudeteile samt Pfaden zu den Grundrissen.
`einheiten` enthält, was am Stück vermietet wird.

| Feld          | Bedeutung                                                       |
|---------------|-----------------------------------------------------------------|
| `id`          | eindeutiger Schlüssel der Einheit, z.B. `27EG5`. Darf nicht gleich lauten wie die Nummer eines ihrer Räume |
| `marke`       | Nummernspanne für das Abzeichen auf der Karte, z.B. `27EG5.1 bis 5.5`. Wird aus den Raumnummern gebildet |
| `gebaeude`    | `id` eines Eintrags aus `gebaeude`                              |
| `geschoss`    | `"EG"` oder `"UG"`                                              |
| `bezeichnung` | wie im Plan angeschrieben, z.B. `Raum 5.1 bis 5.5`              |
| `flaeche`     | Grösse in Quadratmetern (Zahl)                                  |
| `nutzung`     | Nutzungsart, z.B. «Büro, Gewerbe»                               |
| `status`      | `"frei"` (grün), `"bald"` (gelb) oder `"vermietet"` (rot)        |
| `frei_ab`     | Datum als `JJJJ-MM-TT`, nur bei Status `bald`                   |
| `preis_min`   | tiefster Quadratmeterpreis der Räume dieser Einheit, oder `null` |
| `preis_max`   | höchster Quadratmeterpreis der Räume dieser Einheit, oder `null` |
| `fixmiete`    | fester Monatszins in CHF. Gesetzt, gilt er **anstelle** der m²-Preise |
| `nebenkosten` | `"exkl."`, `"inkl."` oder `"inkl-ohne-heizung"`, erscheint hinter dem Mietzins |
| `teilbar`     | `true`, wenn die Räume auch einzeln zu haben sind               |
| `hinweis`     | ein Satz für die Karte, z.B. «Auf Wunsch zusammen mit Raum 1.»  |
| `farbe`       | Füllfarbe der Fläche im Grundriss als `#rrggbb`, siehe unten     |
| `raeume`      | Einzelräume der Einheit, je `id` (Nummer im Plan), `bez`, `qm`, `farbe` und `preis` |

**Anzeige des Mietzinses** in dieser Reihenfolge: bei Status `vermietet` gar
kein Betrag; sonst `fixmiete`, wenn gesetzt; sonst die Spanne `preis_min` bis
`preis_max`; sind beide gleich oder nur einer gesetzt, nur dieser Wert; sonst
«auf Anfrage».

**Achtung, die Spanne bedeutet seit dem 23.08.2026 etwas anderes.** Früher stand
sie für «im heutigen Zustand bis ausgebaut». Die Mietzinsliste kennt seither nur
noch eine Zahl je Raum. Eine Spanne auf der Karte heisst jetzt: Die Räume dieser
Einheit sind verschieden teuer. In der aufgeklappten Raumliste steht dann bei
jedem Raum sein eigener Preis. Betroffen sind zwei Einheiten, der Websaal EG
(Raum 1 zu 95, alles übrige zu 48) und Gebäude 29 EG Raum 4 (60, 45, 60).

**Nebenkosten:** Unter der Flächenliste stehen die vier Ansätze der Verwaltung,
je m² und Jahr: Heizkosten-Akonto 8.50, Strom 6.50, Wasser 1.15, übrige
Nebenkosten 1.25. Sie stehen fest im HTML von `vermietung.html`, nicht in den
Daten, weil sie für das ganze Areal gelten und nicht je Fläche.

**Zu `raeume` und `teilbar`:** Die Aufteilung stammt aus der Gebäudeaufnahme und
wird im Admin nur angezeigt, nicht verändert. Jeder Raum trägt seine Nummer aus
dem Grundriss, etwa `27EG5.3`, dazu die Farbe, in der er dort eingezeichnet ist.

`teilbar` entscheidet über die Anfrage:

- `true`: Jede Raumzeile bekommt einen eigenen Knopf «Anfragen». Man fragt genau
  einen Raum an, nicht die ganze Einheit. Besteht die Einheit aus einem einzigen
  Raum, steht der Knopf wie bisher unten auf der Karte.
- `false`: Die Räume stehen als Gruppe beisammen, kenntlich an der Klammer am
  linken Rand und dem Satz «Diese Räume werden nur zusammen vermietet». Unten auf
  der Karte steht ein einziger Knopf «Ganze Einheit anfragen».

Die Angaben dazu stammen aus der Rückmeldung vom 23.08.2026. Nur zusammen zu
haben sind: der Websaal im EG, die Schutzräume 2.1 bis 2.3, in Gebäude 29 EG die
Räume 2.2/2.3, 3.1/3.2 und 4.1 bis 4.3, in Gebäude 29 UG die Räume 2.1 bis 2.4
und in Gebäude 27 EG die Räume 5.1 bis 5.5.

Unter der Gesamtfläche nennt die Karte die kleinste einzeln mietbare Fläche,
etwa «einzeln ab 12.3 m²». WC und Nebenräume bleiben bei dieser Zahl aussen vor,
sie gehören zur Einheit, mietet aber niemand für sich allein. In der Raumliste
stehen sie weiterhin.

**Zu `farbe`:** Jede Karte in der Flächenliste ist in der Farbe eingefärbt, die
ihre Fläche im Grundriss trägt, und jede Raumzeile trägt einen Farbtupfer in der
Farbe ihres eigenen Raums. Das hilft bei Einheiten aus mehreren Tönen. Damit findet man vom Plan in die Liste, ohne die
Nummer lesen zu müssen. Der farbige Streifen oben an der Karte bleibt dem Status
vorbehalten, grün, gelb oder rot. Vermietete Flächen zeigen dieselbe Planfarbe,
zur Hälfte in den Papierton gemischt, damit sie zurücktreten.

Die Werte liest `unterlagen/werkzeuge/plan_farben_lesen.py` aus den Plänen und
trägt sie ein:

```bash
py unterlagen/werkzeuge/plan_farben_lesen.py --schreiben
```

Ohne `--schreiben` zeigt es nur, was es gemessen hat. Danach `flaechen.js` neu
erzeugen. Nötig ist das nur, wenn ein neuer Plansatz die Einfärbung ändert. Der
Admin-Bereich verändert die Farbe nicht, er reicht sie unverändert durch und
zeigt sie als kleine Marke neben der Kennung.

**Achtung bei mehrfarbigen Einheiten:** Die Pläne färben einzelne Räume, nicht
immer die ganze Einheit. Im Websaal-UG etwa sind die drei Bereiche der Einheit
WUG10 orange, gelb und grün. Die Karte nimmt darum die Farbe des grössten Raums,
also das, was beim Blick auf den Plan ins Auge fällt. Betroffen sind WEG09,
WUG14, WUG10, WUG13, 29UG08 und 27EG20.

**Nicht enthalten:** Allgemein-, Technik- und Erschliessungsflächen (rund
801 m², etwa Trafo, Lift, Gänge, Luftschächte). Sie haben keine Mieteinheit und
sind in den Mietzinsen der Hauptflächen inbegriffen. Die Summe aller Einheiten
entspricht damit den Mietflächen der Raumliste, 8’755.50 m².

## Zwischenspeicher der Browser

Browser behalten Gestaltung und Skripte eine Weile und holen sie nach einer
Änderung nicht von selbst neu. Wer die Seite schon einmal offen hatte, sähe
sonst neuen Text mit altem Design.

**Nach jeder Änderung an `css/` oder `js/` die Versionsnummer hochzählen.**
Sie hängt in allen Seiten an den Verweisen:

```html
<link rel="stylesheet" href="css/style.css?v=2">
<script src="js/plan.js?v=2"></script>
```

Also `?v=2` auf `?v=3` setzen, in `index.html`, `geschichte.html`,
`vermietung.html`, `admin/index.php` und `admin/einrichten.php`. Für den
Browser ist das eine neue Datei, er holt sie frisch.

**`data/flaechen.js` ist doppelt abgesichert.** Diese Datei schreibt der
Admin-Bereich neu, sooft jemand speichert. Niemand soll danach von Hand eine
Zahl ändern müssen, darum sorgt auf dem Hoster eine Regel in `data/.htaccess`
dafür, dass der Browser jedes Mal nachfragt, ob seine Kopie noch stimmt. Hat
sich nichts geändert, antwortet der Server mit 304 und schickt nichts. **Das
ist der Mechanismus, der im Betrieb zählt.**

Zusätzlich trägt auch dieser Verweis die Versionsnummer. Sie hilft überall
dort, wo die `.htaccess` nicht gilt, namentlich auf der Vorschau über GitHub
Pages: ohne sie halten Browser die Flächendaten dort bis zu zehn Minuten fest,
und ein frisch aufgespielter Stand ist nicht zu sehen. Beim Hochzählen also
diesen Verweis in `index.html` und `vermietung.html` nicht vergessen.

## Design-System

Farben und Typografie sind als CSS-Variablen in `css/style.css` unter `:root`
definiert und an einer Stelle anpassbar.

- Papierton: `--color-paper`
- Tusche (Tiefblau-Anthrazit): `--color-ink`
- Backstein-Rot (Akzent): `--color-brick`
- Statusfarben: `--status-frei` (grün), `--status-bald` (gelb), `--status-vermietet` (rot)
- Titelschrift (Serif): Playfair Display, `--font-serif`
- Lauftext (Sans-Serif): Source Sans 3, `--font-sans`

## Anfrageformular

Das Formular sendet an `api/anfrage.php`. Wer in der Flächenliste auf «Anfragen»
klickt, hat die Fläche bereits vorgewählt und einen Nachrichtenentwurf im Feld.

Schutzmassnahmen: ein für Menschen unsichtbares Honigtopf-Feld, dreissig
Sekunden Wartezeit zwischen zwei Anfragen derselben Herkunft, Längenprüfung
aller Felder und eine strikte Abwehr von Zeilenumbrüchen in allen Werten, die in
Kopfzeilen der Mail landen. Scheitert der Versand, wird die Anfrage in
`api/anfragen-nicht-zugestellt.log` festgehalten, damit nichts verloren geht.

In der Mail erscheint die Einheit ausgeschrieben, samt ihren Einzelräumen.

## Sicherheit

- Passwort nur als Hash in `api/konfig.php`, erzeugt mit `password_hash()`.
  Diese Datei ist über `.gitignore` ausgeschlossen und gehört nie ins Repo.
- Nach fünf Fehlversuchen **je Herkunft** ist die Anmeldung für diese Herkunft
  fünfzehn Minuten gesperrt. Ein einzelner Besucher kann die Verwaltung damit
  nicht für Sie sperren. Gegen verteiltes Durchprobieren gilt zusätzlich eine
  Obergrenze von dreissig Fehlversuchen je Stunde über alle Herkünfte; erst die
  sperrt für alle. Gezählt wird in `data/laufzeit/`, nicht im Systemtemp, denn
  der wird auf günstigem Hosting geleert oder ist zwischen Kunden geteilt.
- Sitzungscookie mit `HttpOnly` und `SameSite=Strict`, Verfall nach zwei
  Stunden Untätigkeit, neue Sitzungskennung nach dem Anmelden.
- Jede Änderung im Admin trägt ein Token gegen seitenübergreifende Anfragen.
- `api/.htaccess` sperrt `konfig.php`, den Ordner `lib/` und Protokolldateien.
  Zusätzlich liegt in `api/lib/` eine eigene `.htaccess`, und `daten.php` legt
  beim ersten Speichern eine in `data/sicherungen/` an. Doppelt, weil eine
  einzelne `RedirectMatch`-Regel je nach Installationstiefe danebengreifen kann.
- Alle Werte, die in Kopfzeilen der Mail landen, werden geprüft, auch die
  Kennung der Fläche. Sie erscheint im Betreff und muss dem Muster der
  Kennungen aus `flaechen.json` entsprechen.

## Sprach- und Stilregeln

- Deutsch mit Schweizer Rechtschreibung (immer ss statt ß).
- Umlaute korrekt als ä, ö, ü schreiben.
- Keine Gedankenstriche (kein Zeichen "—"), stattdessen Komma, Punkt, Doppelpunkt.
- Anrede formell mit Sie. Ton sachlich und hochwertig.

## Technik

Statisches Frontend aus HTML, CSS und Vanilla-JavaScript, dazu ein schlankes
PHP-Backend für Login und Formular. Kein Framework, keine Abhängigkeiten, kein
Build, keine Datenbank. Responsive für Laptop und Mobile, Desktop hat Priorität.
Die Flächenliste ist ein Kartenraster, das sich von drei Spalten auf eine
verengt.

Geprüft mit PHP 8.0 und PHP 8.3. Fehlt die Erweiterung mbstring, springt
`api/lib/kompat.php` ein.
