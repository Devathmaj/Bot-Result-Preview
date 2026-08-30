import { escapeHtml } from "../utils.js";

export function renderDonatePage() {
  const page = document.createElement("div");
  page.className = "legal-page donate-page";

  const header = document.createElement("header");
  header.className = "legal-header";
  header.innerHTML = `<a href="/" class="legal-back">&larr; Back to vouchers</a><h1>Support VoucherBot</h1><p class="legal-last-updated">Keep the lights on &amp; the vouchers coming</p>`;
  page.appendChild(header);

  const intro = document.createElement("section");
  intro.className = "legal-section";
  intro.innerHTML = `
    <p>
      VoucherBot automatically discovers certification discounts, free exam vouchers,
      beta exam opportunities, and training promotions — and pushes them to you the
      moment they appear. It runs 24&nbsp;/&nbsp;7 so you never miss a deal.
    </p>
    <p>
      After setting up the notification service, the Render free tier no longer covers
      two instances running around the clock. Your support helps keep everything
      online and growing.
    </p>
  `;
  page.appendChild(intro);

  const methods = document.createElement("section");
  methods.className = "legal-section";
  methods.innerHTML = `<h2>Ways to support</h2>`;
  page.appendChild(methods);

  const grid = document.createElement("div");
  grid.className = "donate-methods";

  const options = [
    {
      name: "Buy Me a Coffee",
      desc: "A quick one-time thank-you — like buying the developer a coffee.",
      href: "https://buymeacoffee.com/devathmaj",
      btnClass: "donate-btn--coffee",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`,
    },
    {
      name: "PayPal",
      desc: "Send a one-time donation of any amount via PayPal.",
      href: "https://paypal.me/Devathmaj",
      btnClass: "donate-btn--paypal",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    },
    {
      name: "Patreon",
      desc: "Subscribe for ongoing support and behind-the-scenes updates.",
      href: "https://www.patreon.com/cw/devathmaj",
      btnClass: "donate-btn--patreon",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M12 6v12"/><path d="M8 10l4-2 4 2"/></svg>`,
    },
    {
      name: "UPI",
      desc: "Send directly via any UPI app.",
      href: "upi://pay?pa=devathmaj@oksbi",
      btnClass: "donate-btn--upi",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>`,
      isUpi: true,
    },
  ];

  for (const opt of options) {
    const card = document.createElement("a");
    card.className = `donate-method-card ${opt.btnClass}`;

    if (opt.isUpi) {
      card.href = "#";
      card.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
          await navigator.clipboard.writeText("devathmaj@oksbi");
          const nameEl = card.querySelector(".donate-method-name");
          const orig = nameEl.textContent;
          nameEl.textContent = "Copied!";
          setTimeout(() => { nameEl.textContent = orig; }, 2000);
        } catch {
          prompt("Copy this UPI ID:", "devathmaj@oksbi");
        }
      });
    } else {
      card.href = opt.href;
      card.target = "_blank";
      card.rel = "noopener noreferrer";
    }

    card.innerHTML = `
      <span class="donate-method-icon" aria-hidden="true">${opt.icon}</span>
      <span class="donate-method-name">${escapeHtml(opt.name)}</span>
      <span class="donate-method-desc">${escapeHtml(opt.desc)}</span>
      <span class="donate-method-arrow" aria-hidden="true">&rarr;</span>
    `;
    grid.appendChild(card);
  }
  methods.appendChild(grid);

  const note = document.createElement("section");
  note.className = "legal-section";
  note.innerHTML = `
    <h2>Every bit helps</h2>
    <p>
      Even a small contribution goes a long way — it covers server costs, keeps the
      notification bots running, and lets us add new certification sources and features.
      If VoucherBot has helped you save on an exam, consider giving back so it can
      help others too.
    </p>
    <p>
      Thank you for being part of the community.
    </p>
  `;
  page.appendChild(note);

  return page;
}
