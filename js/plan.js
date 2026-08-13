/* =====================================================================
   Vermietungsseite: Flächenliste, Grundrisse, Anfrage
   ---------------------------------------------------------------------
   Zwei Teile, in derselben Reihenfolge wie auf der Seite:

   1. Die Grundrisse sind Bilder der Originalpläne, nicht anklickbar.
      Die Pillen darüber sind die einzige Bedienung der Seite.
   2. Die Flächenliste steht offen darunter, nicht in einem Dialog. Sie
      zeigt genau den gewählten Gebäudeteil, gegliedert nach Geschoss.
      Vermietete Flächen lassen sich über ein Häkchen dazuschalten.

   Wer eine Fläche im Plan sieht, findet sie über ihre Nummer in der Liste
   wieder. Plan und Liste tragen dieselben Kennungen.

   Datenquelle ist WEBEREI_DATEN aus data/flaechen.js, erzeugt aus
   data/flaechen.json durch den Admin-Bereich.

   Begriffe:
   Einheit   was am Stück vermietet wird.
   Raum      ein einzelner Raum darin. Ob die Räume auch einzeln zu haben
             sind, sagt das Feld teilbar.
   ===================================================================== */

(function () {
  "use strict";

  if (typeof WEBEREI_DATEN === "undefined") { return; }

  const GEBAEUDE = WEBEREI_DATEN.gebaeude || [];
  const EINHEITEN = WEBEREI_DATEN.einheiten || [];

  const STATUS_TEXT = {
    frei: "frei",
    bald: "wird frei",
    vermietet: "vermietet"
  };
  const STATUS_RANG = { frei: 0, bald: 1, vermietet: 2 };
  const GESCHOSS_TEXT = { EG: "Erdgeschoss", UG: "Untergeschoss" };

  /* --- Hilfsfunktionen ---------------------------------------------- */

  function zahl(wert, dezimal) {
    const gerundet = dezimal ? Math.round(wert * 10) / 10 : Math.round(wert);
    const teile = String(gerundet).split(".");
    teile[0] = teile[0].replace(/\B(?=(\d{3})+(?!\d))/g, "’");
    return teile.join(".");
  }

  function flaecheText(qm) {
    return zahl(qm, qm < 100) + " m²";
  }

  /* Mietzins in zwei Zeilen: der Betrag, darunter die Bezugsgrösse.
     Drei Fälle: fester Monatszins, Preisspanne je m² und Jahr, oder
     nichts Hinterlegtes. Bei vermieteten Flächen gibt es null, dann
     entfällt die Zeile ganz. Ihre Mietzinse sind vertraulich, und das
     Statusabzeichen sagt bereits, dass nichts zu holen ist. */
  function preisInfo(e) {
    if (e.status === "vermietet") { return null; }
    const nk = e.nebenkosten === "inkl." ? "inkl. Nebenkosten" : "exkl. Nebenkosten";
    if (e.fixmiete) {
      return { betrag: "CHF " + zahl(e.fixmiete) + ".–", bezug: "je Monat, " + nk };
    }
    if (e.preis_min && e.preis_max && e.preis_max > e.preis_min) {
      return {
        betrag: "CHF " + zahl(e.preis_min) + " bis " + zahl(e.preis_max),
        bezug: "je m² und Jahr, " + nk
      };
    }
    const einzeln = e.preis_min || e.preis_max;
    if (einzeln) {
      return { betrag: "CHF " + zahl(einzeln) + ".–", bezug: "je m² und Jahr, " + nk };
    }
    return { betrag: "auf Anfrage", bezug: "" };
  }

  function datumText(iso) {
    if (!iso) { return null; }
    const t = String(iso).split("-");
    if (t.length !== 3) { return iso; }
    return t[2].replace(/^0/, "") + "." + t[1].replace(/^0/, "") + "." + t[0];
  }

  function statusText(e) {
    const ab = datumText(e.frei_ab);
    return (e.status === "bald" && ab) ? "frei ab " + ab : STATUS_TEXT[e.status];
  }

  function gebaeudeVon(id) {
    return GEBAEUDE.filter(function (g) { return g.id === id; })[0] || null;
  }

  function gebaeudeName(id) {
    const g = gebaeudeVon(id);
    return g ? g.name : id;
  }

  function element(tag, klasse, text) {
    const el = document.createElement(tag);
    if (klasse) { el.className = klasse; }
    if (text !== undefined) { el.textContent = text; }
    return el;
  }

  function istVerfuegbar(e) {
    return e.status === "frei" || e.status === "bald";
  }

  function summe(liste) {
    return liste.reduce(function (s, e) { return s + e.flaeche; }, 0);
  }

  const VERFUEGBAR = EINHEITEN.filter(istVerfuegbar);

  /* --- Kennzahlen ---------------------------------------------------- */

  (function kennzahlen() {
    const werte = {
      "frei-flaeche": zahl(summe(VERFUEGBAR)),
      "frei-anzahl": String(VERFUEGBAR.length),
      "gebaeude": String(GEBAEUDE.length)
    };
    Object.keys(werte).forEach(function (name) {
      const el = document.querySelector('[data-kpi="' + name + '"]');
      if (el) { el.textContent = werte[name]; }
    });

    /* Der tiefste Quadratmeterpreis unter den verfügbaren Flächen. Das «ab»
       gehört vor die Zahl, sonst liest man sie als festen Betrag. Es steht
       kleiner davor, damit die Zahl die Kachel weiterhin trägt.
       Einheiten mit festem Monatszins bleiben aussen vor, ihre Beträge
       enthalten Nebenkosten und sind je m² nicht vergleichbar. */
    const kachel = document.querySelector('[data-kpi="ab-preis"]');
    if (kachel) {
      const preise = VERFUEGBAR
        .map(function (e) { return e.preis_min; })
        .filter(function (p) { return p > 0; });
      kachel.textContent = "";
      if (preise.length) {
        kachel.appendChild(element("span", "fact__vor", "ab"));
        kachel.appendChild(document.createTextNode(zahl(Math.min.apply(null, preise)) + ".–"));
      } else {
        kachel.textContent = "auf Anfrage";
      }
    }
  })();

  /* =====================================================================
     Grundrisse
     ---------------------------------------------------------------------
     Die Pillen hier oben steuern beides: den gezeigten Grundriss und die
     Flächenliste darunter. Es gibt bewusst nur diese eine Bedienung, damit
     Plan und Liste nie auseinanderlaufen.
     ===================================================================== */

  const gebaeudePillen = document.querySelector("[data-gebaeude-pillen]");
  const geschossPillen = document.querySelector("[data-geschoss-pillen]");
  const planBild = document.querySelector("[data-plan-bild]");
  const planLink = document.querySelector("[data-plan-link]");
  const planInfo = document.querySelector("[data-plan-info]");

  let aktuellesGebaeude = GEBAEUDE.length ? GEBAEUDE[0].id : null;
  let aktuellesGeschoss = null;

  function imGebaeude(id, geschoss) {
    return EINHEITEN.filter(function (e) {
      return e.gebaeude === id && (!geschoss || e.geschoss === geschoss);
    });
  }

  /* Farbe des Punkts auf der Pille: grün wenn etwas frei ist, gelb wenn
     etwas demnächst frei wird, rot wenn alles vermietet ist. */
  function zustand(einheiten) {
    if (einheiten.some(function (e) { return e.status === "frei"; })) { return "frei"; }
    if (einheiten.some(function (e) { return e.status === "bald"; })) { return "bald"; }
    return "vermietet";
  }

  function bauePlanPillen() {
    if (!gebaeudePillen) { return; }
    gebaeudePillen.innerHTML = "";
    GEBAEUDE.forEach(function (g) {
      const eigene = imGebaeude(g.id);
      const frei = eigene.filter(istVerfuegbar);
      const knopf = element("button", "pille");
      knopf.type = "button";
      knopf.setAttribute("data-gebaeude", g.id);
      knopf.setAttribute("data-zustand", zustand(eigene));
      knopf.appendChild(element("span", "pille__punkt"));
      knopf.appendChild(element("span", "pille__name", g.name));
      knopf.appendChild(element("span", "pille__info",
        frei.length ? flaecheText(summe(frei)) + " frei" : "vermietet"));
      knopf.addEventListener("click", function () { waehleGebaeude(g.id); });
      gebaeudePillen.appendChild(knopf);
    });
  }

  function baueGeschossPillen() {
    if (!geschossPillen) { return; }
    const g = gebaeudeVon(aktuellesGebaeude);
    geschossPillen.innerHTML = "";
    if (!g || !g.geschosse || g.geschosse.length < 2) {
      geschossPillen.hidden = true;
      return;
    }
    geschossPillen.hidden = false;
    g.geschosse.forEach(function (gs) {
      const knopf = element("button", "pille pille--klein");
      knopf.type = "button";
      knopf.setAttribute("data-geschoss", gs);
      knopf.setAttribute("data-zustand", zustand(imGebaeude(aktuellesGebaeude, gs)));
      knopf.appendChild(element("span", "pille__punkt"));
      knopf.appendChild(element("span", "pille__name", GESCHOSS_TEXT[gs] || gs));
      knopf.addEventListener("click", function () { waehleGeschoss(gs); });
      geschossPillen.appendChild(knopf);
    });
  }

  function zeigePlan() {
    const g = gebaeudeVon(aktuellesGebaeude);
    if (!g || !planBild) { return; }
    const pfad = (g.plaene || {})[aktuellesGeschoss];
    if (pfad) {
      planBild.src = pfad;
      planBild.alt = "Grundriss " + g.name + ", " +
                     (GESCHOSS_TEXT[aktuellesGeschoss] || aktuellesGeschoss);
      if (planLink) { planLink.href = pfad; }
    }

    if (planInfo) {
      const eigene = imGebaeude(aktuellesGebaeude, aktuellesGeschoss);
      const frei = eigene.filter(istVerfuegbar);
      const satz = frei.length
        ? "In diesem Geschoss " + (frei.length === 1
            ? "ist eine Fläche"
            : "sind " + frei.length + " Flächen") +
          " verfügbar, zusammen " + flaecheText(summe(frei)) + "."
        : "In diesem Geschoss ist derzeit nichts verfügbar.";
      planInfo.textContent = g.beschreibung + " " + satz;
    }

    document.querySelectorAll("[data-gebaeude]").forEach(function (k) {
      const aktiv = k.getAttribute("data-gebaeude") === aktuellesGebaeude;
      k.classList.toggle("is-aktiv", aktiv);
      k.setAttribute("aria-pressed", aktiv ? "true" : "false");
    });
    document.querySelectorAll("[data-geschoss]").forEach(function (k) {
      const aktiv = k.getAttribute("data-geschoss") === aktuellesGeschoss;
      k.classList.toggle("is-aktiv", aktiv);
      k.setAttribute("aria-pressed", aktiv ? "true" : "false");
    });
  }

  function waehleGebaeude(id) {
    aktuellesGebaeude = id;
    const g = gebaeudeVon(id);
    aktuellesGeschoss = g && g.geschosse && g.geschosse.length ? g.geschosse[0] : null;
    baueGeschossPillen();
    zeigePlan();
    baueListe();
  }

  function waehleGeschoss(gs) {
    aktuellesGeschoss = gs;
    zeigePlan();
    baueListe();
  }

  /* =====================================================================
     Flächenliste
     ---------------------------------------------------------------------
     Zeigt genau den Gebäudeteil, dessen Grundriss oben steht, gegliedert
     nach Geschoss. Das Geschoss des gezeigten Blattes steht zuoberst, das
     andere folgt darunter, damit nichts übersehen wird.
     ===================================================================== */

  const listeInhalt = document.querySelector("[data-liste-inhalt]");
  const listeTitel = document.querySelector("[data-liste-titel]");
  const listeUnter = document.querySelector("[data-liste-unter]");
  const schalterAlle = document.querySelector("[data-alle-zeigen]");

  let zeigeVermietete = false;

  function baueKarte(e) {
    const karte = element("article", "fkarte");
    karte.setAttribute("data-status", e.status);

    /* Kopf: Nummer wie im Plan, Bezeichnung, Ort im Areal, Status.
       Die Nummer ist der Ankerpunkt zwischen Grundriss und Liste, sie steht
       auf den Plänen bei jeder Fläche. */
    const kopf = element("header", "fkarte__kopf");
    const titelblock = element("div");
    titelblock.appendChild(element("span", "fkarte__nr", e.id));
    titelblock.appendChild(element("h3", "fkarte__titel", e.bezeichnung));
    kopf.appendChild(titelblock);
    kopf.appendChild(element("span", "status-badge status-badge--" + e.status, statusText(e)));
    karte.appendChild(kopf);

    /* Zahlen: Fläche, Mietzins, Nutzung */
    const daten = element("dl", "fkarte__daten");

    function eintrag(bezeichner, wert, klein, wertKlasse) {
      const block = element("div");
      block.appendChild(element("dt", null, bezeichner));
      const dd = element("dd", wertKlasse || null);
      dd.appendChild(element("span", "fkarte__wert", wert));
      if (klein) { dd.appendChild(element("span", "fkarte__bezug", klein)); }
      block.appendChild(dd);
      daten.appendChild(block);
    }

    /* Nur Zeilen mit Inhalt. Ein Platzhalterstrich sagt nichts und wäre
       obendrein ein Gedankenstrich, den die Stilregeln ausschliessen. */
    const preis = preisInfo(e);
    eintrag("Fläche", flaecheText(e.flaeche), null, "fkarte__flaeche");
    if (preis) { eintrag("Mietzins", preis.betrag, preis.bezug); }
    if (e.nutzung) { eintrag("Nutzung", e.nutzung); }
    karte.appendChild(daten);

    if (e.hinweis) {
      karte.appendChild(element("p", "fkarte__hinweis", e.hinweis));
    }

    /* Räume der Einheit, aufklappbar. Ob sie einzeln zu haben sind,
       steht im Feld teilbar und wird hier ausdrücklich benannt. */
    if (e.raeume && e.raeume.length > 1) {
      const klapp = element("details", "fkarte__raeume");
      const zusatz = e.status === "vermietet"
        ? ""
        : ", " + (e.teilbar ? "einzeln mietbar" : "nur zusammen mietbar");
      klapp.appendChild(element("summary", null, e.raeume.length + " Räume" + zusatz));
      const liste = element("ul");
      e.raeume.forEach(function (r) {
        const li = element("li");
        li.appendChild(element("span", null, r.bez));
        li.appendChild(element("span", "fkarte__raumqm", flaecheText(r.qm)));
        liste.appendChild(li);
      });
      klapp.appendChild(liste);
      karte.appendChild(klapp);
    }

    if (e.status !== "vermietet") {
      const fuss = element("div", "fkarte__fuss");
      const knopf = element("button", "btn btn--klein");
      knopf.type = "button";
      knopf.textContent = "Diese Fläche anfragen";
      knopf.addEventListener("click", function () { frageAn(e); });
      fuss.appendChild(knopf);
      karte.appendChild(fuss);
    }

    return karte;
  }

  function nachStatusUndGroesse(a, b) {
    if (STATUS_RANG[a.status] !== STATUS_RANG[b.status]) {
      return STATUS_RANG[a.status] - STATUS_RANG[b.status];
    }
    return b.flaeche - a.flaeche;
  }

  function baueListe() {
    if (!listeInhalt) { return; }
    const g = gebaeudeVon(aktuellesGebaeude);
    if (!g) { return; }

    /* Das gezeigte Geschoss zuerst, das übrige danach */
    const geschosse = (g.geschosse || []).slice().sort(function (a, b) {
      return (a === aktuellesGeschoss ? 0 : 1) - (b === aktuellesGeschoss ? 0 : 1);
    });

    listeInhalt.innerHTML = "";
    let gezeigt = 0;
    geschosse.forEach(function (gs) {
      const eigene = imGebaeude(aktuellesGebaeude, gs)
        .filter(function (e) { return zeigeVermietete || istVerfuegbar(e); })
        .sort(nachStatusUndGroesse);
      if (!eigene.length) { return; }

      const titel = element("h3", "liste-geschoss");
      titel.appendChild(element("span", "liste-geschoss__name", GESCHOSS_TEXT[gs] || gs));
      titel.appendChild(element("span", "liste-geschoss__zahl",
        eigene.length + (eigene.length === 1 ? " Fläche" : " Flächen")));
      listeInhalt.appendChild(titel);

      eigene.forEach(function (e) { listeInhalt.appendChild(baueKarte(e)); });
      gezeigt += eigene.length;
    });

    if (!gezeigt) {
      listeInhalt.appendChild(element("p", "liste-leer",
        "In diesem Gebäudeteil ist derzeit nichts verfügbar. Schalten Sie die "
        + "vermieteten Flächen dazu, um den Bestand zu sehen."));
    }

    if (listeTitel) { listeTitel.textContent = "Flächen, " + g.name; }
    if (listeUnter) {
      const alle = imGebaeude(aktuellesGebaeude);
      const frei = alle.filter(istVerfuegbar);
      listeUnter.textContent = frei.length
        ? (frei.length === 1 ? "Eine Fläche" : frei.length + " Flächen")
          + " verfügbar, zusammen " + flaecheText(summe(frei))
          + ". Der Gebäudeteil umfasst " + alle.length + " Mieteinheiten mit "
          + flaecheText(summe(alle)) + "."
        : "In diesem Gebäudeteil ist derzeit nichts verfügbar, er umfasst "
          + alle.length + " Mieteinheiten mit " + flaecheText(summe(alle)) + ".";
    }
  }

  if (schalterAlle) {
    schalterAlle.addEventListener("change", function () {
      zeigeVermietete = schalterAlle.checked;
      baueListe();
    });
  }

  bauePlanPillen();
  if (aktuellesGebaeude) { waehleGebaeude(aktuellesGebaeude); }

  function scrolleZu(ziel) {
    if (!ziel) { return; }
    const kopf = document.querySelector(".site-header");
    const abstand = (kopf ? kopf.offsetHeight : 0) + 16;
    window.scrollTo({
      top: Math.max(0, ziel.getBoundingClientRect().top + window.pageYOffset - abstand),
      behavior: "smooth"
    });
  }

  /* =====================================================================
     Anfrage
     ===================================================================== */

  const formular = document.querySelector(".anfrage-form");
  const auswahl = document.querySelector("[data-formular-flaeche]");
  const meldung = document.querySelector("[data-meldung]");

  if (auswahl) {
    GEBAEUDE.forEach(function (g) {
      const passende = VERFUEGBAR.filter(function (e) { return e.gebaeude === g.id; });
      if (!passende.length) { return; }
      const gruppe = document.createElement("optgroup");
      gruppe.label = g.name;
      passende.forEach(function (e) {
        const opt = document.createElement("option");
        opt.value = e.id;
        opt.textContent = e.bezeichnung + ", " + (GESCHOSS_TEXT[e.geschoss] || e.geschoss) +
                          ", " + flaecheText(e.flaeche);
        gruppe.appendChild(opt);
      });
      auswahl.appendChild(gruppe);
    });
  }

  function frageAn(einheit) {
    if (auswahl) { auswahl.value = einheit.id; }
    const text = document.getElementById("f-text");
    if (text && !text.value.trim()) {
      text.value = "Guten Tag\n\nIch interessiere mich für die Fläche " +
        einheit.bezeichnung + " (" + gebaeudeName(einheit.gebaeude) + ", " +
        (GESCHOSS_TEXT[einheit.geschoss] || einheit.geschoss) + ", " +
        flaecheText(einheit.flaeche) + ") und bitte um weitere Angaben.\n\n" +
        "Freundliche Grüsse\n";
    }
    scrolleZu(document.getElementById("anfrage"));
    const name = document.getElementById("f-name");
    if (name) { setTimeout(function () { name.focus({ preventScroll: true }); }, 600); }
  }

  if (formular) {
    formular.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!formular.reportValidity()) { return; }

      const knopf = formular.querySelector('button[type="submit"]');
      const beschriftung = knopf ? knopf.querySelector(".btn__label") : null;
      const vorher = beschriftung ? beschriftung.textContent : "";

      if (knopf) { knopf.disabled = true; }
      if (beschriftung) { beschriftung.textContent = "Wird gesendet"; }
      zeigeMeldung("", "");

      fetch(formular.action, { method: "POST", body: new FormData(formular) })
        .then(function (r) { return r.json().catch(function () { return { ok: r.ok }; }); })
        .then(function (antwort) {
          if (antwort && antwort.ok) {
            formular.reset();
            zeigeMeldung(
              "Vielen Dank, Ihre Anfrage ist eingegangen. Wir melden uns in den nächsten Tagen bei Ihnen.",
              "gut");
          } else {
            zeigeMeldung(
              (antwort && antwort.fehler) ||
              "Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.",
              "schlecht");
          }
        })
        .catch(function () {
          zeigeMeldung(
            "Die Anfrage konnte nicht gesendet werden. Bitte schreiben Sie uns direkt per E-Mail.",
            "schlecht");
        })
        .finally(function () {
          if (knopf) { knopf.disabled = false; }
          if (beschriftung) { beschriftung.textContent = vorher; }
        });
    });
  }

  function zeigeMeldung(text, art) {
    if (!meldung) { return; }
    meldung.textContent = text;
    meldung.className = "form-meldung" + (art ? " form-meldung--" + art : "");
  }
})();
