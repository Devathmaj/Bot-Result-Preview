export function renderSiteFooter() {
  const year = new Date().getFullYear();

  return `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-links">
          <a href="/">Home</a>
          <span class="footer-sep" aria-hidden="true">&middot;</span>
          <a href="/#notifications">Notifications</a>
          <span class="footer-sep" aria-hidden="true">&middot;</span>
          <a href="/#donate">Donate</a>
          <span class="footer-sep" aria-hidden="true">&middot;</span>
          <a href="/#about">About</a>
          <span class="footer-sep" aria-hidden="true">&middot;</span>
          <a href="/#privacy">Privacy Policy</a>
          <span class="footer-sep" aria-hidden="true">&middot;</span>
          <a href="/#terms">Terms of Use</a>
          <span class="footer-sep" aria-hidden="true">&middot;</span>
          <a href="/#disclaimer">Disclaimer</a>
          <span class="footer-sep" aria-hidden="true">&middot;</span>
          <a href="https://github.com/Devathmaj/VoucherBot" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
        <p class="footer-disclaimer">
          Voucher Tracker is an independent, open-source aggregator of publicly available certification promotions. Listings are identified through automated analysis and may be incomplete, inaccurate, or out of date. We are not affiliated with or endorsed by the organizations whose offers are listed. All trademarks and promotions remain the property of their respective owners.
        </p>
        <p class="footer-copy">&copy; ${year} Voucher Tracker. Open-source project.</p>
      </div>
    </footer>
  `;
}
