const LAST_UPDATED = "July 24, 2026";
const BOT_LAST_UPDATED = "August 16, 2026";

function escapeHtml(str) {
  if (typeof str !== "string") return str ?? "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function renderLegalPage(title, sections, options = {}) {
  const page = document.createElement("div");
  page.className = "legal-page";

  const backHref = options.backHref ?? "#";
  const backLabel = options.backLabel ?? "Back to vouchers";
  const lastUpdated = options.lastUpdated ?? LAST_UPDATED;

  const h = document.createElement("header");
  h.className = "legal-header";
  h.innerHTML = `<a href="${escapeHtml(backHref)}" class="legal-back">&larr; ${escapeHtml(backLabel)}</a><h1>${escapeHtml(title)}</h1><p class="legal-last-updated">Last updated: ${escapeHtml(lastUpdated)}</p>`;
  page.appendChild(h);

  for (const section of sections) {
    const block = document.createElement("section");
    block.className = "legal-section";

    if (section.heading) {
      const h2 = document.createElement("h2");
      h2.textContent = section.heading;
      block.appendChild(h2);
    }

    for (const item of section.items) {
      if (typeof item === "string") {
        const p = document.createElement("p");
        p.textContent = item;
        block.appendChild(p);
      } else if (item.type === "list") {
        const ul = document.createElement("ul");
        ul.className = "legal-list";
        for (const li of item.entries) {
          const el = document.createElement("li");
          el.textContent = li;
          ul.appendChild(el);
        }
        block.appendChild(ul);
      } else if (item.type === "note") {
        const p = document.createElement("p");
        p.className = "legal-note";
        p.textContent = item.text;
        block.appendChild(p);
      } else if (item.type === "table") {
        const table = document.createElement("table");
        table.className = "legal-table";
        const thead = document.createElement("thead");
        const headRow = document.createElement("tr");
        for (const col of item.columns) {
          const th = document.createElement("th");
          th.textContent = col;
          headRow.appendChild(th);
        }
        thead.appendChild(headRow);
        table.appendChild(thead);
        const tbody = document.createElement("tbody");
        for (const row of item.rows) {
          const tr = document.createElement("tr");
          for (const cell of row) {
            const td = document.createElement("td");
            td.innerHTML = cell;
            tr.appendChild(td);
          }
          tbody.appendChild(tr);
        }
        table.appendChild(tbody);
        block.appendChild(table);
      } else if (item.type === "html") {
        const div = document.createElement("div");
        div.innerHTML = item.html;
        block.appendChild(div);
      }
    }

    page.appendChild(block);
  }

  return page;
}

export function renderAboutPage() {
  return renderLegalPage("About Voucher Tracker", [
    {
      heading: "What Is Voucher Tracker?",
      items: [
        "Voucher Tracker is an independent, open-source project that aggregates publicly available certification vouchers, promotional offers, discounts, and learning opportunities from various vendors. The website is intended to make it easier for users to discover certification promotions in one place.",
        "This website is only a preview of the full Voucher Bot project. The offers displayed here represent a selection of the promotions currently being tracked and are not the complete collection.",
      ],
    },
    {
      heading: "How It Works",
      items: [
        "Voucher Bot continuously monitors multiple certification providers, technology vendors, and learning platforms to discover new exam discounts, promotional vouchers, training offers, and limited-time opportunities. The collected information is presented here in a browseable format.",
        "The project is designed to make finding certification savings easier by aggregating them in one place. Instead of visiting each vendor's website individually, users can browse available promotions here and then verify the details directly with the issuing organization.",
      ],
    },
    {
      heading: "Open Source",
      items: [
        "Voucher Tracker is an open-source project. The complete source code is available on GitHub, where you can explore how it works, contribute improvements, report issues, or set up your own instance.",
        {
          type: "html",
          html: `<p class="legal-github-link"><a href="https://github.com/Devathmaj/VoucherBot" target="_blank" rel="noopener noreferrer">https://github.com/Devathmaj/VoucherBot</a></p>`,
        },
        "If you find this project useful, consider starring the repository on GitHub, sharing it with others who might benefit, or contributing to its development.",
      ],
    },
    {
      heading: "Limitations & False Positives",
      items: [
        "Voucher Bot collects data by scanning publicly available pages across vendor websites. Because some pages do not publish a clear date and the bot does not always extract date information reliably, older promotions — including some that may have already expired — can still appear in the listings.",
        "The project uses automated AI classification to identify voucher and promotion content. This process is not perfect and may occasionally produce false positives, where non-voucher content is misidentified as a promotion. Similarly, valid promotions may occasionally be missed.",
        "Users should treat all listings as potentially outdated or inaccurate and should always verify the current status of any offer directly with the issuing organization before relying on it.",
      ],
    },
    {
      heading: "Disclaimer",
      items: [
        "Voucher Tracker is an independent aggregator and is not affiliated with, endorsed by, or sponsored by any of the organizations whose promotions are listed. All trademarks, service marks, and company names are the property of their respective owners.",
      ],
    },
  ]);
}

