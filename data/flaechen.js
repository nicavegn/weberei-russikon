/* =====================================================================
   Flächendaten der Alten Weberei Russikon
   ---------------------------------------------------------------------
   ACHTUNG: Diese Datei wird automatisch erzeugt. Nicht von Hand ändern.
   Quelle ist data/flaechen.json, geschrieben vom Admin-Bereich.
   Neu erzeugen: im Admin einmal speichern.

   Bewusst eine JS-Datei und kein fetch auf die JSON, damit die Seiten
   auch ohne Server und ohne PHP laufen (kein CORS, keine Abhängigkeit).
   ===================================================================== */

const WEBEREI_DATEN = {
  "_hinweis": "Quelle der Wahrheit für die Flächen. Erzeugt von unterlagen/werkzeuge/flaechen_aufbauen.py, danach die Farben mit plan_farben_lesen.py nachziehen. Der Admin-Bereich schreibt diese Datei ebenfalls.",
  "_stand": "21.08.2026",
  "_grundlage": "Raumliste der Eigentümerschaft vom 21.08.2026, Grundrisse Gossweiler Ingenieure AG vom 23.06.2026, Blätter Websaal EG, Websaal UG und Gebäude 29 UG in der überarbeiteten Fassung vom 21.08.2026.",
  "gebaeude": [
    {
      "id": "websaal",
      "name": "Grosser Websaal",
      "kurz": "Websaal",
      "beschreibung": "Die grosse Halle im hinteren Arealteil, dazu das Untergeschoss als Lager.",
      "beschreibungen": {
        "EG": "Die grosse Halle stammt aus den 1960er-Jahren. Auf der ganzen Fläche von rund 2000 m² stehen nur zwei Betonsäulen, die Halle ist also nahezu stützenfrei.",
        "UG": "Das Untergeschoss mit rund 888 m² Hauptfläche. Der Zugang führt direkt von aussen oder über die Rampe mit dem Lift."
      },
      "geschosse": [
        "EG",
        "UG"
      ],
      "plaene": {
        "EG": "assets/plaene/websaal-eg.png",
        "UG": "assets/plaene/websaal-ug.png"
      }
    },
    {
      "id": "gebaeude29",
      "name": "Gebäude 29",
      "kurz": "29",
      "beschreibung": "Strassenseitiger Bau mit Büro- und Gewerberäumen, dahinter die grosse Produktionshalle.",
      "beschreibungen": {
        "UG": "Das Untergeschoss an der Strasse mit zwei Ateliers."
      },
      "geschosse": [
        "EG",
        "UG"
      ],
      "plaene": {
        "EG": "assets/plaene/gebaeude29-eg.png",
        "UG": "assets/plaene/gebaeude29-ug.png"
      }
    },
    {
      "id": "gebaeude27",
      "name": "Gebäude 27",
      "kurz": "27",
      "beschreibung": "Backsteinbau an der Strasse mit zusammenhängenden Büro- und Gewerbeflächen über zwei Geschosse.",
      "geschosse": [
        "EG",
        "UG"
      ],
      "plaene": {
        "EG": "assets/plaene/gebaeude27-eg.png",
        "UG": "assets/plaene/gebaeude27-ug.png"
      }
    },
    {
      "id": "roko",
      "name": "ROKO",
      "kurz": "ROKO",
      "beschreibung": "Freistehende Halle im hinteren Arealteil, stützenarm, mit Werkstatt im Untergeschoss. Sie ist nicht ebenerdig anfahrbar, der Zugang führt über die Rampe.",
      "geschosse": [
        "EG",
        "UG"
      ],
      "plaene": {
        "EG": "assets/plaene/roko-eg.png",
        "UG": "assets/plaene/roko-ug.png"
      }
    },
    {
      "id": "schopf",
      "name": "Schopf",
      "kurz": "Schopf",
      "beschreibung": "Unbeheizte Halle für Lager und Einstellzwecke. Sie ist nicht ebenerdig befahrbar, der Zugang führt über die Rampe.",
      "geschosse": [
        "EG"
      ],
      "plaene": {
        "EG": "assets/plaene/schopf-eg.png"
      }
    }
  ],
  "einheiten": [
    {
      "id": "WEG",
      "marke": "WEG1 bis 2.8",
      "gebaeude": "websaal",
      "geschoss": "EG",
      "bezeichnung": "Halle mit Nebenräumen",
      "flaeche": 2149.25,
      "nutzung": "Halle, Produktion, Lager",
      "status": "frei",
      "frei_ab": null,
      "preis_min": 48,
      "preis_max": 95,
      "fixmiete": null,
      "nebenkosten": "exkl.",
      "teilbar": false,
      "hinweis": "Im heutigen Zustand nur als Ganzes zu mieten. Die Halle lässt sich nach Wunsch des Mieters unterteilen.",
      "raeume": [
        {
          "id": "WEG2.1",
          "bez": "Raum 2.1, Halle",
          "qm": 1999.33,
          "preis": 48,
          "farbe": "#ffe0e0"
        },
        {
          "id": "WEG2.8",
          "bez": "Raum 2.8",
          "qm": 31.28,
          "preis": 48,
          "farbe": "#ffe0e0"
        },
        {
          "id": "WEG2.2",
          "bez": "Raum 2.2",
          "qm": 29.77,
          "preis": 48,
          "farbe": "#ffe0e0"
        },
        {
          "id": "WEG2.3",
          "bez": "Raum 2.3",
          "qm": 26.81,
          "preis": 48,
          "farbe": "#ffe0e0"
        },
        {
          "id": "WEG2.5",
          "bez": "WC 2.5",
          "qm": 12.69,
          "preis": 48,
          "farbe": "#ffe0e0"
        },
        {
          "id": "WEG1",
          "bez": "Raum 1",
          "qm": 12.55,
          "preis": 95,
          "farbe": "#ffffe0"
        },
        {
          "id": "WEG2.4",
          "bez": "Raum 2.4",
          "qm": 12.35,
          "preis": 48,
          "farbe": "#ffe0e0"
        },
        {
          "id": "WEG2.7",
          "bez": "Raum 2.7",
          "qm": 12.34,
          "preis": 48,
          "farbe": "#ffe0e0"
        },
        {
          "id": "WEG2.6",
          "bez": "WC 2.6",
          "qm": 12.13,
          "preis": 48,
          "farbe": "#ffe0e0"
        }
      ],
      "farbe": "#ffe0e0"
    },
    {
      "id": "WUGBereich4",
      "marke": "WUGBereich4",
      "gebaeude": "websaal",
      "geschoss": "UG",
      "bezeichnung": "Bereich 4",
      "flaeche": 889.23,
      "nutzung": "Lagerfläche",
      "status": "frei",
      "frei_ab": null,
      "preis_min": 65,
      "preis_max": 65,
      "fixmiete": null,
      "nebenkosten": "exkl.",
      "teilbar": true,
      "hinweis": "Lässt sich nach Bedürfnis des Mieters unterteilen.",
      "raeume": [
        {
          "id": "WUGBereich4",
          "bez": "Bereich 4",
          "qm": 889.23,
          "preis": 65,
          "farbe": "#ffe0ff"
        }
      ],
      "farbe": "#ffe0ff"
    },
    {
      "id": "WUGBereich1",
      "marke": "WUGBereich1",
      "gebaeude": "websaal",
      "geschoss": "UG",
      "bezeichnung": "Bereich 1",
      "flaeche": 199.76,
      "nutzung": "Lager, Gewerbe",
      "status": "frei",
      "frei_ab": null,
      "preis_min": null,
      "preis_max": null,
      "fixmiete": 400,
      "nebenkosten": "inkl.",
      "teilbar": true,
      "hinweis": null,
      "raeume": [
        {
          "id": "WUGBereich1",
          "bez": "Bereich 1",
          "qm": 199.76,
          "preis": null,
          "farbe": "#fff0e0"
        }
      ],
      "farbe": "#fff0e0"
    },
    {
      "id": "WUGBereich2",
      "marke": "WUGBereich2",
      "gebaeude": "websaal",
      "geschoss": "UG",
      "bezeichnung": "Bereich 2",
      "flaeche": 116.54,
      "nutzung": "Lager, Gewerbe",
      "status": "frei",
      "frei_ab": null,
      "preis_min": null,
      "preis_max": null,
      "fixmiete": 400,
      "nebenkosten": "inkl.",
      "teilbar": true,
      "hinweis": null,
      "raeume": [
        {
          "id": "WUGBereich2",
          "bez": "Bereich 2",
          "qm": 116.54,
          "preis": null,
          "farbe": "#ffffe0"
        }
      ],
      "farbe": "#ffffe0"
    },
    {
      "id": "WUGBereich3",
      "marke": "WUGBereich3",
      "gebaeude": "websaal",
      "geschoss": "UG",
      "bezeichnung": "Bereich 3",
      "flaeche": 112.07,
      "nutzung": "Lager, Gewerbe",
      "status": "frei",
      "frei_ab": null,
      "preis_min": null,
      "preis_max": null,
      "fixmiete": 400,
      "nebenkosten": "inkl.",
      "teilbar": true,
      "hinweis": null,
      "raeume": [
        {
          "id": "WUGBereich3",
          "bez": "Bereich 3",
          "qm": 112.07,
          "preis": null,
          "farbe": "#ffffe0"
        }
      ],
      "farbe": "#ffffe0"
    },
    {
      "id": "WUGSchutzraum1",
      "marke": "WUGSchutzraum1",
      "gebaeude": "websaal",
      "geschoss": "UG",
      "bezeichnung": "Schutzraum 1",
      "flaeche": 38.37,
      "nutzung": "Lagerfläche",
      "status": "frei",
      "frei_ab": null,
      "preis_min": null,
      "preis_max": null,
      "fixmiete": 300,
      "nebenkosten": "inkl.",
      "teilbar": true,
      "hinweis": "Einzeln zu mieten.",
      "raeume": [
        {
          "id": "WUGSchutzraum1",
          "bez": "Schutzraum 1",
          "qm": 38.37,
          "preis": null,
          "farbe": "#e0ffe0"
        }
      ],
      "farbe": "#e0ffe0"
    },
    {
      "id": "WUGSchutzraum2",
      "marke": "WUGSchutzraum2.1 bis 2.3",
      "gebaeude": "websaal",
      "geschoss": "UG",
      "bezeichnung": "Schutzraum 2.1 bis 2.3",
      "flaeche": 109.89,
      "nutzung": "Lagerfläche",
      "status": "frei",
      "frei_ab": null,
      "preis_min": null,
      "preis_max": null,
      "fixmiete": 600,
      "nebenkosten": "inkl.",
      "teilbar": false,
      "hinweis": "Nur zusammen zu mieten, Nebenraum inbegriffen.",
      "raeume": [
        {
          "id": "WUGSchutzraum2.1",
          "bez": "Schutzraum 2.1",
          "qm": 37.68,
          "preis": null,
          "farbe": "#e0f0ff"
        },
        {
          "id": "WUGSchutzraum2.2",
          "bez": "Schutzraum 2.2",
          "qm": 37.26,
          "preis": null,
          "farbe": "#e0f0ff"
        },
        {
          "id": "WUGSchutzraum2.3",
          "bez": "Schutzraum 2.3",
          "qm": 23.18,
          "preis": null,
          "farbe": "#e0f0ff"
        },
        {
          "id": null,
          "bez": "Nebenraum",
          "qm": 11.77,
          "preis": null,
          "farbe": null
        }
      ],
      "farbe": "#e0f0ff"
    },
    {
      "id": "WUGBunker",
      "marke": "WUGBunker",
      "gebaeude": "websaal",
      "geschoss": "UG",
      "bezeichnung": "Bunker",
      "flaeche": 136.81,
      "nutzung": "Bunker, Lager",
      "status": "vermietet",
      "frei_ab": null,
      "preis_min": null,
      "preis_max": null,
      "fixmiete": null,
      "nebenkosten": "inkl.",
      "teilbar": false,
      "hinweis": null,
      "raeume": [
        {
          "id": "WUGBunker",
          "bez": "Bunker",
          "qm": 130.6,
          "preis": null,
          "farbe": "#f0e0ff"
        },
        {
          "id": null,
          "bez": "Nebenraum",
          "qm": 6.21,
          "preis": null,
          "farbe": null
        }
      ],
      "farbe": "#f0e0ff"
    },
    {
      "id": "29EGHalle",
      "marke": "29EGHalle",
      "gebaeude": "gebaeude29",
      "geschoss": "EG",
      "bezeichnung": "Haupthalle",
      "flaeche": 2145.59,
      "nutzung": "Produktion, Lager",
      "status": "vermietet",
      "frei_ab": null,
      "preis_min": null,
      "preis_max": null,
      "fixmiete": null,
      "nebenkosten": "exkl.",
      "teilbar": false,
      "hinweis": null,
      "raeume": [
        {
          "id": "29EGHalle",
          "bez": "Haupthalle",
          "qm": 2145.59,
          "preis": null,
          "farbe": "#ffe0e0"
        }
      ],
      "farbe": "#ffe0e0"
    },
    {
      "id": "29EG1",
      "marke": "29EG1",
      "gebaeude": "gebaeude29",
      "geschoss": "EG",
      "bezeichnung": "Raum 1",
      "flaeche": 25.33,
      "nutzung": "Büro",
      "status": "frei",
      "frei_ab": null,
      "preis_min": 125,
      "preis_max": 125,
      "fixmiete": null,
      "nebenkosten": "exkl.",
      "teilbar": true,
      "hinweis": "Einzeln oder zusammen mit Raum 2.1 zu mieten.",
      "raeume": [
        {
          "id": "29EG1",
          "bez": "Raum 1",
          "qm": 25.33,
          "preis": 125,
          "farbe": "#e0e0ff"
        }
      ],
      "farbe": "#e0e0ff"
    },
    {
      "id": "29EG2.1",
      "marke": "29EG2.1",
      "gebaeude": "gebaeude29",
      "geschoss": "EG",
      "bezeichnung": "Raum 2.1",
      "flaeche": 28.81,
      "nutzung": "Büro",
      "status": "frei",
      "frei_ab": null,
      "preis_min": 95,
      "preis_max": 95,
      "fixmiete": null,
      "nebenkosten": "exkl.",
      "teilbar": true,
      "hinweis": "Einzeln zu mieten, ebenso zusammen mit Raum 1 oder mit den Räumen 2.2 und 2.3.",
      "raeume": [
        {
          "id": "29EG2.1",
          "bez": "Raum 2.1",
          "qm": 28.81,
          "preis": 95,
          "farbe": "#e0f0ff"
        }
      ],
      "farbe": "#e0f0ff"
    },
    {
      "id": "29EG2",
      "marke": "29EG2.2 bis 2.3",
      "gebaeude": "gebaeude29",
      "geschoss": "EG",
      "bezeichnung": "Raum 2.2 und 2.3",
      "flaeche": 121.49,
      "nutzung": "Büro",
      "status": "frei",
      "frei_ab": null,
      "preis_min": 95,
      "preis_max": 95,
      "fixmiete": null,
      "nebenkosten": "exkl.",
      "teilbar": false,
      "hinweis": "Nur zusammen zu mieten.",
      "raeume": [
        {
          "id": "29EG2.2",
          "bez": "Raum 2.2",
          "qm": 97.79,
          "preis": 95,
          "farbe": "#e0f0ff"
        },
        {
          "id": "29EG2.3",
          "bez": "Raum 2.3",
          "qm": 23.7,
          "preis": 95,
          "farbe": "#e0f0ff"
        }
      ],
      "farbe": "#e0f0ff"
    },
    {
      "id": "29EG3",
      "marke": "29EG3.1 bis 3.2",
      "gebaeude": "gebaeude29",
      "geschoss": "EG",
      "bezeichnung": "Raum 3.1 und 3.2",
      "flaeche": 126.97,
      "nutzung": "Büro",
      "status": "frei",
      "frei_ab": null,
      "preis_min": 95,
      "preis_max": 95,
      "fixmiete": null,
      "nebenkosten": "exkl.",
      "teilbar": false,
      "hinweis": "Nur zusammen zu mieten.",
      "raeume": [
        {
          "id": "29EG3.1",
          "bez": "Raum 3.1",
          "qm": 116.95,
          "preis": 95,
          "farbe": "#e0fff0"
        },
        {
          "id": "29EG3.2",
          "bez": "Raum 3.2",
          "qm": 10.02,
          "preis": 95,
          "farbe": "#e0fff0"
        }
      ],
      "farbe": "#e0fff0"
    },
    {
      "id": "29EG4",
      "marke": "29EG4.1 bis 4.3",
      "gebaeude": "gebaeude29",
      "geschoss": "EG",
      "bezeichnung": "Raum 4.1 bis 4.3",
      "flaeche": 101.39,
      "nutzung": "Lagerfläche",
      "status": "frei",
      "frei_ab": null,
      "preis_min": 45,
      "preis_max": 60,
      "fixmiete": null,
      "nebenkosten": "exkl.",
      "teilbar": false,
      "hinweis": "Nur zusammen zu mieten. Lagerfläche mit Küchenzeile.",
      "raeume": [
        {
          "id": "29EG4.1",
          "bez": "Raum 4.1",
          "qm": 63.88,
          "preis": 60,
          "farbe": "#fff0e0"
        },
        {
          "id": "29EG4.3",
          "bez": "Raum 4.3",
          "qm": 26.71,
          "preis": 60,
          "farbe": "#fff0e0"
        },
        {
          "id": "29EG4.2",
          "bez": "Raum 4.2",
          "qm": 10.8,
          "preis": 45,
          "farbe": "#fff0e0"
        }
      ],
      "farbe": "#fff0e0"
    },
    {
      "id": "29UG1",
      "marke": "29UG1",
      "gebaeude": "gebaeude29",
      "geschoss": "UG",
      "bezeichnung": "Atelier, Raum 1",
      "flaeche": 66.75,
      "nutzung": "Atelier",
      "status": "frei",
      "frei_ab": null,
      "preis_min": null,
      "preis_max": null,
      "fixmiete": 750,
      "nebenkosten": "inkl-ohne-heizung",
      "teilbar": true,
      "hinweis": null,
      "raeume": [
        {
          "id": "29UG1",
          "bez": "Raum 1",
          "qm": 66.75,
          "preis": null,
          "farbe": "#ffffe0"
        }
      ],
      "farbe": "#ffffe0"
    },
    {
      "id": "29UG2",
      "marke": "29UG2.1 bis 2.4",
      "gebaeude": "gebaeude29",
      "geschoss": "UG",
      "bezeichnung": "Atelier, Raum 2.1 bis 2.4",
      "flaeche": 76.28,
      "nutzung": "Atelier",
      "status": "frei",
      "frei_ab": null,
      "preis_min": null,
      "preis_max": null,
      "fixmiete": 950,
      "nebenkosten": "inkl-ohne-heizung",
      "teilbar": false,
      "hinweis": "Nur zusammen zu mieten, Nebenraum inbegriffen.",
      "raeume": [
        {
          "id": "29UG2.1",
          "bez": "Raum 2.1",
          "qm": 26.33,
          "preis": null,
          "farbe": "#e0fff0"
        },
        {
          "id": "29UG2.3",
          "bez": "Raum 2.3",
          "qm": 18.8,
          "preis": null,
          "farbe": "#e0fff0"
        },
        {
          "id": "29UG2.2",
          "bez": "Raum 2.2",
          "qm": 13.7,
          "preis": null,
          "farbe": "#e0fff0"
        },
        {
          "id": "29UG2.4",
          "bez": "Raum 2.4",
          "qm": 11.02,
          "preis": null,
          "farbe": "#e0fff0"
        },
        {
          "id": null,
          "bez": "Nebenraum",
          "qm": 6.43,
          "preis": null,
          "farbe": null
        }
      ],
      "farbe": "#e0fff0"
    },
    {
      "id": "27EG34",
      "marke": "27EG3 bis 4",
      "gebaeude": "gebaeude27",
      "geschoss": "EG",
      "bezeichnung": "Raum 3 und 4",
      "flaeche": 95.73,
      "nutzung": "Büro, Gewerbe",
      "status": "bald",
      "frei_ab": "2027-02-01",
      "preis_min": 95,
      "preis_max": 95,
      "fixmiete": null,
      "nebenkosten": "exkl.",
      "teilbar": true,
      "hinweis": "Einzeln oder zusammen zu mieten.",
      "raeume": [
        {
          "id": "27EG4",
          "bez": "Raum 4",
          "qm": 58.57,
          "preis": 95,
          "farbe": "#efffe0"
        },
        {
          "id": "27EG3",
          "bez": "Raum 3",
          "qm": 37.16,
          "preis": 95,
          "farbe": "#ffe0e0"
        }
      ],
      "farbe": "#efffe0"
    },
    {
      "id": "27EG5",
      "marke": "27EG5.1 bis 5.5",
      "gebaeude": "gebaeude27",
      "geschoss": "EG",
      "bezeichnung": "Raum 5.1 bis 5.5",
      "flaeche": 101.07,
      "nutzung": "Büro, Gewerbe",
      "status": "frei",
      "frei_ab": null,
      "preis_min": 110,
      "preis_max": 110,
      "fixmiete": null,
      "nebenkosten": "exkl.",
      "teilbar": false,
      "hinweis": "Nur zusammen zu mieten.",
      "raeume": [
        {
          "id": "27EG5.2",
          "bez": "Raum 5.2",
          "qm": 31.79,
          "preis": 110,
          "farbe": "#f0e0ff"
        },
        {
          "id": "27EG5.4",
          "bez": "Raum 5.4",
          "qm": 21.21,
          "preis": 110,
          "farbe": "#f0e0ff"
        },
        {
          "id": "27EG5.5",
          "bez": "Raum 5.5",
          "qm": 21.05,
          "preis": 110,
          "farbe": "#f0e0ff"
        },
        {
          "id": "27EG5.1",
          "bez": "Raum 5.1",
          "qm": 16.45,
          "preis": 110,
          "farbe": "#f0e0ff"
        },
        {
          "id": "27EG5.3",
          "bez": "Raum 5.3",
          "qm": 10.57,
          "preis": 110,
          "farbe": "#f0e0ff"
        }
      ],
      "farbe": "#f0e0ff"
    },
    {
      "id": "27EG1",
      "marke": "27EG1.1 bis 1.2",
      "gebaeude": "gebaeude27",
      "geschoss": "EG",
      "bezeichnung": "Raum 1.1 und 1.2",
      "flaeche": 60.3,
      "nutzung": "Büro, Gewerbe",
      "status": "vermietet",
      "frei_ab": null,
      "preis_min": null,
      "preis_max": null,
      "fixmiete": null,
      "nebenkosten": "exkl.",
      "teilbar": false,
      "hinweis": null,
      "raeume": [
        {
          "id": "27EG1.1",
          "bez": "Raum 1.1",
          "qm": 50.26,
          "preis": null,
          "farbe": "#e0fff0"
        },
        {
          "id": "27EG1.2",
          "bez": "Raum 1.2",
          "qm": 10.04,
          "preis": null,
          "farbe": "#e0fff0"
        }
      ],
      "farbe": "#e0fff0"
    },
    {
      "id": "27EG2",
      "marke": "27EG2.1 bis 2.6",
      "gebaeude": "gebaeude27",
      "geschoss": "EG",
      "bezeichnung": "Raum 2.1 bis 2.6",
      "flaeche": 356.44,
      "nutzung": "Büro, Gewerbe",
      "status": "vermietet",
      "frei_ab": null,
      "preis_min": null,
      "preis_max": null,
      "fixmiete": null,
      "nebenkosten": "exkl.",
      "teilbar": false,
      "hinweis": null,
      "raeume": [
        {
          "id": "27EG2.1",
          "bez": "Raum 2.1",
          "qm": 238.51,
          "preis": null,
          "farbe": "#fff0e0"
        },
        {
          "id": "27EG2.6",
          "bez": "Raum 2.6",
          "qm": 42.13,
          "preis": null,
          "farbe": "#fff0e0"
        },
        {
          "id": "27EG2.4",
          "bez": "Raum 2.4",
          "qm": 23.76,
          "preis": null,
          "farbe": "#fff0e0"
        },
        {
          "id": "27EG2.2",
          "bez": "Raum 2.2",
          "qm": 18.77,
          "preis": null,
          "farbe": "#fff0e0"
        },
        {
          "id": "27EG2.3",
          "bez": "Raum 2.3",
          "qm": 17.1,
          "preis": null,
          "farbe": "#fff0e0"
        },
        {
          "id": "27EG2.5",
          "bez": "Raum 2.5",
          "qm": 16.17,
          "preis": null,
          "farbe": "#fff0e0"
        }
      ],
      "farbe": "#fff0e0"
    },
    {
      "id": "27UG1",
      "marke": "27UG1.1 bis 1.3",
      "gebaeude": "gebaeude27",
      "geschoss": "UG",
      "bezeichnung": "Raum 1.1 bis 1.3",
      "flaeche": 181.52,
      "nutzung": "Lager, Gewerbe",
      "status": "vermietet",
      "frei_ab": null,
      "preis_min": null,
      "preis_max": null,
      "fixmiete": null,
      "nebenkosten": "exkl.",
      "teilbar": false,
      "hinweis": null,
      "raeume": [
        {
          "id": "27UG1.2",
          "bez": "Raum 1.2",
          "qm": 152.23,
          "preis": null,
          "farbe": "#fff0e0"
        },
        {
          "id": "27UG1.3",
          "bez": "Raum 1.3",
          "qm": 20.12,
          "preis": null,
          "farbe": "#fff0e0"
        },
        {
          "id": "27UG1.1",
          "bez": "Raum 1.1",
          "qm": 9.17,
          "preis": null,
          "farbe": "#fff0e0"
        }
      ],
      "farbe": "#fff0e0"
    },
    {
      "id": "27UG2",
      "marke": "27UG2.1 bis 2.3",
      "gebaeude": "gebaeude27",
      "geschoss": "UG",
      "bezeichnung": "Raum 2.1 bis 2.3",
      "flaeche": 254.21,
      "nutzung": "Lager, Gewerbe",
      "status": "vermietet",
      "frei_ab": null,
      "preis_min": null,
      "preis_max": null,
      "fixmiete": null,
      "nebenkosten": "exkl.",
      "teilbar": false,
      "hinweis": null,
      "raeume": [
        {
          "id": "27UG2.1",
          "bez": "Raum 2.1",
          "qm": 218.94,
          "preis": null,
          "farbe": "#e0fff0"
        },
        {
          "id": "27UG2.3",
          "bez": "Raum 2.3",
          "qm": 18.77,
          "preis": null,
          "farbe": "#e0fff0"
        },
        {
          "id": "27UG2.2",
          "bez": "Raum 2.2",
          "qm": 16.5,
          "preis": null,
          "farbe": "#e0fff0"
        }
      ],
      "farbe": "#e0fff0"
    },
    {
      "id": "27UG3",
      "marke": "27UG3.1 bis 3.3",
      "gebaeude": "gebaeude27",
      "geschoss": "UG",
      "bezeichnung": "Raum 3.1 bis 3.3",
      "flaeche": 104.96,
      "nutzung": "Lager, Gewerbe",
      "status": "vermietet",
      "frei_ab": null,
      "preis_min": null,
      "preis_max": null,
      "fixmiete": null,
      "nebenkosten": "exkl.",
      "teilbar": false,
      "hinweis": null,
      "raeume": [
        {
          "id": "27UG3.2",
          "bez": "Raum 3.2",
          "qm": 54.24,
          "preis": null,
          "farbe": "#e0e0ff"
        },
        {
          "id": "27UG3.1",
          "bez": "Raum 3.1",
          "qm": 32.25,
          "preis": null,
          "farbe": "#e0e0ff"
        },
        {
          "id": "27UG3.3",
          "bez": "Raum 3.3",
          "qm": 18.47,
          "preis": null,
          "farbe": "#e0e0ff"
        }
      ],
      "farbe": "#e0e0ff"
    },
    {
      "id": "ROEG1",
      "marke": "ROEG1",
      "gebaeude": "roko",
      "geschoss": "EG",
      "bezeichnung": "ROKO-Halle",
      "flaeche": 630.69,
      "nutzung": "Produktion, Lager",
      "status": "frei",
      "frei_ab": null,
      "preis_min": 95,
      "preis_max": 95,
      "fixmiete": null,
      "nebenkosten": "exkl.",
      "teilbar": false,
      "hinweis": "Die Toilette gehört zur Mietfläche.",
      "raeume": [
        {
          "id": "ROEG1",
          "bez": "Hauptfläche",
          "qm": 623.4,
          "preis": 95,
          "farbe": "#fff0e0"
        },
        {
          "id": null,
          "bez": "WC",
          "qm": 7.29,
          "preis": null,
          "farbe": null
        }
      ],
      "farbe": "#fff0e0"
    },
    {
      "id": "ROUG",
      "marke": "ROUG1 bis 2",
      "gebaeude": "roko",
      "geschoss": "UG",
      "bezeichnung": "Werkstatt",
      "flaeche": 129.68,
      "nutzung": "Werkstatt",
      "status": "vermietet",
      "frei_ab": null,
      "preis_min": null,
      "preis_max": null,
      "fixmiete": null,
      "nebenkosten": "inkl.",
      "teilbar": false,
      "hinweis": null,
      "raeume": [
        {
          "id": "ROUG2",
          "bez": "Werkstatt Teil 2",
          "qm": 78.07,
          "preis": null,
          "farbe": "#fff0e0"
        },
        {
          "id": "ROUG1",
          "bez": "Werkstatt Teil 1",
          "qm": 51.61,
          "preis": null,
          "farbe": "#fff0e0"
        }
      ],
      "farbe": "#fff0e0"
    },
    {
      "id": "SCHEG1",
      "marke": "SCHEG1",
      "gebaeude": "schopf",
      "geschoss": "EG",
      "bezeichnung": "Schopf, Halle",
      "flaeche": 364.23,
      "nutzung": "Lagerfläche",
      "status": "vermietet",
      "frei_ab": null,
      "preis_min": null,
      "preis_max": null,
      "fixmiete": null,
      "nebenkosten": "exkl.",
      "teilbar": false,
      "hinweis": null,
      "raeume": [
        {
          "id": "SCHEG1",
          "bez": "Halle",
          "qm": 364.23,
          "preis": null,
          "farbe": "#fff0e0"
        }
      ],
      "farbe": "#fff0e0"
    }
  ]
};
