// Bandeau de consentement cookies (RGPD) + chargement conditionnel de Google Analytics (GA4)
(function () {
  var GA_MEASUREMENT_ID = "G-N2V2KVGHYE";
  var STORAGE_KEY = "mv_cookie_consent"; // "accepted" | "declined"

  function loadGA() {
    if (window.__gaLoaded) return;
    window.__gaLoaded = true;

    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_MEASUREMENT_ID;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA_MEASUREMENT_ID);
  }

  function getConsent() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function setConsent(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {}
  }

  function showBanner() {
    var banner = document.createElement("div");
    banner.id = "cookie-consent-banner";
    banner.innerHTML =
      '<div class="cookie-consent-inner">' +
      '<p class="cookie-consent-text">Nous utilisons des cookies pour analyser le trafic de ce site (Google Analytics). Vous pouvez accepter ou refuser ce suivi. ' +
      '<a href="politique-confidentialite.html">En savoir plus</a>.</p>' +
      '<div class="cookie-consent-actions">' +
      '<button type="button" id="cookie-decline" class="cookie-btn cookie-btn-secondary">Refuser</button>' +
      '<button type="button" id="cookie-accept" class="cookie-btn cookie-btn-primary">Accepter</button>' +
      "</div>" +
      "</div>";
    document.body.appendChild(banner);

    document.getElementById("cookie-accept").addEventListener("click", function () {
      setConsent("accepted");
      banner.remove();
      loadGA();
    });
    document.getElementById("cookie-decline").addEventListener("click", function () {
      setConsent("declined");
      banner.remove();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var consent = getConsent();
    if (consent === "accepted") {
      loadGA();
    } else if (consent !== "declined") {
      showBanner();
    }
  });
})();