export function renderPrivacyPage() {
  return renderLegalPage("Privacy Policy", [
    {
      heading: "Information Collection",
      items: [
        "Voucher Tracker does not require user accounts, registration, or any form of personal information to use the website. No personal information is intentionally collected, and no user profiles are created.",
        "As with most websites, standard technical information may be received through normal web requests. This may include your IP address, browser type and version, operating system, the referring page, and the date and time of your visit. This information is used only for hosting, security, and operational purposes.",
        "Voucher Tracker does not currently use analytics, advertising trackers, or non-essential cookies.",
      ],
    },
    {
      heading: "Third-Party Infrastructure",
      items: [
        "This website may be hosted on third-party infrastructure. If hosted on such services, those providers may process standard technical request information (including IP addresses and browser details) as part of their normal operations. The privacy practices of those providers are governed by their own policies.",
      ],
    },
    {
      heading: "External Links",
      items: [
        "The Voucher Tracker website contains links to external websites, including vendor promotion pages, certification providers, and the project's GitHub repository. Voucher Tracker is not responsible for the privacy practices or content of these external websites.",
        "Users should review the privacy policies of any external websites they visit. Voucher Tracker does not control what information those websites collect or how they use it.",
      ],
    },
    {
      heading: "Information Sharing",
      items: [
        "Voucher Tracker does not sell, trade, or share personal information with third parties. Since the website does not collect personal information in the first place, there is nothing to share.",
      ],
    },
    {
      heading: "Changes to This Policy",
      items: [
        "If this privacy policy is updated, the changes will be reflected on this page with an updated \"Last updated\" date. Continued use of the website after changes constitutes acceptance of the updated policy.",
      ],
    },
    {
      heading: "Contact",
      items: [
        "If you have questions about this privacy policy, please open an issue on the project's GitHub repository.",
        {
          type: "html",
          html: `<p class="legal-github-link"><a href="https://github.com/Devathmaj/VoucherBot" target="_blank" rel="noopener noreferrer">https://github.com/Devathmaj/VoucherBot</a></p>`,
        },
      ],
    },
  ]);
}

export function renderTermsPage() {
  return renderLegalPage("Terms of Use", [
    {
      heading: "Acceptance of Terms",
      items: [
        "By accessing or using the Voucher Tracker website, you agree to be bound by these Terms of Use. If you do not agree with any part of these terms, you should not use the website.",
      ],
    },
    {
      heading: "Informational Purpose",
      items: [
        "The Voucher Tracker website is provided for informational purposes only. It aggregates publicly available certification promotions, discounts, and offers to help users discover opportunities. The information presented on this website does not constitute an endorsement or recommendation of any specific promotion, product, or vendor.",
      ],
    },
    {
      heading: "Accuracy of Information",
      items: [
        "Voucher Tracker makes reasonable efforts to ensure the accuracy of the information displayed on this website. However, promotions may expire, change, or become unavailable without notice. Voucher Tracker cannot guarantee that all information is current, complete, or accurate at the time of viewing.",
        "Voucher Bot collects data by scanning publicly available web pages. Some pages do not publish a clear date, and the bot does not always extract date information reliably. As a result, older or expired promotions may still appear in listings. Additionally, automated AI classification may produce false positives, misidentifying non-voucher content as promotions.",
        "Users are responsible for verifying any promotion, discount, or offer directly with the issuing organization before relying on it. Voucher Tracker recommends checking the official vendor website for the most up-to-date information.",
      ],
    },
    {
      heading: "No Warranty",
      items: [
        "The Voucher Tracker website is provided on an \"as is\" and \"as available\" basis without any warranties of any kind, either express or implied. Voucher Tracker disclaims all warranties, including but not limited to merchantability, fitness for a particular purpose, and non-infringement.",
        "Voucher Tracker does not warrant that the website will be uninterrupted, error-free, secure, or free from vulnerabilities.",
      ],
    },
    {
      heading: "Limitation of Liability",
      items: [
        "In no event shall Voucher Tracker, its contributors, or maintainers be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising out of or relating to the use of or inability to use the website, including but not limited to losses arising from expired or inaccurate promotions.",
      ],
    },
    {
      heading: "External Links",
      items: [
        "This website contains links to third-party websites for your convenience. Voucher Tracker does not control, endorse, or take responsibility for the content, policies, or practices of any third-party websites. Accessing external links from this website is at your own risk.",
      ],
    },
    {
      heading: "Intellectual Property",
      items: [
        "The Voucher Tracker project source code is available under an open-source license on GitHub. The design, layout, and original content of this website are provided for public use as part of the open-source project.",
      ],
    },
    {
      heading: "Trademarks",
      items: [
        "All trademarks, service marks, logos, company names, product names, and brand names displayed on this website remain the property of their respective owners. Use of these marks does not imply affiliation with or endorsement by the trademark owner.",
        "Trademarks and logos are displayed solely for the purpose of identifying the organizations whose promotions are listed. This is intended to be an informational use and not an infringement of any trademark rights.",
      ],
    },
    {
      heading: "Changes to the Website",
      items: [
        "Voucher Tracker reserves the right to modify, suspend, or discontinue any aspect of the website at any time without notice. These Terms of Use may be updated from time to time, and continued use of the website after changes constitutes acceptance of the revised terms.",
      ],
    },
    {
      heading: "Contact",
      items: [
        "For questions regarding these Terms of Use, please visit the project's GitHub repository.",
        {
          type: "html",
          html: `<p class="legal-github-link"><a href="https://github.com/Devathmaj/VoucherBot" target="_blank" rel="noopener noreferrer">https://github.com/Devathmaj/VoucherBot</a></p>`,
        },
      ],
    },
  ]);
}

