// src/companyInfo.js  (dummy/sample data)
export const companyInfo = {
  name: "i-Computer Web",
  shortName: "i-Computer",
  website: "https://i-computerweb.com",
  email: "support@i-computerweb.com",
  phone: "+94 77 123 4567",
  location: "Remote (Sri Lanka) / Worldwide",
  hours: "Mon–Sat, 9:00 AM – 7:00 PM (IST)",

  tagline: "Modern websites, built fast.",
  about:
    "i-Computer Web designs and develops fast, responsive websites and web apps for startups and growing businesses. We focus on clean UI, strong performance, and SEO-ready builds.",

  services: [
    "Business Websites (Company profile, Landing pages)",
    "E‑commerce Stores (Catalog, Payments, Order management)",
    "Web Apps (Admin dashboards, Portals, Custom tools)",
    "UI/UX Design (Mobile-first, modern layouts)",
    "SEO & Performance Optimization (Core Web Vitals)",
    "Website Maintenance & Support (Updates, backups, fixes)",
    "Hosting & Deployment (Domain, SSL, setup guidance)",
    "Branding Basics (Logo cleanup, colors, typography)",
  ],

  pricing: {
    currency: "USD",
    notes:
      "Final pricing depends on pages, design complexity, integrations, and content readiness.",
    packages: [
      {
        name: "Starter",
        range: "$199 – $499",
        idealFor: "Personal brand / simple business site",
        includes: ["1–3 pages", "Mobile responsive", "Basic SEO", "Contact form"],
        timeline: "2–5 days",
      },
      {
        name: "Business",
        range: "$599 – $1,499",
        idealFor: "SMEs needing a polished web presence",
        includes: [
          "4–10 pages",
          "Custom UI",
          "Speed optimization",
          "On-page SEO",
          "WhatsApp/Email integration",
        ],
        timeline: "1–2 weeks",
      },
      {
        name: "E‑commerce",
        range: "$1,499 – $4,999",
        idealFor: "Online stores",
        includes: [
          "Product catalog",
          "Payments",
          "Shipping setup",
          "Order emails",
          "Admin panel",
        ],
        timeline: "2–4 weeks",
      },
      {
        name: "Custom Web App",
        range: "$2,500+",
        idealFor: "Portals, dashboards, automation tools",
        includes: ["Requirements call", "Custom features", "Auth", "Admin tools"],
        timeline: "Depends on scope",
      },
    ],
  },

  techStack: [
    "React",
    "Next.js",
    "Node.js",
    "Express",
    "MongoDB / PostgreSQL",
    "Tailwind CSS",
  ],

  faq: [
    {
      q: "Do you provide domain and hosting?",
      a: "We can guide you to buy a domain/hosting, or manage setup for you (SSL, DNS, deployment).",
    },
    {
      q: "Can you redesign my existing website?",
      a: "Yes. We can refresh the UI, improve speed, make it mobile-friendly, and fix SEO issues.",
    },
    {
      q: "Do you offer ongoing support?",
      a: "Yes. Monthly maintenance is available for updates, backups, security checks, and small changes.",
    },
  ],

  policies: {
    tone: "friendly, professional, and concise",
    formatting: "use short paragraphs and bullet points when helpful",
  },
};

export function buildCompanyContext() {
  return `
You are the official customer support and sales assistant for ${companyInfo.name} (${companyInfo.website}).

Company details:
- Name: ${companyInfo.name}
- Tagline: ${companyInfo.tagline}
- About: ${companyInfo.about}
- Services: ${companyInfo.services.join(", ")}
- Tech stack: ${companyInfo.techStack.join(", ")}
- Location: ${companyInfo.location}
- Business hours: ${companyInfo.hours}
- Contact: Email ${companyInfo.email}, Phone ${companyInfo.phone}

Pricing (rough estimates, ${companyInfo.pricing.currency}):
${companyInfo.pricing.packages
  .map(
    (p) =>
      `- ${p.name}: ${p.range} | Timeline: ${p.timeline} | Includes: ${p.includes.join(
        ", "
      )}`
  )
  .join("\n")}

FAQ:
${companyInfo.faq.map((x) => `- Q: ${x.q}\n  A: ${x.a}`).join("\n")}

Instructions:
- Stay aligned with ${companyInfo.name}'s services.
- Ask 1–2 clarifying questions when needed (budget, timeline, type of website, pages, features, content readiness).
- If user asks pricing, share package ranges and what affects cost; offer a quick requirements checklist.
- Keep the tone ${companyInfo.policies.tone}. ${companyInfo.policies.formatting}.
`.trim();
}