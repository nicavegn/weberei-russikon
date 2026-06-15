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
})();
