/* SRED Financial Inc. — site interactions
   - Mobile nav
   - Sticky-header smooth scroll
   - Scroll progress bar
   - Floating "Book consultation" CTA
   - Scroll reveal (IntersectionObserver)
   - SR&ED refund estimator
   - FAQ filter chips
   - Contact form (Formspree)
   - Footer year
*/
(function () {
  "use strict";

  // -------------------- Year --------------------
  document.querySelectorAll("#year").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // -------------------- Header scroll state --------------------
  var header = document.getElementById("site-header");
  var setScrolled = function () {
    if (!header) return;
    if (window.scrollY > 8) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  };

  // -------------------- Scroll progress bar --------------------
  var progressBar = document.getElementById("scrollProgressBar");
  var setProgress = function () {
    if (!progressBar) return;
    var max = (document.documentElement.scrollHeight - window.innerHeight) || 1;
    var pct = Math.min(100, Math.max(0, (window.scrollY / max) * 100));
    progressBar.style.width = pct + "%";
  };

  // -------------------- Floating CTA --------------------
  var floatCta = document.getElementById("floatCta");
  var hero = document.querySelector(".hero");
  var setFloatCta = function () {
    if (!floatCta) return;
    var threshold = hero ? hero.offsetTop + hero.offsetHeight - 100 : 600;
    var docBottom = document.documentElement.scrollHeight - window.innerHeight - 80;
    if (window.scrollY > threshold && window.scrollY < docBottom) {
      floatCta.classList.add("is-visible");
    } else {
      floatCta.classList.remove("is-visible");
    }
  };

  var onScroll = function () {
    setScrolled();
    setProgress();
    setFloatCta();
  };
  setScrolled();
  setProgress();
  setFloatCta();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", setFloatCta);

  // -------------------- Mobile nav --------------------
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("mobileMenu");

  function closeMenu() {
    if (!menu) return;
    menu.classList.remove("is-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var isOpen = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        closeMenu();
      });
    });

    document.addEventListener("click", function (e) {
      if (!menu.contains(e.target) && !toggle.contains(e.target)) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 880) closeMenu();
    });
  }

  // -------------------- Smooth scroll w/ sticky offset --------------------
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var href = anchor.getAttribute("href");
      if (!href || href === "#" || href.length < 2) return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      var headerH = header ? header.getBoundingClientRect().height : 72;
      var targetTop = target.getBoundingClientRect().top + window.scrollY - headerH - 12;
      window.scrollTo({ top: targetTop, behavior: "smooth" });
      history.replaceState(null, "", href);
    });
  });

  // -------------------- Scroll reveal --------------------
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-in"); });
  }

  // -------------------- SR&ED Estimator --------------------
  // Math:
  //   QE (qualifying expenditures with proxy) = wages * 1.55 + subs (subs not proxy-uplifted)
  //   Federal credit = QE * rate (35% CCPC refundable, 15% other non-refundable)
  //   Industry-fee placeholder: 20% of refund (midpoint of 15-25%)
  //   Our-fee placeholder: 10% of refund (clearly marked as placeholder)
  //   You keep = refund - our fee
  //   Savings = industry fee - our fee
  // These numbers are illustrative and conservative; the page footnote makes the
  // "rate to be confirmed" caveat clear.
  var wagesEl = document.getElementById("wages");
  var subsEl = document.getElementById("subs");
  var refundAmount = document.getElementById("refundAmount");

  if (wagesEl && subsEl && refundAmount) {
    var wagesValueEl = document.getElementById("wagesValue");
    var subsValueEl = document.getElementById("subsValue");
    var qeEl = document.getElementById("qe");
    var rateLblEl = document.getElementById("rateLbl");
    var theirFeeEl = document.getElementById("theirFee");
    var ourFeeEl = document.getElementById("ourFee");
    var youKeepEl = document.getElementById("youKeep");
    var savingsEl = document.getElementById("savings");
    var segmentBtns = document.querySelectorAll(".estimator-segment button");

    var INDUSTRY_RATE = 0.20; // midpoint of 15-25% industry standard
    var OUR_RATE = 0.10;       // placeholder — well below industry standard
    var rate = 0.35;           // CCPC default

    function formatMoney(n) {
      if (n >= 1000000) return "$" + (n / 1000000).toFixed(2).replace(/\.?0+$/, "") + "M";
      // Round to nearest $50 for tidiness
      var rounded = Math.round(n / 50) * 50;
      return "$" + rounded.toLocaleString("en-US");
    }

    function setSliderFill(input) {
      var min = parseFloat(input.min) || 0;
      var max = parseFloat(input.max) || 100;
      var v = parseFloat(input.value) || 0;
      var pct = ((v - min) / (max - min)) * 100;
      input.style.setProperty("--pct", pct + "%");
    }

    function update() {
      var wages = parseInt(wagesEl.value, 10) || 0;
      var subs = parseInt(subsEl.value, 10) || 0;

      var qe = wages * 1.55 + subs;
      var refund = qe * rate;
      var theirFee = refund * INDUSTRY_RATE;
      var ourFee = refund * OUR_RATE;
      var youKeep = refund - ourFee;
      var savings = theirFee - ourFee;

      wagesValueEl.textContent = formatMoney(wages);
      subsValueEl.textContent = formatMoney(subs);
      qeEl.textContent = formatMoney(qe);
      rateLblEl.textContent = (rate * 100).toFixed(0) + "%";
      theirFeeEl.textContent = formatMoney(theirFee);
      ourFeeEl.textContent = formatMoney(ourFee) + "*";
      youKeepEl.textContent = formatMoney(youKeep);
      savingsEl.textContent = formatMoney(savings);
      refundAmount.textContent = formatMoney(refund);

      setSliderFill(wagesEl);
      setSliderFill(subsEl);
    }

    [wagesEl, subsEl].forEach(function (el) {
      el.addEventListener("input", update);
    });

    segmentBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        segmentBtns.forEach(function (b) {
          b.classList.remove("is-active");
          b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");
        rate = parseFloat(btn.getAttribute("data-rate")) || 0.35;
        update();
      });
    });

    update();
  }

  // -------------------- FAQ filter --------------------
  var faqFilter = document.querySelector(".faq-filter");
  if (faqFilter) {
    var chips = faqFilter.querySelectorAll("button");
    var items = document.querySelectorAll(".faq .faq-item");
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) {
          c.classList.remove("is-active");
          c.setAttribute("aria-selected", "false");
        });
        chip.classList.add("is-active");
        chip.setAttribute("aria-selected", "true");
        var f = chip.getAttribute("data-filter");
        items.forEach(function (item) {
          if (f === "all" || item.getAttribute("data-category") === f) {
            item.classList.remove("is-hidden");
          } else {
            item.classList.add("is-hidden");
            item.removeAttribute("open");
          }
        });
      });
    });
  }

  // -------------------- Contact form (Formspree) --------------------
  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");
  if (form) {
    form.addEventListener("submit", function (e) {
      var action = form.getAttribute("action") || "";
      if (action.indexOf("your-form-id") !== -1) {
        e.preventDefault();
        if (status) {
          status.style.display = "block";
          status.style.color = "#7C3A00";
          status.style.background = "#FEF7E0";
          status.style.border = "1px solid #F4D58E";
          status.style.padding = "12px 14px";
          status.style.borderRadius = "10px";
          status.textContent =
            "Form endpoint not configured yet — sign up at formspree.io and replace the placeholder URL in contact.html. In the meantime, email rohan@flexsystems.biz directly.";
        }
        return;
      }

      e.preventDefault();
      var data = new FormData(form);
      var btn = form.querySelector('button[type="submit"]');
      var originalText = btn ? btn.innerHTML : "";
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = "Sending…";
      }

      fetch(action, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" }
      })
        .then(function (resp) {
          if (resp.ok) {
            form.reset();
            if (status) {
              status.style.display = "block";
              status.style.color = "#0A7B5F";
              status.style.background = "#E6F7F1";
              status.style.border = "1px solid rgba(14,142,111,0.25)";
              status.style.padding = "12px 14px";
              status.style.borderRadius = "10px";
              status.textContent =
                "Got it — thanks. We'll get back to you within one business day.";
            }
          } else {
            return resp.json().then(function (json) {
              throw new Error((json && json.error) || "Something went wrong.");
            });
          }
        })
        .catch(function (err) {
          if (status) {
            status.style.display = "block";
            status.style.color = "#9B1C1C";
            status.style.background = "#FBEAEA";
            status.style.border = "1px solid #F0B7B7";
            status.style.padding = "12px 14px";
            status.style.borderRadius = "10px";
            status.textContent =
              "Couldn't send: " + (err.message || "Unknown error") + ". You can email rohan@flexsystems.biz directly.";
          }
        })
        .finally(function () {
          if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
          }
        });
    });
  }
})();
