const LAST_UPDATED = "July 24, 2026";

function escapeHtml(str) {
  if (typeof str !== "string") return str ?? "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function renderLegalPage(title, sections) {
  const page = document.createElement("div");
  page.className = "legal-page";

  const h = document.createElement("header");
  h.className = "legal-header";
  h.innerHTML = `<a href="#" class="legal-back">&larr; Back to vouchers</a><h1>${escapeHtml(title)}</h1><p class="legal-last-updated">Last updated: ${LAST_UPDATED}</p>`;
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
      heading: "Limitations &amp; False Positives",
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

export function renderFooter() {
  const footer = document.createElement("footer");
  footer.className = "site-footer";

  footer.innerHTML = `
    <div class="footer-links">
      <a href="#">Home</a>
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
