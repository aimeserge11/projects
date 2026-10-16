/* =========================================================
   KWIZERA Aime Serge | Portfolio scripts
   ========================================================= */

(function () {
  "use strict";

  var WHATSAPP_NUMBER = "250781725429"; // +250 781 725 429
  var root = document.documentElement;

  /* ---------- Toast helper ---------- */
  var toast = document.getElementById("toast");
  var toastTimer;
  function showToast(text) {
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 2600);
  }

  /* ---------- Dark / light mode ---------- */
  var themeBtn = document.getElementById("themeToggle");

  function updateThemeLabel() {
    if (!themeBtn) return;
    var isDark = root.getAttribute("data-theme") === "dark";
    themeBtn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) { /* storage may be blocked */ }
      updateThemeLabel();
    });
    updateThemeLabel();
  }

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.getElementById("menuToggle");
  var nav = document.getElementById("nav");

  function setMenu(open) {
    if (!menuBtn || !nav) return;
    nav.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      setMenu(!nav.classList.contains("open"));
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
  }

  /* ---------- Highlight the nav link of the section in view ---------- */
  var navLinks = document.querySelectorAll(".nav-link");
  var sections = ["home", "projects", "skills", "about", "contact"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (section) { observer.observe(section); });
  }

  /* ---------- Project links not ready yet ---------- */
  document.querySelectorAll("[data-soon]").forEach(function (link) {
    if (link.getAttribute("href") === "#") {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        showToast("This link will be added soon.");
      });
    }
  });

  /* ---------- Contact form: validate, then open WhatsApp ---------- */
  var form = document.getElementById("contactForm");

  function setError(input, errorEl, message) {
    errorEl.textContent = message;
    if (message) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
  }

  if (form) {
    var nameInput = document.getElementById("name");
    var messageInput = document.getElementById("message");
    var nameError = document.getElementById("nameError");
    var messageError = document.getElementById("messageError");

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = nameInput.value.trim();
      var message = messageInput.value.trim();
      var valid = true;

      setError(nameInput, nameError, name ? "" : "Enter your name.");
      setError(messageInput, messageError, message ? "" : "Write a short message.");
      if (!name || !message) valid = false;

      if (!valid) {
        (name ? messageInput : nameInput).focus();
        return;
      }

      var text = "Hello Serge, I'm " + name + ". " + message;
      var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text);
      window.open(url, "_blank", "noopener");
      form.reset();
      showToast("Opening WhatsApp...");
    });

    [nameInput, messageInput].forEach(function (input) {
      input.addEventListener("input", function () {
        var errorEl = input === nameInput ? nameError : messageError;
        if (input.value.trim()) setError(input, errorEl, "");
      });
    });
  }

  /* ---------- Footer year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
