import { ICONS } from "./icons.js";

export function renderNotificationCta() {
  return `
    <section class="container notify-section" aria-label="Notifications">
      <a class="notify-cta" href="/#notifications">
        <span class="notify-cta-icon" aria-hidden="true">${ICONS.bell}</span>
        <span class="notify-cta-text">
          <span class="notify-cta-title">Get new listings delivered</span>
          <span class="notify-cta-sub">New certification opportunities pushed to you on Discord or Telegram as they are discovered.</span>
        </span>
        <span class="notify-cta-go" aria-hidden="true">&rarr;</span>
      </a>
    </section>
  `;
}
