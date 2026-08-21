import { escapeHtml } from "../utils.js";

/* ── Set Up Notifications page ── */

const DISCORD_INVITE_URL = "https://discord.com/oauth2/authorize?client_id=1538134597341151282";
const TELEGRAM_BOT_URL = "https://t.me/certification_voucher_bot";

function setupCardHtml(card) {
  const steps = card.steps.map((s) => `<li>${s}</li>`).join("");
  const links = card.links
    .map((l) => `<a href="${escapeHtml(l.href)}">${escapeHtml(l.label)}</a>`)
    .join('<span class="setup-legal-sep">&middot;</span>');

  return `
    <div class="setup-card ${card.accentClass}">
      <div class="platform-head">
        <span class="platform-dot ${card.accentClass}"></span>
        <div>
          <h2 class="setup-card-title">${escapeHtml(card.name)}</h2>
          <p class="setup-card-sub">${escapeHtml(card.tagline)}</p>
        </div>
      </div>
      <ol class="setup-steps">${steps}</ol>
      <a href="${escapeHtml(card.href)}" target="_blank" rel="noopener noreferrer" class="setup-btn ${card.buttonClass}">
        ${card.buttonLabel}
      </a>
      <div class="qr-block">
        <span class="qr-label">${escapeHtml(card.qrLabel)}</span>
        <img class="qr-img" src="${escapeHtml(card.qrSrc)}" alt="${escapeHtml(card.qrAlt)}" width="220" height="220" loading="lazy">
      </div>
      <div class="setup-legal">
        <span class="qr-label">Legal &amp; data</span>
        <div class="setup-legal-links">${links}</div>
      </div>
    </div>
  `;
}

export function renderNotificationsPage() {
  const page = document.createElement("div");
  page.className = "notify-page";

  const header = document.createElement("header");
  header.className = "legal-header";
  header.innerHTML = `<a href="/" class="legal-back">&larr; Back to vouchers</a><h1>Set Up Notifications</h1><p class="legal-last-updated">Instant voucher alerts on Discord or Telegram</p>`;
  page.appendChild(header);

  const intro = document.createElement("p");
  intro.className = "notify-intro";
  intro.textContent =
    "Voucher Bot can push new certification vouchers, exam discounts, and promo codes straight to you. Pick a platform below and follow the steps — no account with us required.";
  page.appendChild(intro);

  const grid = document.createElement("div");
  grid.className = "setup-grid";

  const discord = document.createElement("div");
  discord.innerHTML = setupCardHtml({
    accentClass: "setup-card-discord",
    name: "Discord",
    tagline: "Invite the bot, then pick where alerts go.",
    steps: [
      `Invite the bot to any server and hit the button below.`,
      `Run <code class="cmd-chip">/notify dm</code> to have alerts sent to your DMs.`,
      `Or run <code class="cmd-chip">/notify channel</code> to set up the channel where notifications are posted.`,
      `Run <code class="cmd-chip">/about</code> to see what the bot is about.`,
      `Run <code class="cmd-chip">/help</code> for the full list of commands.`,
    ],
    href: DISCORD_INVITE_URL,
    buttonClass: "setup-btn-discord",
    buttonLabel: "Invite Voucher Bot",
    qrLabel: "Scan to invite the bot",
    qrSrc: "assets/images/discord_bot.png",
    qrAlt: "QR code linking to the Discord bot invite",
    links: [
      { href: "/#discord/privacy", label: "Privacy Policy" },
      { href: "/#discord/terms", label: "Terms of Service" },
      { href: "/#discord/disclaimer", label: "Disclaimer" },
      { href: "/#discord/permissions", label: "Permissions" },
    ],
  });
  grid.appendChild(discord.firstElementChild);

  const telegram = document.createElement("div");
  telegram.innerHTML = setupCardHtml({
    accentClass: "setup-card-telegram",
    name: "Telegram",
    tagline: "Open the bot, press start, done.",
    steps: [
      `Open the bot with the button below.`,
      `Send <code class="cmd-chip">/start</code> in the chat to subscribe.`,
      `For groups: just add the bot to the group - that's it.`,
      `Send <code class="cmd-chip">/about</code> to see what the bot is about.`,
      `Run <code class="cmd-chip">/help</code> for the full list of commands.`,
    ],
    href: TELEGRAM_BOT_URL,
    buttonClass: "setup-btn-telegram",
    buttonLabel: "Open Voucher Bot",
    qrLabel: "Scan to open the bot",
    qrSrc: "assets/images/telegram_bot.jpeg",
    qrAlt: "QR code linking to the Telegram bot",
    links: [
      { href: "/#telegram/privacy", label: "Privacy Policy" },
      { href: "/#telegram/terms", label: "Terms of Service" },
      { href: "/#telegram/disclaimer", label: "Disclaimer" },
    ],
  });
  grid.appendChild(telegram.firstElementChild);

  page.appendChild(grid);
  return page;
}

