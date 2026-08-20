import { ICONS } from "./icons.js";

export function renderNotificationCta() {
  return `
    <section class="container notify-section" aria-label="Notifications">
      <a class="notify-cta notify-cta--primary" href="/#notifications">
        <span class="notify-cta-icon" aria-hidden="true">${ICONS.bell}</span>
        <span class="notify-cta-text">
          <span class="notify-cta-title">Be first to know</span>
          <span class="notify-cta-sub">Get an alert the moment VoucherBot discovers a new certification opportunity &mdash; free, right in Discord or Telegram.</span>
        </span>
        <span class="notify-cta-go" aria-hidden="true">&rarr;</span>
      </a>
    </section>
  `;
}
