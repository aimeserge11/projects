/* =========================================================
   BSG Ltd event registration | KWIZERA Aime Serge
   Validates the form and shows a confirmation.

   TO RECEIVE REAL REGISTRATIONS:
   A page made only of HTML/CSS/JS cannot store data by itself.
   Create a free form endpoint (for example at formspree.io, or
   a Google Apps Script web app), paste its URL below, and every
   registration will be sent there. While it is empty, the form
   runs in demo mode: it checks the details and shows the
   confirmation, but nothing is stored.
   ========================================================= */

(function () {
  "use strict";

  var FORM_ENDPOINT = ""; // e.g. "https://formspree.io/f/xxxxxxxx"

  var form = document.getElementById("regForm");
  var successBox = document.getElementById("success");
  var summaryEl = document.getElementById("summary");
  var demoNote = document.getElementById("demoNote");
  var statusEl = document.getElementById("formStatus");
  var submitBtn = document.getElementById("submitBtn");
  var againBtn = document.getElementById("againBtn");

  /* ---------- Validation rules ---------- */
  var rules = [
    {
      id: "fullName", errorId: "fullNameError",
      check: function (v) { return v.trim().length >= 2 ? "" : "Enter your full name."; }
    },
    {
      id: "email", errorId: "emailError",
      check: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Enter a valid email address.";
      }
    },
    {
      id: "phone", errorId: "phoneError",
      check: function (v) {
        var value = v.trim();
        var digits = value.replace(/\D/g, "");
        if (!value) return "Enter your phone number.";
        if (!/^[+()\d\s-]+$/.test(value) || digits.length < 9 || digits.length > 15) {
          return "Enter a valid phone number.";
        }
        return "";
      }
    },
    {
      id: "attendees", errorId: "attendeesError",
      check: function (v) {
        var n = Number(v);
        return Number.isInteger(n) && n >= 1 && n <= 10 ? "" : "Enter a number from 1 to 10.";
      }
    }
  ];

  function setError(input, errorEl, message) {
    errorEl.textContent = message;
    if (message) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
  }

  function validateAll() {
    var firstInvalid = null;

    rules.forEach(function (rule) {
      var input = document.getElementById(rule.id);
      var message = rule.check(input.value);
      setError(input, document.getElementById(rule.errorId), message);
      if (message && !firstInvalid) firstInvalid = input;
    });

    var consent = document.getElementById("consent");
    var consentError = document.getElementById("consentError");
    var consentMessage = consent.checked ? "" : "Please tick the box to continue.";
    consentError.textContent = consentMessage;
    if (consentMessage && !firstInvalid) firstInvalid = consent;

    return firstInvalid;
  }

  // Clear an error as soon as the visitor fixes the field
  rules.forEach(function (rule) {
    var input = document.getElementById(rule.id);
    input.addEventListener("input", function () {
      if (!rule.check(input.value)) setError(input, document.getElementById(rule.errorId), "");
    });
  });
  document.getElementById("consent").addEventListener("change", function (e) {
    if (e.target.checked) document.getElementById("consentError").textContent = "";
  });

  /* ---------- Confirmation ---------- */
  function addSummaryRow(label, value) {
    var row = document.createElement("div");
    var dt = document.createElement("dt");
    var dd = document.createElement("dd");
    dt.textContent = label;
    dd.textContent = value;
    row.appendChild(dt);
    row.appendChild(dd);
    summaryEl.appendChild(row);
  }

  function showSuccess(data, isDemo) {
    summaryEl.textContent = "";
    addSummaryRow("Name", data.fullName);
    addSummaryRow("Email", data.email);
    addSummaryRow("Phone", data.phone);
    addSummaryRow("Attendees", String(data.attendees));
    if (data.organisation) addSummaryRow("Organisation", data.organisation);

    demoNote.hidden = !isDemo;
    form.hidden = true;
    successBox.hidden = false;
    successBox.focus();
  }

  /* ---------- Submit ---------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    statusEl.textContent = "";

    var firstInvalid = validateAll();
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    var data = {
      fullName: document.getElementById("fullName").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      attendees: Number(document.getElementById("attendees").value),
      organisation: document.getElementById("organisation").value.trim(),
      notes: document.getElementById("notes").value.trim()
    };

    // Demo mode: no server connected yet
    if (!FORM_ENDPOINT) {
      showSuccess(data, true);
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(data)
    })
      .then(function (response) {
        if (!response.ok) throw new Error("Request failed");
        showSuccess(data, false);
      })
      .catch(function () {
        statusEl.textContent = "Sorry, your registration could not be sent. Check your connection and try again.";
      })
      .then(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = "Register";
      });
  });

  /* ---------- Register another person ---------- */
  againBtn.addEventListener("click", function () {
    form.reset();
    document.getElementById("attendees").value = 1;
    successBox.hidden = true;
    form.hidden = false;
    document.getElementById("fullName").focus();
  });

  /* ---------- Dark / light mode ---------- */
  var root = document.documentElement;
  var themeBtn = document.getElementById("themeToggle");

  function updateThemeLabel() {
    var isDark = root.getAttribute("data-theme") === "dark";
    themeBtn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (err) { /* storage may be blocked */ }
      updateThemeLabel();
    });
    updateThemeLabel();
  }
})();
