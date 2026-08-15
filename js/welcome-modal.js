const STORAGE_KEY = "voucherbot:welcome-dismissed";
let isOpen = false;

const MODAL_HTML = `
<div id="welcome-overlay" class="welcome-overlay">
  <div id="welcome-modal" class="welcome-modal">
    <button id="welcome-close" class="welcome-close" aria-label="Close">&times;</button>

    <h2 class="welcome-title">Preview Notice</h2>
    <hr class="welcome-divider">

    <div class="welcome-body">
      <p>Welcome to the Voucher Tracker preview.</p>
      <p>This website showcases a selection of certification vouchers and promotional offers collected by Voucher Bot. The offers displayed here represent only a preview of the promotions currently tracked and are not the complete collection.</p>
      <p>Voucher Bot continuously monitors multiple certification providers, technology vendors, and learning platforms to discover new exam discounts, promotional vouchers, training offers, and limited-time opportunities. The project is designed to make finding certification savings easier by collecting them in one place.</p>
      <p class="welcome-feature">
        <strong>New:</strong> set up Voucher Bot notifications on <strong>Telegram</strong> or <strong>Discord</strong> so new vouchers and offers are sent straight to you. Press <em>Set Up Notifications</em> below to get started.
      </p>
      <p>To learn more about the project, explore the source code, contribute, or set up your own instance, visit the official GitHub repository:</p>
      <p class="welcome-github-link">
        <a href="https://github.com/Devathmaj/VoucherBot" target="_blank" rel="noopener noreferrer">https://github.com/Devathmaj/VoucherBot</a>
      </p>
      <p>Please be aware that Voucher Bot collects data by scanning publicly available pages. Some pages do not publish a clear date, and the bot does not always use the date even when present. As a result, older promotions — including some that may have already expired — can still appear in the listings. Additionally, automated AI classification may occasionally misidentify non-voucher content as a promotion, producing false positives. We recommend verifying any offer directly with the issuing organization before relying on it.</p>
      <p>Thank you for visiting, and we hope this preview demonstrates the value of the project.</p>
    </div>

    <div class="welcome-actions">
      <a id="welcome-notify" href="#notifications" class="welcome-btn welcome-btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        Set Up Notifications
      </a>
      <a href="https://github.com/Devathmaj/VoucherBot" target="_blank" rel="noopener noreferrer" class="welcome-btn welcome-btn-secondary">
        <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
        View on GitHub
      </a>
      <button id="welcome-continue" class="welcome-btn welcome-btn-secondary">Continue to Preview</button>
    </div>
  </div>
</div>
`;

export function showWelcomeModal() {
  if (isOpen) return;
  if (sessionStorage.getItem(STORAGE_KEY)) return;

  isOpen = true;

  const wrapper = document.createElement("div");
  wrapper.innerHTML = MODAL_HTML;
  const overlay = wrapper.firstElementChild;

  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.classList.add("visible");
  });

  function dismiss() {
    if (!isOpen) return;
    isOpen = false;
    overlay.classList.remove("visible");
    overlay.addEventListener("transitionend", () => overlay.remove(), { once: true });
    sessionStorage.setItem(STORAGE_KEY, "1");
  }

  document.getElementById("welcome-close").addEventListener("click", (e) => {
    e.stopPropagation();
    dismiss();
  });

  document.getElementById("welcome-continue").addEventListener("click", (e) => {
    e.stopPropagation();
    dismiss();
  });

  const notifyBtn = document.getElementById("welcome-notify");
  if (notifyBtn) {
    notifyBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dismiss();
    });
  }

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) dismiss();
  });
}