export function renderDisclaimerPage() {
  return renderLegalPage("Disclaimer", [
    {
      heading: "Independent Aggregator",
      items: [
        "Voucher Tracker is an independent, open-source aggregator of publicly available certification promotions, discounts, and offers. The website does not own, create, sponsor, or control any of the promotions listed. All offers are the property of their respective issuing organizations.",
      ],
    },
    {
      heading: "No Affiliation",
      items: [
        "Voucher Tracker is not affiliated with, endorsed by, or sponsored by Microsoft, Amazon Web Services (AWS), Google, Oracle, Cisco, Red Hat, CompTIA, or any other vendor whose promotions may appear on this website, unless explicitly stated otherwise.",
        "All trademarks, logos, company names, and product names displayed on this website remain the property of their respective owners. Logos and trademarks are displayed solely for identification and informational purposes.",
      ],
    },
    {
      heading: "Promotion Accuracy",
      items: [
        "Promotions listed on Voucher Tracker may expire, change, or become unavailable without notice. Voucher Tracker makes reasonable efforts to keep information accurate but cannot guarantee the correctness, availability, or completeness of any offer.",
        "Voucher Bot collects data by scanning publicly available web pages. Because some pages do not publish a clear date and the bot does not always extract date information reliably, older promotions — including some that may have already expired — can still appear in the listings.",
        "The project uses automated AI classification to identify voucher and promotion content. This process may occasionally produce false positives, where non-voucher content is misidentified as a promotion. Users should treat all listings as potentially outdated or inaccurate.",
        "Users should always verify offers directly with the issuing organization before making purchasing decisions or relying on any promotion listed on this website.",
      ],
    },
    {
      heading: "External Links",
      items: [
        "Links displayed on Voucher Tracker lead to third-party websites. These external websites have their own terms of use, privacy policies, and practices, which are outside the control of Voucher Tracker. Voucher Tracker is not responsible for the content or policies of any linked third-party website.",
      ],
    },
    {
      heading: "No Liability",
      items: [
        "To the maximum extent permitted by applicable law, Voucher Tracker and its contributors shall not be liable for any losses, damages, or expenses arising from the use of this website or reliance on the information presented herein.",
      ],
    },
  ]);
}

const NOTIFY_OPTIONS = {
  backHref: "#notifications",
  backLabel: "Set Up Notifications",
  lastUpdated: BOT_LAST_UPDATED,
};

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
  header.innerHTML = `<a href="#" class="legal-back">&larr; Back to vouchers</a><h1>Set Up Notifications</h1><p class="legal-last-updated">Instant voucher alerts on Discord or Telegram</p>`;
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
      `Run <code class="cmd-chip">/help</code> for the full list of commands.`,
    ],
    href: DISCORD_INVITE_URL,
    buttonClass: "setup-btn-discord",
    buttonLabel: "Invite Voucher Bot",
    qrLabel: "Scan to invite the bot",
    qrSrc: "assets/images/discord_bot.png",
    qrAlt: "QR code linking to the Discord bot invite",
    links: [
      { href: "#discord/privacy", label: "Privacy Policy" },
      { href: "#discord/terms", label: "Terms of Service" },
      { href: "#discord/disclaimer", label: "Disclaimer" },
      { href: "#discord/permissions", label: "Permissions" },
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
      `For groups: just add the bot to the group — that's it.`,
      `Run <code class="cmd-chip">/help</code> for the full list of commands.`,
    ],
    href: TELEGRAM_BOT_URL,
    buttonClass: "setup-btn-telegram",
    buttonLabel: "Open Voucher Bot",
    qrLabel: "Scan to open the bot",
    qrSrc: "assets/images/telegram_bot.jpeg",
    qrAlt: "QR code linking to the Telegram bot",
    links: [
      { href: "#telegram/privacy", label: "Privacy Policy" },
      { href: "#telegram/terms", label: "Terms of Service" },
      { href: "#telegram/disclaimer", label: "Disclaimer" },
    ],
  });
  grid.appendChild(telegram.firstElementChild);

  page.appendChild(grid);
  return page;
}

