/* =====================================================================
   Interaktiver Gebäudeplan (Vermietungsseite)
   - liest die Flächendaten aus data/flaechen.js (Konstante FLAECHEN)
   - setzt den Status (Farbe) auf die Polygone im Plan
   - Erd- und Untergeschoss werden untereinander gezeigt (kein Umschalter)
   - öffnet beim Klick das Detail-Panel und baut den Mailto-Link
   - bei vermieteten Flächen ist der Anfrage-Button ausgegraut
   ===================================================================== */

(function () {
  "use strict";

  /* Daten als Nachschlagetabelle nach Flächennummer */
  const byNr = {};
  FLAECHEN.forEach(function (f) { byNr[f.nr] = f; });

  const KONTAKT_MAIL = "vermietung@weberei-russikon.ch"; /* Platzhalter, später ersetzen */

  const planRoot = document.querySelector(".plan-area");
  const panel = document.getElementById("detailPanel");
  if (!planRoot || !panel) { return; }

  const flaechen = Array.prototype.slice.call(planRoot.querySelectorAll(".flaeche"));

  /* --- Plan vorbereiten: Status und Flächenangabe setzen ------------ */
  flaechen.forEach(function (el) {
    const nr = el.getAttribute("data-nr");
    const data = byNr[nr];
    if (!data) { return; }

    el.setAttribute("data-status", data.status);
    el.setAttribute("tabindex", "0");
    el.setAttribute("role", "button");
    el.setAttribute("aria-label",
      "Fläche " + nr + ", " + data.name + ", " + STATUS_LABELS[data.status]);

    const areaText = el.querySelector(".flaeche__area");
    if (areaText) { areaText.textContent = data.flaeche + " m2"; }
  });

  /* --- Detail-Panel -------------------------------------------------- */
  function setField(field, value) {
    const node = panel.querySelector('[data-field="' + field + '"]');
    if (node) { node.textContent = value; }
  }

  function selectFlaeche(el) {
    const data = byNr[el.getAttribute("data-nr")];
    if (!data) { return; }

    flaechen.forEach(function (f) { f.classList.remove("is-active"); });
    el.classList.add("is-active");

    setField("nr", "Fläche " + data.nr);
    setField("name", data.name);
    setField("flaeche", data.flaeche + " m2");
    setField("geschoss", data.geschoss === "EG" ? "Erdgeschoss" : "Untergeschoss");
    setField("nutzung", data.nutzung);
    setField("gebaeude", data.gebaeude);
    setField("beschreibung", data.beschreibung);

    /* Statusabzeichen */
    const badge = panel.querySelector('[data-field="status"]');
    if (badge) {
      badge.textContent = STATUS_LABELS[data.status];
      badge.className = "status-badge status-badge--" + data.status;
    }

    /* Anfrage-Button: bei vermieteten Flächen ausgegraut und inaktiv */
    const mailBtn = panel.querySelector('[data-field="mailto"]');
    if (mailBtn) {
      if (data.status === "vermietet") {
        mailBtn.classList.add("is-disabled");
        mailBtn.setAttribute("aria-disabled", "true");
        mailBtn.removeAttribute("href");
        mailBtn.querySelector(".btn__label").textContent = "Bereits vermietet";
      } else {
        mailBtn.classList.remove("is-disabled");
        mailBtn.removeAttribute("aria-disabled");
        mailBtn.querySelector(".btn__label").textContent = "Anfrage senden";

        const geschossLang = data.geschoss === "EG" ? "Erdgeschoss" : "Untergeschoss";
        const subject = "Anfrage Mietfläche " + data.nr + " (" + data.name + ")";
        const body =
          "Guten Tag\n\n" +
          "Ich interessiere mich für die Fläche " + data.nr + " (" + data.name + ", " +
          data.flaeche + " m2, " + geschossLang + ", " + data.gebaeude + ").\n" +
          "Bitte nehmen Sie mit mir Kontakt auf.\n\n" +
          "Freundliche Grüsse\n";
        mailBtn.setAttribute("href",
          "mailto:" + KONTAKT_MAIL +
          "?subject=" + encodeURIComponent(subject) +
          "&body=" + encodeURIComponent(body));
      }
    }

    panel.classList.remove("is-empty");
  }

  /* Klick auf einen ausgegrauten Button unterbinden */
  const mailBtnGlobal = panel.querySelector('[data-field="mailto"]');
  if (mailBtnGlobal) {
    mailBtnGlobal.addEventListener("click", function (e) {
      if (mailBtnGlobal.classList.contains("is-disabled")) { e.preventDefault(); }
    });
  }

  /* Klick und Tastatur auf den Flächen */
  flaechen.forEach(function (el) {
    el.addEventListener("click", function () { selectFlaeche(el); });
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectFlaeche(el);
      }
    });
  });
})();
