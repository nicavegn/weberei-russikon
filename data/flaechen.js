/* =====================================================================
   Flächendaten der Alten Weberei Russikon
   ---------------------------------------------------------------------
   Diese Datei ist die einzige Stelle, an der Flächen gepflegt werden.
   Sie wird bewusst als JS-Datei (nicht JSON) eingebunden, damit die
   Seite auch durch direktes Öffnen der HTML im Browser läuft, ohne
   lokalen Server (kein fetch, kein CORS-Problem).

   Struktur orientiert sich an den vorliegenden Plänen:
   Gebäude 27 und Gebäude 29 (strassenseitig, Büros und Gewerbe) sowie
   die grosse Sheddachhalle (Gebäude 29.1) mit Untergeschoss.

   Pflege:
   - "status" steuert Farbe im Plan und Abzeichen im Panel.
     Erlaubte Werte: "frei" (grün), "bald" (gelb), "vermietet" (rot).
     Bei "vermietet" wird der Anfrage-Button ausgegraut.
   - "nr" muss mit dem Attribut data-nr des zugehörigen Polygons in
     vermietung.html übereinstimmen.
   - "geschoss" ist "EG" oder "UG".
   - Flächen, m² und Status sind Platzhalter, bis die definitive Liste
     vorliegt. Die Geometrie ist eine schematische Darstellung der Pläne.
   ===================================================================== */

const FLAECHEN = [
  /* --- Gebäude 27, Erdgeschoss -------------------------------------- */
  {
    nr: "27a", name: "Büro Nord", geschoss: "EG", gebaeude: "Gebäude 27",
    flaeche: 48, nutzung: "Büro", status: "frei",
    beschreibung: "Heller Büroraum an der Strassenseite mit Raumhöhe von rund vier Metern. Sofort bezugsbereit."
  },
  {
    nr: "27b", name: "Büro Süd", geschoss: "EG", gebaeude: "Gebäude 27",
    flaeche: 56, nutzung: "Büro", status: "vermietet",
    beschreibung: "Bestehende Bürofläche im Erdgeschoss von Gebäude 27, bereits vermietet."
  },
  {
    nr: "27c", name: "Atelier", geschoss: "EG", gebaeude: "Gebäude 27",
    flaeche: 82, nutzung: "Atelier / Studio", status: "bald",
    beschreibung: "Vielseitige Fläche mit Charakter, derzeit noch belegt. Wird in Kürze frei."
  },
  {
    nr: "27d", name: "Werkstatt", geschoss: "EG", gebaeude: "Gebäude 27",
    flaeche: 124, nutzung: "Werkstatt / Gewerbe", status: "frei",
    beschreibung: "Robuste Gewerbefläche mit gutem Zugang von der Rampe. Geeignet für Werkstatt oder Produktion."
  },

  /* --- Gebäude 29, Erdgeschoss -------------------------------------- */
  {
    nr: "29a", name: "Gewerbe West", geschoss: "EG", gebaeude: "Gebäude 29",
    flaeche: 70, nutzung: "Gewerbe", status: "frei",
    beschreibung: "Gewerbefläche mit Fensterfront zur Strasse. Teilbar, vielfältig nutzbar."
  },
  {
    nr: "29b", name: "Büro Ost", geschoss: "EG", gebaeude: "Gebäude 29",
    flaeche: 64, nutzung: "Büro", status: "vermietet",
    beschreibung: "Repräsentative Bürofläche im Gebäude 29, bereits vermietet."
  },
  {
    nr: "29c", name: "Lager", geschoss: "EG", gebaeude: "Gebäude 29",
    flaeche: 58, nutzung: "Lager", status: "bald",
    beschreibung: "Trockene Lagerfläche im Erdgeschoss. Wird in Kürze frei."
  },

  /* --- Grosse Halle (Gebäude 29.1), Erdgeschoss --------------------- */
  {
    nr: "H1", name: "Grosse Halle West", geschoss: "EG", gebaeude: "Grosse Halle, 29.1",
    flaeche: 340, nutzung: "Halle / Produktion", status: "frei",
    beschreibung: "Grosszügiger Hallenteil unter dem Sheddach mit Gusssäulen und Nordlicht. Hohe Tragfähigkeit, vielseitig nutzbar."
  },
  {
    nr: "H2", name: "Grosse Halle Ost", geschoss: "EG", gebaeude: "Grosse Halle, 29.1",
    flaeche: 300, nutzung: "Halle / Lager", status: "vermietet",
    beschreibung: "Östlicher Hallenteil der Sheddachhalle, bereits vermietet."
  },
  {
    nr: "H3", name: "Hallenkopf", geschoss: "EG", gebaeude: "Grosse Halle, 29.1",
    flaeche: 96, nutzung: "Atelier / Showroom", status: "frei",
    beschreibung: "Abgetrennter Kopfbereich der Halle, geeignet als Atelier, Showroom oder Besprechungsfläche."
  },

  /* --- Untergeschoss (unter der grossen Halle) --------------------- */
  {
    nr: "U1", name: "Kellerlager West", geschoss: "UG", gebaeude: "Grosse Halle, 29.1",
    flaeche: 128, nutzung: "Lager", status: "frei",
    beschreibung: "Witterungsgeschütztes Lager im Untergeschoss, über Rampe und Treppe erschlossen."
  },
  {
    nr: "U2", name: "Kellerlager Ost", geschoss: "UG", gebaeude: "Grosse Halle, 29.1",
    flaeche: 118, nutzung: "Lager", status: "vermietet",
    beschreibung: "Lagerfläche im Untergeschoss, bereits vermietet."
  }
];

/* Lesbare Beschriftungen für Status (Plan-Legende und Panel) */
const STATUS_LABELS = {
  frei:      "frei",
  bald:      "wird in Kürze frei",
  vermietet: "vermietet"
};