/* ── Discord legal pages ── */

export function renderDiscordPrivacyPage() {
  return renderLegalPage("Privacy Policy — Voucher Bot (Discord)", [
    {
      heading: "Introduction",
      items: [
        "This policy describes how the Discord bot Voucher Bot (\"the bot\") collects, uses, and retains personal data. The bot posts new items to participating servers and, if you opt in, sends you a direct message (DM) when a new item is published.",
      ],
    },
    {
      heading: "Data We Collect",
      items: [
        {
          type: "table",
          columns: ["Data", "Why it is stored", "When it is collected"],
          rows: [
            ["Your Discord user ID", "Route DMs to you and record who configured a channel feed", "When you opt in to DMs or configure a channel"],
            ["Channel feed configuration (server ID, channel ID, who set it up)", "Deliver notifications to a server channel once per new post", "When a server admin configures a feed"],
            ["DM delivery switch", "Remember whether you want DMs", "When you opt in or out of DM notifications"],
            ["Delivery records (post link, recipient, message IDs, timestamp)", "Deduplicate deliveries and keep an audit log", "Each time a notification is delivered"],
          ],
        },
        {
          type: "note",
          text: "We do not store your message content, Discord username, or any content you type in the server.",
        },
      ],
    },
    {
      heading: "How the Data Is Used",
      items: [
        "To deliver notifications you requested (DMs or server channel posts).",
        "To avoid sending the same post to you twice (deduplication).",
        "For operational logging and debugging; logs are not kept longer than needed and never include your message content or personal identifiers.",
        "We do not sell, rent, or share your data with third parties beyond the hosting provider. Data is stored in a Supabase (PostgreSQL) database; the underlying servers, storage, and backups are operated by Supabase's cloud provider under our account.",
      ],
    },
    {
      heading: "Retention",
      items: [
        "Subscriptions and feed configuration are kept until you remove them.",
        "Delivery records for DMs are retained for 7 days after you delete your data, then removed automatically by a retention sweep.",
      ],
    },
    {
      heading: "Deleting Your Data",
      items: [
        {
          type: "html",
          html: `Run <code class="cmd-chip">/delete</code> in any server where the bot is present. This immediately removes your DM preference, any channel feed you configured, and the associated delivery history. Shared server feeds and delivery records that belong to the server are not removed because they are not your personal data.`,
        },
      ],
    },
    {
      heading: "Security",
      items: [
        "The bot connects to Discord using a confidential token, never shared.",
        "Incoming webhooks are authenticated with a secret bearer token.",
        "Database access uses a least-privilege role when configured.",
        "Data at rest is managed by the Supabase hosting provider; access to it is limited to the operators of this bot.",
      ],
    },
    {
      heading: "Contact",
      items: [
        "For questions or data subject requests, contact devathmaj@gmail.com.",
      ],
    },
    {
      heading: "Changes",
      items: [
        "We may update this policy. The \"Last updated\" date above reflects the latest version.",
      ],
    },
  ], NOTIFY_OPTIONS);
}

