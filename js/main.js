/* =====================================================================
   Gemeinsame Skripte fuer alle Seiten
   - Mobile-Navigation (Menue auf, zu)
   - sanftes Einblenden beim Scrollen (Reveal)
   - Jahreszahl in der Fusszeile
   ===================================================================== */

(function () {
  "use strict";

  /* --- Mobile-Navigation -------------------------------------------- */
  const toggle = document.querySelector(".nav__toggle");
  const links = document.querySelector(".nav__links");

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      const open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    /* Menue nach Klick auf einen Link wieder schliessen */
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* --- Scroll-Reveal ------------------------------------------------- */
  const revealEls = document.querySelectorAll(".reveal");

  if (revealEls.length) {
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );
      revealEls.forEach(function (el) { observer.observe(el); });
    } else {
      /* Fallback: ohne Observer alles direkt zeigen */
      revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    }
  }

  /* --- Jahreszahl in der Fusszeile ----------------------------------- */
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* --- Verfügbare Fläche in der Kennzahlenleiste ---------------------- */
  /* Die Startseite nennt dieselbe Zahl wie die Vermietungsseite. Sie wird
     hier aus den Daten gerechnet, damit sie nicht veraltet, sobald im
     Admin ein Status wechselt. Im HTML steht ein Näherungswert als
     Rückfall für den Fall, dass kein JavaScript läuft.
     Auf der Vermietungsseite setzt plan.js danach denselben Wert, das
     stört nicht. Seiten ohne Flächendaten überspringen den Block. */
  const flaecheEl = document.querySelector('[data-kpi="frei-flaeche"]');
  if (flaecheEl && typeof WEBEREI_DATEN !== "undefined") {
    const verfuegbar = (WEBEREI_DATEN.einheiten || []).filter(function (e) {
      return e.status === "frei" || e.status === "bald";
    });
    const qm = Math.round(verfuegbar.reduce(function (s, e) { return s + e.flaeche; }, 0));
    flaecheEl.textContent = String(qm).replace(/\B(?=(\d{3})+(?!\d))/g, "’");
  }
})();
