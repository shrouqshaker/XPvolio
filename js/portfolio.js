const portfolioData = {
  brand: "XPvolio",
  profile: {
    name: "Alexander Wright",
    title: "Senior Full-Stack Engineer & UI Architect",
    description:
      "Passionate about building scalable web applications and elegant user interfaces. With 8+ years of experience, I specialize in React, Node.js, and cloud architecture to deliver high-performance digital products.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDABl91fFucFAlFYSyXcRqJ2wDhMIhv5vSCDpYQMRnTl5Qb1qp-OqudJqKcEW6SrwlL10EYbNsBYeqldF2U-7pvJWJ_S0H0jCjgjIqXyKgvwcsmBiEipZd-csCFoVs2nnOGO1tTZ6-u8mDRt6Rbl3QqQU2Hlm3u-Y86snNicn9H8eIf9Ey3V1OlQwPut3ha6uqfJXz1Vv7gXJyMmVZ9ph0kObshFSeOlStb_JmcoiEVObc_Zq7GzV81",
    links: [
      { href: "mailto:alex@example.com", icon: "mail", label: "mail" },
      { href: "https://linkedin.com", icon: "link", label: "link" },
    ],
  },
  stats: [
    { value: "8+", label: "Years Exp" },
    { value: "45", label: "Projects" },
    { value: "12", label: "Awards" },
    { value: "100%", label: "Success Rate" },
  ],
  experience: [
    {
      period: "2020 - Present",
      role: "Senior Frontend Engineer",
      company: "TechCorp Inc.",
      summary:
        "Lead development of core web platform using React and TypeScript. Managed a team of 4 junior developers.",
    },
    {
      period: "2017 - 2020",
      role: "Full Stack Development",
      company: "StartupXYZ",
      summary:
        "Built full-stack MVP application using Node.js, Express, and Vue.js. Scaled application from 0 to 10k monthly active users.",
    },
  ],
  education: [
    {
      period: "2013 - 2017",
      degree: "B.S. Computer Science",
      school: "University of Technology",
      detail: "StartupXYZ",
    },
  ],
  skills: [
    { name: "React.js", level: 90 },
    { name: "TypeScript", level: 85 },
    { name: "Node.js", level: 75 },
  ],
  technologies: ["Docker", "AWS", "GraphQL", "CI/CD", "PostgreSQL", "Figma"],
};

const responsiveSettings = {
  mobile: {
    profileImage: "img-fluid w-50 h-50",
    sectionTitle: "fs-5",
    description: "fs-6 w-75",
    icon: "fs-6",
    statCard: "p-3",
    button: "px-3 py-2",
    menu: "p-2",
  },
  tablet: {
    profileImage: "img-fluid w-50 h-50",
    sectionTitle: "fs-4",
    description: "fs-5 w-75",
    icon: "fs-5",
    statCard: "p-4",
    button: "px-4 py-3",
    menu: "p-3",
  },
  desktop: {
    profileImage: "img-fluid w-25 h-25",
    sectionTitle: "fs-3",
    description: "fs-5 w-75",
    icon: "fs-4",
    statCard: "p-4",
    button: "px-4 py-3",
    menu: "p-3",
  },
};

function getViewportMode() {
  const width = window.innerWidth;

  if (width < 576) return "mobile";
  if (width < 992) return "tablet";
  return "desktop";
}

function getResponsiveClass(key) {
  const mode = getViewportMode();
  return (
    responsiveSettings[mode]?.[key] || responsiveSettings.desktop[key] || ""
  );
}

function sectionHeader(icon, title) {
  return `
    <div class="portfolio-section-title">
      <span class="material-symbols-outlined text-primary">${icon}</span>
      <div>${title}</div>
    </div>
  `;
}