export function renderDiscordTermsPage() {
  return renderLegalPage("Terms of Service — Voucher Bot (Discord)", [
    {
      heading: "Acceptance of Terms",
      items: [
        "By inviting, using, or interacting with the Discord bot Voucher Bot (\"the bot\"), you agree to these terms.",
      ],
    },
    {
      heading: "The Service",
      items: [
        "The bot posts new items to channels that have a feed configured and, if you opt in, sends you a DM when a new item is published.",
        {
          type: "table",
          columns: ["Command", "What it does"],
          rows: [
            ["<code class=\"cmd-chip\">/latest</code>", "Show the newest notification"],
            ["<code class=\"cmd-chip\">/top &lt;n&gt;</code>", "Show the n most recent notifications (1&ndash;100)"],
            ["<code class=\"cmd-chip\">/notify dm</code>", "Deliver notifications to you via DM"],
            ["<code class=\"cmd-chip\">/notify channel &lt;channel&gt; [mention]</code>", "Configure a channel feed (requires the Manage Channels permission); optional @here/@everyone mentions (requires the corresponding mention permission)"],
            ["<code class=\"cmd-chip\">/notify list</code>", "Show your current notification settings (DMs and channel feeds)"],
            ["<code class=\"cmd-chip\">/notify off &lt;target&gt; [channel]</code>", "Turn off DMs or remove a channel feed"],
            ["<code class=\"cmd-chip\">/delete</code>", "Delete all your stored notification data"],
            ["<code class=\"cmd-chip\">/help</code>", "Show this message and list all commands"],
          ],
        },
      ],
    },
    {
      heading: "Acceptable Use",
      items: [
        "To keep the service usable for everyone, you agree to the following restrictions:",
        { type: "list", entries: [
          "Do not use the bot to abuse, harass, or spam other users or servers.",
          "Do not automate commands in a way that bypasses the bot's rate limits.",
          "Do not attempt to gain unauthorized access to the bot's systems or data.",
          "Do not use the bot for any unlawful purpose.",
        ]},
        {
          type: "note",
          text: "We may block or remove access for users or servers that violate these terms.",
        },
      ],
    },
    {
      heading: "Availability",
      items: [
        "The bot is provided \"as is\" and \"as available\". We do not guarantee uninterrupted or error-free operation. The underlying infrastructure runs on third-party providers (including Discord, Supabase, and our hosting), and we are not responsible for outages, latency, or data loss caused by them.",
      ],
    },
    {
      heading: "Content and Notifications",
      items: [
        "Notifications are generated from posts we publish. We make no warranty about the accuracy, completeness, or timeliness of the content delivered through the bot. You are responsible for how your server uses the bot and for the messages the bot posts in your channels.",
      ],
    },
    {
      heading: "Data",
      items: [
        {
          type: "html",
          html: `Use of the bot is governed by the <a href="#discord/privacy">Privacy Policy</a>. You may delete your stored data at any time with <code class="cmd-chip">/delete</code>.`,
        },
      ],
    },
    {
      heading: "Liability",
      items: [
        "To the maximum extent permitted by law, we are not liable for any indirect, incidental, or consequential damages arising from your use of the bot.",
      ],
    },
    {
      heading: "Changes",
      items: [
        "We may update these terms from time to time. The \"Last updated\" date above reflects the latest version. Continued use after changes means you accept the updated terms.",
      ],
    },
    {
      heading: "Contact",
      items: [
        "For questions about these terms, contact devathmaj@gmail.com.",
      ],
    },
  ], NOTIFY_OPTIONS);
}

export function renderDiscordDisclaimerPage() {
  return renderLegalPage("Disclaimer — Voucher Bot (Discord)", [
    {
      heading: "Introduction",
      items: [
        "The Discord bot Voucher Bot (\"the bot\") delivers notifications about vouchers, promotions, and exam offers. The information distributed through the bot is provided for informational purposes only.",
      ],
    },
    {
      heading: "No Warranty on Content",
      items: [
        "We make no warranty — express or implied — regarding the accuracy, completeness, reliability, or timeliness of any notification or post delivered through the bot. Offers, voucher codes, terms, eligibility criteria, and availability can change or expire at any time without notice.",
      ],
    },
    {
      heading: "Not an Endorsement or Affiliation",
      items: [
        "The bot is an independent project. It is not affiliated with, endorsed by, or sponsored by Discord, AWS, or any vendor whose promotions appear in the notifications. All product names, logos, and offers belong to their respective owners.",
      ],
    },
    {
      heading: "Your Responsibility",
      items: [
        { type: "list", entries: [
          "Verify any voucher, promotion, or link before relying on it.",
          "Promotions are subject to the issuing vendor's own terms and conditions.",
          "Use of third-party links and services is at your own sole risk.",
          "We are not liable for decisions you make based on content delivered through the bot, or for vouchers/codes that are invalid, expired, or inapplicable to you.",
        ]},
      ],
    },
    {
      heading: "Third-Party Content & Voucher Data",
      items: [
        "Notifications delivered by the bot contain voucher and promotion data collected by Voucher Bot. This data is obtained by scanning publicly available pages across vendor websites; Voucher Bot does not verify the current status of every offer.",
        "Because some pages do not publish a clear date and the bot does not always extract date information reliably, older promotions — including some that may have already expired — can still appear. Automated AI classification may occasionally produce false positives, where non-voucher content is misidentified as a promotion.",
        "Notifications may contain links to external websites. These third-party websites have their own terms of use, privacy policies, and practices, which are outside the control of Voucher Bot. You should always verify any offer directly with the issuing organization before relying on it.",
      ],
    },
    {
      heading: "Availability",
      items: [
        "The bot and its content are provided \"as is\" and \"as available\" with no guarantee of uptime, uninterrupted delivery, or freedom from errors.",
      ],
    },
    {
      heading: "Liability",
      items: [
        "To the maximum extent permitted by law, we are not liable for any direct, indirect, incidental, or consequential loss or damage arising from your use of the bot or reliance on its content.",
      ],
    },
    {
      heading: "Contact",
      items: [
        "For questions about this disclaimer, contact devathmaj@gmail.com.",
      ],
    },
  ], NOTIFY_OPTIONS);
}

