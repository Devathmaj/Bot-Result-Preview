import { ICONS } from "./icons.js";

export function renderNotificationCta() {
  return `
    <section class="container notify-section" aria-label="Notifications & Support">
      <div class="notify-split">
        <a class="notify-cta notify-cta--donate" href="/#donate">
          <span class="notify-cta-icon notify-cta-icon--donate" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </span>
          <span class="notify-cta-text">
            <span class="notify-cta-title">Support VoucherBot</span>
            <span class="notify-cta-sub">Help keep the notification service running 24/7.</span>
          </span>
          <span class="notify-cta-go" aria-hidden="true">&rarr;</span>
        </a>
        <a class="notify-cta notify-cta--primary" href="/#notifications">
          <span class="notify-cta-icon" aria-hidden="true">${ICONS.bell}</span>
          <span class="notify-cta-text">
            <span class="notify-cta-title">Be first to know</span>
            <span class="notify-cta-sub">Get an alert the moment VoucherBot discovers a new certification opportunity &mdash; free, right in Discord or Telegram.</span>
          </span>
          <span class="notify-cta-go" aria-hidden="true">&rarr;</span>
        </a>
      </div>
    </section>
  `;
}