function renderTimeline(items, isEducation = false) {
  return items
    .map((item, index) => {
      const isActive = index === 0;
      const dotClass =
        isActive && !isEducation ? "timeline-dot" : "timeline-dot is-muted";
      const lastLine =
        index < items.length - 1 ? '<div class="timeline-line"></div>' : "";

      return `
        <div class="timeline-item">
          <div class="timeline-rail">
            <div class="${dotClass}"></div>
            ${lastLine}
          </div>
          <div class="timeline-content">
            <div class="timeline-range">${item.period}</div>
            <div class="fw-bold mb-2">${isEducation ? item.degree : item.role}</div>
            <div class="${isEducation ? "timeline-school" : "timeline-company"} mb-2">${isEducation ? item.school : item.company}</div>
            <div class="mb-2">${isEducation ? item.detail : item.summary}</div>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderSkills() {
  return portfolioData.skills
    .map(
      (skill) => `
        <div class="skill-row">
          <div class="d-flex mb-1 justify-content-between fw-bold">
            <div>${skill.name}</div>
            <div>${skill.level}%</div>
          </div>
          <div class="progress">
            <div class="progress-bar bg-primary" role="progressbar" style="width: ${skill.level}%"></div>
          </div>
        </div>
      `,
    )
    .join("");
}

function renderPortfolio() {
  const root = document.getElementById("portfolio-root");

  if (!root) return;

  root.innerHTML = `
    <div class="portfolio-shell">
      <nav class="portfolio-topbar">
        <div class="portfolio-topbar-inner d-flex align-items-center justify-content-between">
          <div class="portfolio-header-brand">${portfolioData.brand}</div>
          <div class="d-flex align-items-center gap-3">
            <button class="portfolio-action bg-primary text-light ${getResponsiveClass("button")}">
              <span class="material-symbols-outlined ${getResponsiveClass("icon")}">download</span>
              <span>Download CV</span>
            </button>
            <button class="portfolio-menu-btn bg-light ${getResponsiveClass("menu")}" aria-label="Menu">
              <span class="material-symbols-outlined ${getResponsiveClass("icon")}">menu</span>
            </button>
          </div>
        </div>
      </nav>

      <section class="aboutUser">
        <div class="d-flex flex-column align-items-center">
          <div>
            <img class="personalImg ${getResponsiveClass("profileImage")}" src="${portfolioData.profile.image}" alt="${portfolioData.profile.name}" />
          </div>
          <div class="fw-bold m-1 ${getResponsiveClass("sectionTitle")}">${portfolioData.profile.name}</div>
          <div class="fw-light m-1 ${getResponsiveClass("description")}" style="color: rgb(80 95 118)">${portfolioData.profile.title}</div>
          <div class="d-flex justify-content-center align-items-center fw-light m-1 discriptionOfUser ${getResponsiveClass("description")}">
            ${portfolioData.profile.description}
          </div>
          <div class="m-3 d-flex justify-content-center align-content-center gap-4">
            ${portfolioData.profile.links
              .map(
                (link) => `
                  <a class="rounded-circle" href="${link.href}" aria-label="${link.label}">
                    <span class="backgroundLinks material-symbols-outlined text-secondary rounded-circle ${getResponsiveClass("icon")}">${link.icon}</span>
                  </a>
                `,
              )
              .join("")}
          </div>
        </div>
      </section>

      <section class="mt-4 col-12">
        <div class="portfolio-stat-grid d-flex flex-row flex-wrap justify-content-center ">
          ${portfolioData.stats
            .map(
              (stat) => `
                <div class="portfolio-stat-card col-5 ${getResponsiveClass("statCard")}">
                  <div class="d-flex justify-content-center flex-column align-items-center ${getResponsiveClass("statCard")}">
                    <div class="portfolio-stat-value">${stat.value}</div>
                    <div class="portfolio-stat-label">${stat.label}</div>
                  </div>
                </div>
              `,
            )
            .join("")}
        </div>
      </section>

<section class="portfolio-panel ${getResponsiveClass("statCard")}">
        ${sectionHeader("work", "Experience")}
        <div class="timeline-list">
          ${renderTimeline(portfolioData.experience)}
        </div>

        <div class="mt-4">
          ${sectionHeader("school", "Education")}
          <div class="timeline-list">
            ${renderTimeline(portfolioData.education, true)}
          </div>
        </div>
      </section>

      <section class="portfolio-panel">
        <div class="fw-medium fs-3 m-2">Core Skills</div>
        <div class="portfolio-skill-card">
          ${renderSkills()}
        </div>

        <div class="border border-2 my-3"></div>

        <div>
          <div class="fw-medium fs-4 m-2">Other Technologies</div>
          <div class="technology-stack">
            ${portfolioData.technologies.map((tech) => `<div class="backgroundTechnology">${tech}</div>`).join("")}
          </div>
        </div>
      </section>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  renderPortfolio();
  window.addEventListener("resize", renderPortfolio);
});