export function renderDiscordPermissionsPage() {
  return renderLegalPage("Discord Install Permissions — Voucher Bot", [
    {
      heading: "Introduction",
      items: [
        "This page explains the scopes and permissions the bot requests when you install it, what each one is for, and how the bot actually uses it.",
      ],
    },
    {
      heading: "User Install",
      items: [
        {
          type: "html",
          html: `Scopes: <code class="cmd-chip">applications.commands</code>`,
        },
        "A User Install lets individual users use the bot's slash commands directly in a DM with the bot, without needing the bot in a server. With this scope you can run /latest, /top <n>, /help, and /delete from a private chat.",
        {
          type: "html",
          html: `<code class="cmd-chip">applications.commands</code> — Enables slash commands such as <code class="cmd-chip">/latest</code>, <code class="cmd-chip">/top</code>, <code class="cmd-chip">/help</code>, and <code class="cmd-chip">/delete</code> in the DM. Note that DM-preference commands live in the <code class="cmd-chip">/notify</code> group, which is server-only, so user-install only exposes the read/search and data-deletion commands.`,
        },
        "Only applications.commands is requested for User Install because the bot does not need a channel-member presence to send DMs or delete data from a private chat.",
      ],
    },
    {
      heading: "Guild Install",
      items: [
        "A Guild Install is how you add the bot to a server. It creates a bot member (bot scope) and enables the slash commands in that server (applications.commands).",
        {
          type: "table",
          columns: ["Scope", "Purpose"],
          rows: [
            ["<code class=\"cmd-chip\">bot</code>", "Adds the bot as a member of your server so it can send and read messages there"],
            ["<code class=\"cmd-chip\">applications.commands</code>", "Registers the slash commands in the server"],
          ],
        },
      ],
    },
    {
      heading: "Channel Permissions",
      items: [
        "These are the channel permissions the bot requests in a server, and how they are used:",
        {
          type: "table",
          columns: ["Permission", "Why it is needed", "How the bot uses it"],
          rows: [
            ["<strong>View Channels</strong>", "See the channels the bot needs to read or post in", "Lets the bot read and respond to commands in a channel and deliver notification posts there. Without it, the bot cannot see that a channel is configured"],
            ["<strong>Send Messages</strong>", "Send any text or content in a server channel", "Sends notification posts to configured channel feeds and replies to slash commands like /latest and /top"],
            ["<strong>Send Messages in Threads</strong>", "Post and reply inside threads", "Lets the bot respond to slash commands used in threads and deliver to thread-based channels"],
            ["<strong>Embed Links</strong>", "Render rich embed cards with link previews", "Notification posts and /latest//top responses are sent as Discord embed cards with a \"View Details\" link to the offer. Without this permission the card renders as plain text with no preview"],
            ["<strong>Mention Everyone</strong>", "Send @here / @everyone pings", "Used only with <code class=\"cmd-chip\">/notify channel ... mention: here|everyone</code>, when an admin enables member pings on each new post. Defaults to no mentions, and the bot checks the mention permission before sending"],
            ["<strong>Use Slash Commands</strong>", "Invoke the command interface", "All bot commands are slash commands (/latest, /top, /notify ..., /delete, /help) and need this permission to run"],
            ["<strong>Attach Files</strong>", "Upload files to Discord", "Reserve only: the current features do not upload files, but this is requested so that future posts with banner images can be delivered without asking servers to approve a new permission"],
          ],
        },
      ],
    },
    {
      heading: "Not Requested",
      items: [
        "The bot does not request administrator, manage-messages, manage-roles, manage-channels, read message history, or message-content intent. It only:",
        { type: "list", entries: [
          "reads the configured channel and member permissions (via the command you run),",
          "sends messages/embeds,",
          "and performs actions you explicitly trigger with a command.",
        ]},
      ],
    },
    {
      heading: "Tips",
      items: [
        { type: "list", entries: [
          "The bot needs Send Messages + Embed Links + View Channels in a channel where you want notification feeds to appear.",
          "Use the Mention Everyone permission only in channels where @everyone pings are appropriate; keep it off and choose mention: none otherwise.",
          "To remove the bot's data access, a user can run /delete.",
        ]},
        {
          type: "html",
          html: `See the <a href="#discord/privacy">Privacy Policy</a> and <a href="#discord/terms">Terms of Service</a> for more information.`,
        },
      ],
    },
  ], NOTIFY_OPTIONS);
}

/* ── Telegram legal pages ── */

