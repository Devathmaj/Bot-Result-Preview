export function renderHowItWorks() {
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
    <section class="how-it-works" id="how-it-works" aria-labelledby="hiw-heading">
      <div class="container">
        <h2 class="section-heading" id="hiw-heading">How listings are collected</h2>
        <ol class="hiw-steps">
          ${steps
            .map(
              (s, i) => `
                <li class="hiw-step">
                  <span class="hiw-num" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
                  <h3 class="hiw-title">${s.title}</h3>
                  <p class="hiw-text">${s.text}</p>
                </li>`
            )
            .join("")}
        </ol>
        <p class="ai-note">
          The &ldquo;AI&rdquo; marker on each listing reflects how confident the automated analysis was when identifying it as an opportunity. It is not a verification of the offer.
        </p>
      </div>
    </section>
  `;
}
