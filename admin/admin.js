/* =====================================================================
   Admin-Bereich: kleine Hilfen im Formular
   ---------------------------------------------------------------------
   Bewusst ohne Framework. Alles Wesentliche passiert serverseitig, das
   Formular funktioniert auch ohne dieses Skript. Hier geht es nur um
   Bequemlichkeit: den Farbstreifen der Karte mitführen, damit man beim
   Setzen der Häkchen gleich sieht, was verfügbar ist, und vor dem
   Verlassen mit ungespeicherten Änderungen warnen.
   ===================================================================== */

(function () {
  "use strict";

  const formular = document.getElementById("verwaltung");
  if (!formular) { return; }

  let geaendert = false;

  /* Denselben Schluss ziehen wie der Server: Häkchen aus ist vermietet,
     Häkchen an mit künftigem Datum wird frei, sonst frei. */
  function statusDerKarte(karte) {
    const haken = karte.querySelector("[data-verfuegbar]");
    if (!haken || !haken.checked) { return "vermietet"; }
    const datum = karte.querySelector('input[type="date"]');
    const heute = new Date().toISOString().slice(0, 10);
    return (datum && datum.value && datum.value > heute) ? "bald" : "frei";
  }

  function fuehreNach(karte) {
    if (karte) { karte.setAttribute("data-status", statusDerKarte(karte)); }
  }

  formular.addEventListener("change", function (e) {
    const karte = e.target.closest(".karte");
    if (!karte) { return; }
    if (e.target.matches("[data-verfuegbar]") || e.target.type === "date") {
      fuehreNach(karte);
    }
  });

  /* --- Warnung bei ungespeicherten Änderungen ----------------------- */
  formular.addEventListener("input", function () { geaendert = true; });
  formular.addEventListener("change", function () { geaendert = true; });
  formular.addEventListener("submit", function () { geaendert = false; });

  window.addEventListener("beforeunload", function (e) {
    if (!geaendert) { return; }
    e.preventDefault();
    e.returnValue = "";
  });
})();