export function renderTelegramPrivacyPage() {
  return renderLegalPage("Privacy Policy — Notification Bot (Telegram)", [
    {
      heading: "Introduction",
      items: [
        "This policy describes how the Telegram bot (\"the bot\") collects, uses, and retains personal data. The bot sends you notifications in private chat, or to a group the bot was added to.",
      ],
    },
    {
      heading: "Data We Collect",
      items: [
        {
          type: "table",
          columns: ["Data", "Why it is stored", "When it is collected"],
          rows: [
            ["Your Telegram chat ID and user ID", "Address notifications to you", "When you start the bot (/start)"],
            ["Your Telegram username and first/last name (if visible to the bot)", "Display purposes and support", "When you start the bot"],
            ["Subscription switch", "Remember whether you want notifications", "When you opt in or out"],
            ["Group chat ID, title, and chat type", "Deliver notifications to groups you added the bot to", "When the bot is added to a group"],
            ["Delivery records (post link, recipient, message ID, timestamp)", "Deduplicate deliveries and keep an audit log", "Each time a notification is delivered"],
          ],
        },
        {
          type: "note",
          text: "We do not store the contents of your messages or files.",
        },
      ],
    },
    {
      heading: "How the Data Is Used",
      items: [
        "To deliver notifications you requested (private chats or groups).",
        "To avoid sending the same post to you twice (deduplication).",
        "For operational logging and debugging; logs are not kept longer than needed and never include your message content. Chat IDs are stored in logs only as one-way hashes, so they cannot be traced back to you.",
        "We do not sell, rent, or share your data with third parties beyond the hosting provider. Data is stored in a Supabase (PostgreSQL) database; the underlying servers, storage, and backups are operated by Supabase's cloud provider under our account.",
      ],
    },
    {
      heading: "Retention",
      items: [
        "Subscriptions are kept until you remove them.",
        "Delivery records for private (DM) notifications are retained for 7 days after you remove your data, then deleted automatically by a retention sweep.",
        "Group configuration is kept while the bot remains in the group.",
      ],
    },
    {
      heading: "Deleting Your Data",
      items: [
        {
          type: "html",
          html: `Send <code class="cmd-chip">/stop</code> in the private chat with the bot. This immediately removes the bot's record of your subscription. Old DM delivery records are purged within a week. Group configuration is removed when the bot is removed from the group.`,
        },
      ],
    },
    {
      heading: "Security",
      items: [
        "The bot authenticates with Telegram using a confidential token, never shared.",
        "Telegram webhook updates are validated with a secret token.",
        "Database access uses a least-privilege role when configured.",
        "Data at rest is managed by the Supabase hosting provider; access to it is limited to the operators of this bot.",
      ],
    },
    {
      heading: "Contact",
      items: [
        "For questions or data subject requests, contact devathmaj@gmail.com.",
      ],
    },
    {
      heading: "Changes",
      items: [
        "We may update this policy. The \"Last updated\" date above reflects the latest version.",
      ],
    },
  ], NOTIFY_OPTIONS);
}

export function renderTelegramTermsPage() {
  return renderLegalPage("Terms of Service — Notification Bot (Telegram)", [
    {
      heading: "Acceptance of Terms",
      items: [
        "By starting, using, or interacting with the Telegram bot (\"the bot\"), you agree to these terms.",
      ],
    },
    {
      heading: "The Service",
      items: [
        "The bot sends notifications to your private chat and, when added, to groups.",
        {
          type: "table",
          columns: ["Command", "What it does"],
          rows: [
            ["<code class=\"cmd-chip\">/start</code>", "Subscribe to notifications in this chat"],
            ["<code class=\"cmd-chip\">/stop</code>", "Unsubscribe and delete your stored data"],
            ["<code class=\"cmd-chip\">/latest</code>", "Show the newest notification"],
            ["<code class=\"cmd-chip\">/top &lt;n&gt;</code>", "Show the n most recent notifications (1&ndash;100)"],
            ["<code class=\"cmd-chip\">/help</code>", "Show this message"],
          ],
        },
        {
          type: "note",
          text: "In a group chat, new alerts are posted automatically; in a private chat, they are sent to you after /start.",
        },
      ],
    },
    {
      heading: "Acceptable Use",
      items: [
        "To keep the service usable for everyone, you agree to the following restrictions:",
        { type: "list", entries: [
          "Do not use the bot to abuse, harass, or spam other users or groups.",
          "Do not automate commands in a way that bypasses the bot's rate limits.",
          "Do not attempt to gain unauthorized access to the bot's systems or data.",
          "Do not use the bot for any unlawful purpose.",
        ]},
        {
          type: "note",
          text: "We may block or remove access for users or groups that violate these terms.",
        },
      ],
    },
    {
      heading: "Availability",
      items: [
        "The bot is provided \"as is\" and \"as available\". We do not guarantee uninterrupted or error-free operation. The underlying infrastructure runs on third-party providers (including Telegram, Supabase, and our hosting), and we are not responsible for outages, latency, or data loss caused by them.",
      ],
    },
    {
      heading: "Content and Notifications",
      items: [
        "Notifications are generated from posts we publish. We make no warranty about the accuracy, completeness, or timeliness of the content delivered through the bot. You are responsible for how your group uses the bot and for the messages it posts in your groups.",
      ],
    },
    {
      heading: "Data",
      items: [
        {
          type: "html",
          html: `Use of the bot is governed by the <a href="#telegram/privacy">Privacy Policy</a>. You may delete your stored data at any time with <code class="cmd-chip">/stop</code>.`,
        },
      ],
    },
    {
      heading: "Liability",
      items: [
        "To the maximum extent permitted by law, we are not liable for any indirect, incidental, or consequential damages arising from your use of the bot.",
      ],
    },
    {
      heading: "Changes",
      items: [
        "We may update these terms from time to time. The \"Last updated\" date above reflects the latest version. Continued use after changes means you accept the updated terms.",
      ],
    },
    {
      heading: "Contact",
      items: [
        "For questions about these terms, contact devathmaj@gmail.com.",
      ],
    },
  ], NOTIFY_OPTIONS);
}

