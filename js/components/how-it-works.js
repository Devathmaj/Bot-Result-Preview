export function renderHowItWorksModal() {
  const steps = [
    {
      title: "Monitored",
      text: "Vendor sites, training providers, and community sources are watched continuously.",
    },
    {
      title: "Analyzed",
      text: "Automation reviews new findings and flags likely certification opportunities.",
    },
    {
      title: "Listed",
      text: "Flagged items are published here with their source, dates, and analysis summary.",
    },
    {
      title: "You decide",
      text: "Availability and terms are controlled by the issuer — always check details at the source before acting.",
    },
  ];

  return `
    <div class="modal-overlay" id="how-it-works-modal" hidden role="dialog" aria-modal="true" aria-labelledby="hiw-heading">
      <div class="modal-panel">
        <button type="button" class="modal-close" data-modal-close aria-label="Close">&times;</button>
        <div class="modal-body">
          <h2 class="section-heading" id="hiw-heading">Welcome to the Voucher Tracker preview</h2>
          <div class="hiw-welcome">
            <p>
              This website showcases a selection of the certification vouchers, discounts, and
              training offers collected by Voucher Bot. It is a preview of the promotions currently
              tracked &mdash; not the complete collection.
            </p>
            <p>
              Voucher Tracker is open source. Explore how discovery works, contribute, or set up
              your own instance:
            </p>
            <p class="welcome-github-link">
              <a href="https://github.com/Devathmaj/VoucherBot" target="_blank" rel="noopener noreferrer">https://github.com/Devathmaj/VoucherBot</a>
            </p>
          </div>

          <h3 class="hiw-sub">How listings are collected</h3>
          <ol class="hiw-steps">
            ${steps
              .map(
                (s, i) => `
                  <li class="hiw-step">
                    <span class="hiw-num" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
                    <h4 class="hiw-title">${s.title}</h4>
                    <p class="hiw-text">${s.text}</p>
                  </li>`
              )
              .join("")}
          </ol>
          <p class="ai-note">
            The &ldquo;AI&rdquo; marker on each listing reflects how confident the automated analysis was when
            identifying it as an opportunity. It is not a verification of the offer.
          </p>
          <p class="ai-note">
            Some source pages do not publish clear dates, so older promotions can still appear in the
            listings, and automated classification may occasionally misidentify content. Availability
            and terms are controlled by the issuing organization &mdash; review the original source before
            acting on any offer.
          </p>

          <div class="welcome-actions">
            <a href="/#notifications" class="welcome-btn welcome-btn-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              Set Up Notifications
            </a>
            <a href="https://github.com/Devathmaj/VoucherBot" target="_blank" rel="noopener noreferrer" class="welcome-btn welcome-btn-secondary">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
    <noscript>
      <style>
        #how-it-works-modal[hidden] {
          display: block;
          position: static;
          background: none;
          padding: 0 1rem;
        }
        #how-it-works-modal .modal-panel {
          max-width: none;
          border: none;
          padding: 0;
        }
        #how-it-works-modal .modal-close {
          display: none;
        }
      </style>
    </noscript>
  `;
}

/** Wire open/close behavior for every page. The overlay ships hidden in
 * the server HTML; this only toggles it. */
export function bindHowItWorksModal() {
  const overlay = document.getElementById("how-it-works-modal");
  if (!overlay || overlay.dataset.bound) return;
  overlay.dataset.bound = "1";

  let lastFocus = null;

  const open = () => {
    lastFocus = document.activeElement;
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add("visible"));
    document.body.style.overflow = "hidden";
    overlay.querySelector(".modal-close")?.focus();
  };

  const close = () => {
    if (overlay.hidden) return;
    overlay.classList.remove("visible");
    document.body.style.overflow = "";
    setTimeout(() => {
      overlay.hidden = true;
    }, 200);
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  };

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  overlay.querySelector("[data-modal-close]")?.addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlay.hidden) close();
  });

  document.querySelectorAll("[data-how-it-works-open]").forEach((btn) => {
    btn.addEventListener("click", open);
  });
}
