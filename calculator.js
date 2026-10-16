/* =========================================================
   Calculator | KWIZERA Aime Serge
   Fixes compared with the original file:
   - Enter on the theme button no longer triggers "="
   - Ctrl / Cmd / Alt shortcuts (copy, refresh...) are not captured
   - Backspace on a negative number (-5) no longer leaves a lone "-"
   - Huge results show an error instead of "Infinity"
   - % works like a phone calculator: 200 + 10 % = 220
   - Long numbers scroll so the latest digit stays visible
   ========================================================= */

(function () {
  "use strict";

  var displayEl = document.getElementById("display");
  var historyEl = document.getElementById("history");
  var keysEl = document.getElementById("keys");

  var symbols = { "+": "+", "-": "\u2212", "*": "\u00d7", "/": "\u00f7" };
  var current = "0";
  var previous = null;
  var operator = null;
  var justEvaluated = false;
  var hasError = false;

  /* ---------- Show the current state ---------- */
  function render() {
    displayEl.textContent = current;
    displayEl.classList.toggle("error", hasError);
    historyEl.textContent = operator && !hasError ? previous + " " + symbols[operator] : "";
    displayEl.scrollLeft = displayEl.scrollWidth; // keep the latest digit visible
  }

  function showError(message) {
    hasError = true;
    current = message;
    previous = null;
    operator = null;
    justEvaluated = false;
    render();
  }

  function reset() {
    current = "0";
    previous = null;
    operator = null;
    justEvaluated = false;
    hasError = false;
  }

  /* ---------- Maths ---------- */
  // Returns null when the operation is invalid (division by zero)
  function compute(a, b, op) {
    a = parseFloat(a);
    b = parseFloat(b);
    switch (op) {
      case "+": return a + b;
      case "-": return a - b;
      case "*": return a * b;
      case "/": return b === 0 ? null : a / b;
    }
    return b;
  }

  function format(n) {
    return String(parseFloat(n.toPrecision(12)));
  }

  /* ---------- Input ---------- */
  function inputNumber(d) {
    if (hasError) reset();
    if (justEvaluated) { current = "0"; justEvaluated = false; }
    if (current.replace(/[-.]/g, "").length >= 15) return;
    current = current === "0" ? d : current + d;
    render();
  }

  function inputDot() {
    if (hasError) reset();
    if (justEvaluated) { current = "0"; justEvaluated = false; }
    if (current.indexOf(".") === -1) current += ".";
    render();
  }

  function chooseOperator(op) {
    if (hasError) return;
    if (operator && !justEvaluated && previous !== null) {
      if (!evaluate()) return; // stop if the chained operation errored
    }
    previous = current;
    operator = op;
    justEvaluated = true;
    render();
  }

  function evaluate() {
    if (hasError || operator === null) return true;

    var result = compute(previous, current, operator);
    if (result === null) {
      showError("Error: \u00f7 by 0");
      return false;
    }
    if (!isFinite(result)) {
      showError("Error: too large");
      return false;
    }

    current = format(result);
    previous = null;
    operator = null;
    justEvaluated = true;
    render();
    return true;
  }

  function backspace() {
    if (hasError) { reset(); render(); return; }
    if (justEvaluated) return;
    var isSingleDigit = current.length === 1 || (current.length === 2 && current.charAt(0) === "-");
    current = isSingleDigit ? "0" : current.slice(0, -1);
    render();
  }

  function percent() {
    if (hasError) return;
    var value = parseFloat(current);
    if (operator !== null && previous !== null && !justEvaluated) {
      // 200 + 10 % -> 10 % of 200 = 20
      current = format((parseFloat(previous) * value) / 100);
    } else {
      current = format(value / 100);
    }
    render();
  }

  /* ---------- Button clicks ---------- */
  keysEl.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.num !== undefined) inputNumber(b.dataset.num);
    else if (b.dataset.op) chooseOperator(b.dataset.op);
    else if (b.dataset.action === "dot") inputDot();
    else if (b.dataset.action === "equals") evaluate();
    else if (b.dataset.action === "clear") { reset(); render(); }
    else if (b.dataset.action === "back") backspace();
    else if (b.dataset.action === "percent") percent();
  });

  /* ---------- Keyboard support ---------- */
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;      // leave browser shortcuts alone
    if (e.target.closest("a, #themeToggle")) return;     // let links and the theme button work normally

    if (/^[0-9]$/.test(e.key)) inputNumber(e.key);
    else if ("+-*/".indexOf(e.key) !== -1) { e.preventDefault(); chooseOperator(e.key); }
    else if (e.key === ".") inputDot();
    else if (e.key === "Enter" || e.key === "=") { e.preventDefault(); evaluate(); }
    else if (e.key === "Backspace") backspace();
    else if (e.key === "Escape") { reset(); render(); }
    else if (e.key === "%") percent();
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

  render();
})();