export function renderTelegramDisclaimerPage() {
  return renderLegalPage("Disclaimer — Notification Bot (Telegram)", [
    {
      heading: "Introduction",
      items: [
        "The Telegram bot (\"the bot\") delivers notifications about vouchers, promotions, and exam offers. The information distributed through the bot is provided for informational purposes only.",
      ],
    },
    {
      heading: "No Warranty on Content",
      items: [
        "We make no warranty — express or implied — regarding the accuracy, completeness, reliability, or timeliness of any notification delivered through the bot. Offers, voucher codes, terms, eligibility criteria, and availability can change or expire at any time without notice.",
      ],
    },
    {
      heading: "Not an Endorsement or Affiliation",
      items: [
        "The bot is an independent project. It is not affiliated with, endorsed by, or sponsored by Telegram, AWS, or any vendor whose promotions appear in the notifications. All product names, logos, and offers belong to their respective owners.",
      ],
    },
    {
      heading: "Your Responsibility",
      items: [
        { type: "list", entries: [
          "Verify any voucher, promotion, or link before relying on it.",
          "Promotions are subject to the issuing vendor's own terms and conditions.",
          "Use of third-party links and services is at your own sole risk.",
          "We are not liable for decisions you make based on content delivered through the bot, or for vouchers/codes that are invalid, expired, or inapplicable to you.",
        ]},
      ],
    },
    {
      heading: "Third-Party Content & Voucher Data",
      items: [
        "Notifications delivered by the bot contain voucher and promotion data collected by Voucher Bot. This data is obtained by scanning publicly available pages across vendor websites; Voucher Bot does not verify the current status of every offer.",
        "Because some pages do not publish a clear date and the bot does not always extract date information reliably, older promotions — including some that may have already expired — can still appear. Automated AI classification may occasionally produce false positives, where non-voucher content is misidentified as a promotion.",
        "Notifications may contain links to external websites. These third-party websites have their own terms of use, privacy policies, and practices, which are outside the control of Voucher Bot. You should always verify any offer directly with the issuing organization before relying on it.",
      ],
    },
    {
      heading: "Availability",
      items: [
        "The bot and its content are provided \"as is\" and \"as available\" with no guarantee of uptime, uninterrupted delivery, or freedom from errors.",
      ],
    },
    {
      heading: "Liability",
      items: [
        "To the maximum extent permitted by law, we are not liable for any direct, indirect, incidental, or consequential loss or damage arising from your use of the bot or reliance on its content.",
      ],
    },
    {
      heading: "Contact",
      items: [
        "For questions about this disclaimer, contact devathmaj@gmail.com.",
      ],
    },
  ], NOTIFY_OPTIONS);
}

export function renderFooter() {
  const footer = document.createElement("footer");
  footer.className = "site-footer";

  footer.innerHTML = `
    <div class="footer-links">
      <a href="#">Home</a>
      <span class="footer-sep">&middot;</span>
      <a href="#notifications">Notifications</a>
      <span class="footer-sep">&middot;</span>
      <a href="#about">About</a>
      <span class="footer-sep">&middot;</span>
      <a href="#privacy">Privacy Policy</a>
      <span class="footer-sep">&middot;</span>
      <a href="#terms">Terms of Use</a>
      <span class="footer-sep">&middot;</span>
      <a href="#disclaimer">Disclaimer</a>
      <span class="footer-sep">&middot;</span>
      <a href="https://github.com/Devathmaj/VoucherBot" target="_blank" rel="noopener noreferrer">GitHub</a>
    </div>
    <p class="footer-disclaimer">
      Voucher Tracker is an independent, open-source aggregator of publicly available certification promotions. We are not affiliated with or endorsed by the organizations whose offers are listed. All trademarks and promotions remain the property of their respective owners.
    </p>
    <p class="footer-copy">&copy; ${new Date().getFullYear()} Voucher Tracker. Open-source project.</p>
  `;

  return footer;
}
