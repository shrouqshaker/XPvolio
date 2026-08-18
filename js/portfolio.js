/* ==========================================================================
   portfolio.js — Live Portfolio Page Renderer from CVState
   ========================================================================== */

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;");
}

function sectionHeader(icon, title) {
  return [
    '<div class="portfolio-section-title">',
      '<span class="material-symbols-outlined text-primary fs-5">' + icon + '</span>',
      '<span>' + title + '</span>',
    '</div>'
  ].join("");
}

function renderTimeline(items, isEducation) {
  var html = "";
  for (var i = 0; i < items.length; i++) {
    var item     = items[i];
    var isFirst  = (i === 0);
    var isLast   = (i === items.length - 1);
    var dotClass = (isFirst && !isEducation) ? "timeline-dot" : "timeline-dot is-muted";
    var lineHtml = isLast ? "" : '<div class="timeline-line"></div>';

    var title    = isEducation ? item.degree   : item.role;
    var subtitle = isEducation ? item.school   : item.company;
    var detail   = isEducation ? item.detail   : item.summary;
    var subClass = isEducation ? "timeline-school" : "timeline-company";

    html += [
      '<div class="timeline-item">',
        '<div class="timeline-rail">',
          '<div class="' + dotClass + '"></div>',
          lineHtml,
        '</div>',
        '<div class="timeline-content">',
          (item.period ? '<div class="timeline-range">' + escapeHtml(item.period) + '</div>' : ''),
          '<div class="fw-bold mb-1">' + escapeHtml(title) + '</div>',
          (subtitle ? '<div class="' + subClass + ' mb-2">' + escapeHtml(subtitle) + '</div>' : ''),
          (detail ? '<div class="small text-secondary mb-2">' + escapeHtml(detail) + '</div>' : ''),
        '</div>',
      '</div>'
    ].join("");
  }
  return html;
}

function renderSkillBars(skills) {
  var html = "";
  for (var i = 0; i < skills.length; i++) {
    var skill = skills[i];
    html += [
      '<div class="skill-row">',
        '<div class="d-flex mb-1 justify-content-between fw-semibold small">',
          '<div>' + escapeHtml(skill.name) + '</div>',
          '<div class="text-secondary">' + skill.level + '%</div>',
        '</div>',
        '<div class="progress">',
          '<div class="progress-bar bg-primary" role="progressbar" style="width:' + skill.level + '%"></div>',
        '</div>',
      '</div>'
    ].join("");
  }
  return html;
}

function renderPortfolio() {
  var root = document.getElementById("portfolio-root");
  if (!root) return;

  var state = window.CVState ? window.CVState.getState() : null;
  if (!state) {
    root.innerHTML = '<div class="p-4 text-center text-muted">No CV data found. Please fill in the editor first.</div>';
    return;
  }

  var p     = state.personalInfo || {};
  var links = p.socialLinks     || {};

  /* Social Links */
  var socialLinks = [];
  if (p.email)        socialLinks.push({ href: "mailto:" + p.email,         icon: "mail",   label: "Email" });
  if (links.linkedin) socialLinks.push({ href: "https://" + links.linkedin, icon: "link",   label: "LinkedIn" });
  if (links.github)   socialLinks.push({ href: "https://" + links.github,   icon: "code",   label: "GitHub" });
  if (links.website)  socialLinks.push({ href: "https://" + links.website,  icon: "public", label: "Website" });
  if (links.behance)  socialLinks.push({ href: "https://" + links.behance,  icon: "palette", label: "Behance" });

  var socialHtml = "";
  for (var i = 0; i < socialLinks.length; i++) {
    var sLink = socialLinks[i];
    socialHtml += [
      '<a class="backgroundLinks" href="' + escapeHtml(sLink.href) + '" target="_blank" aria-label="' + sLink.label + '" title="' + sLink.label + '">',
        '<span class="material-symbols-outlined fs-5">' + sLink.icon + '</span>',
      '</a>'
    ].join("");
  }

  /* Experience list */
  var experience = [];
  var exps = state.experience || [];
  for (var eIdx = 0; eIdx < exps.length; eIdx++) {
    var e = exps[eIdx];
    var expPeriod = e.currentlyWorking ? (e.startDate || "") + " – Present" : (e.startDate || "") + (e.endDate ? " – " + e.endDate : "");
    experience.push({
      period:  expPeriod,
      role:    e.jobTitle || "",
      company: e.company  || "",
      summary: e.description || ""
    });
  }

  /* Education list */
  var education = [];
  var edus = state.education || [];
  for (var edIdx = 0; edIdx < edus.length; edIdx++) {
    var ed = edus[edIdx];
    var eduPeriod = (ed.startDate || "") + (ed.graduationDate ? " – " + ed.graduationDate : "");
    education.push({
      period:  eduPeriod,
      degree:  ed.degree      || "",
      school:  ed.institution || "",
      detail:  ed.gpa ? "GPA: " + ed.gpa : (ed.description || "")
    });
  }

  /* Skills & percentages */
  var levelMap = { Beginner: 40, Intermediate: 60, Advanced: 80, Expert: 95 };
  var skills = [];
  var sks = state.skills || [];
  for (var skIdx = 0; skIdx < sks.length; skIdx++) {
    var sk = sks[skIdx];
    skills.push({
      name:  sk.name || "",
      level: levelMap[sk.level] || 60
    });
  }

  /* Projects list */
  var projects = state.projects || [];

  /* Extract unique technologies across projects */
  var technologies = [];
  for (var pIdx = 0; pIdx < projects.length; pIdx++) {
    var techList = Array.isArray(projects[pIdx].technologies)
      ? projects[pIdx].technologies
      : (projects[pIdx].technologies ? String(projects[pIdx].technologies).split(",") : []);

    for (var tIdx = 0; tIdx < techList.length; tIdx++) {
      var tName = techList[tIdx].trim();
      if (tName && technologies.indexOf(tName) === -1) {
        technologies.push(tName);
      }
    }
  }

  /* Services */
  var services = state.services || [];

  /* Certifications & Courses */
  var certifications = state.certifications || [];
  var courses        = state.courses        || [];
  var awards         = state.awards         || [];
  var languages      = state.languages      || [];
  var volunteer      = state.volunteer      || [];
  var organizations  = state.organizations  || [];

  /* ── Stats Grid ── */
  var statCards = [];
  if (experience.length)     statCards.push({ value: experience.length,     label: "Positions" });
  if (projects.length)       statCards.push({ value: projects.length,       label: "Projects" });
  if (skills.length)         statCards.push({ value: skills.length,         label: "Skills" });
  if (certifications.length) statCards.push({ value: certifications.length, label: "Certificates" });
  if (education.length && statCards.length < 4) statCards.push({ value: education.length, label: "Degrees" });

  var statsHtml = "";
  if (statCards.length > 0) {
    statsHtml += '<section class="mt-4"><div class="portfolio-stat-grid">';
    for (var s = 0; s < statCards.length; s++) {
      var stat = statCards[s];
      statsHtml += [
        '<div class="portfolio-stat-card">',
          '<div class="portfolio-stat-value">' + stat.value + '</div>',
          '<div class="portfolio-stat-label">' + stat.label + '</div>',
        '</div>'
      ].join("");
    }
    statsHtml += '</div></section>';
  }

  /* ── Experience & Education Panel ── */
  var expEduHtml = "";
  if (experience.length || education.length) {
    expEduHtml += '<section class="portfolio-panel">';
    if (experience.length) {
      expEduHtml += sectionHeader("work", "Work Experience") + '<div class="timeline-list">' + renderTimeline(experience, false) + '</div>';
    }
    if (education.length) {
      expEduHtml += '<div class="' + (experience.length ? 'mt-4' : '') + '">' + sectionHeader("school", "Education") + '<div class="timeline-list">' + renderTimeline(education, true) + '</div></div>';
    }
    expEduHtml += '</section>';
  }

  /* ── Key Projects Panel ── */
  var projectsHtml = "";
  if (projects.length > 0) {
    var projectCards = "";
    for (var pr = 0; pr < projects.length; pr++) {
      var proj = projects[pr];
      var prTech = Array.isArray(proj.technologies)
        ? proj.technologies
        : (proj.technologies ? String(proj.technologies).split(",") : []);

      var techBadges = "";
      for (var tb = 0; tb < prTech.length; tb++) {
        var badgeText = prTech[tb].trim();
        if (badgeText) {
          techBadges += '<span class="badge-tag">' + escapeHtml(badgeText) + '</span>';
        }
      }

      var projPeriod = (proj.startDate || "") + (proj.endDate ? " – " + proj.endDate : "");

      projectCards += [
        '<div class="portfolio-card-item">',
          '<div class="d-flex justify-content-between align-items-start mb-1">',
            '<h4 class="h6 fw-bold text-dark mb-0">' + escapeHtml(proj.name || "Project") + '</h4>',
            (projPeriod ? '<span class="small text-secondary">' + escapeHtml(projPeriod) + '</span>' : ''),
          '</div>',
          (proj.role ? '<div class="small text-primary fw-medium mb-2">' + escapeHtml(proj.role) + '</div>' : ''),
          (proj.description ? '<p class="small text-secondary mb-2">' + escapeHtml(proj.description) + '</p>' : ''),
          (techBadges ? '<div class="d-flex flex-wrap gap-1 mt-2">' + techBadges + '</div>' : ''),
        '</div>'
      ].join("");
    }

    projectsHtml = (
      '<section class="portfolio-panel">' +
        sectionHeader("folder_open", "Featured Projects") +
        '<div>' + projectCards + '</div>' +
      '</section>'
    );
  }

  /* ── Skills & Tech Stack Panel ── */
  var skillsHtml = "";
  if (skills.length || technologies.length) {
    skillsHtml += '<section class="portfolio-panel">';
    if (skills.length) {
      skillsHtml += sectionHeader("code", "Core Skills") + '<div class="portfolio-skill-card">' + renderSkillBars(skills) + '</div>';
    }
    if (technologies.length) {
      var techTags = "";
      for (var k = 0; k < technologies.length; k++) {
        techTags += '<div class="backgroundTechnology">' + escapeHtml(technologies[k]) + '</div>';
      }
      skillsHtml += (
        '<div class="border-top my-4 pt-3">' +
          '<div class="fw-bold mb-3 small text-uppercase text-secondary">Technologies &amp; Tools</div>' +
          '<div class="technology-stack">' + techTags + '</div>' +
        '</div>'
      );
    }
    skillsHtml += '</section>';
  }

  /* ── Services Panel ── */
  var servicesHtml = "";
  if (services.length > 0) {
    var serviceCards = "";
    for (var sv = 0; sv < services.length; sv++) {
      var srv = services[sv];
      serviceCards += [
        '<div class="portfolio-card-item">',
          '<h4 class="h6 fw-bold text-dark mb-1"><i class="fa-solid fa-check text-primary me-2"></i>' + escapeHtml(srv.title) + '</h4>',
          (srv.description ? '<p class="small text-secondary mb-0">' + escapeHtml(srv.description) + '</p>' : ''),
        '</div>'
      ].join("");
    }

    servicesHtml = (
      '<section class="portfolio-panel">' +
        sectionHeader("handyman", "Services Offered") +
        '<div>' + serviceCards + '</div>' +
      '</section>'
    );
  }

  /* ── Certifications & Awards Panel ── */
  var certsAwardsHtml = "";
  if (certifications.length || courses.length || awards.length) {
    var listItems = "";
    for (var c1 = 0; c1 < certifications.length; c1++) {
      var crt = certifications[c1];
      listItems += [
        '<div class="portfolio-card-item d-flex justify-content-between align-items-center">',
          '<div>',
            '<div class="fw-bold text-dark small"><i class="fa-solid fa-certificate text-warning me-2"></i>' + escapeHtml(crt.name) + '</div>',
            (crt.organization ? '<div class="text-secondary small">' + escapeHtml(crt.organization) + '</div>' : ''),
          '</div>',
          (crt.issueDate ? '<span class="small text-muted">' + escapeHtml(crt.issueDate) + '</span>' : ''),
        '</div>'
      ].join("");
    }
    for (var c2 = 0; c2 < courses.length; c2++) {
      var crs = courses[c2];
      listItems += [
        '<div class="portfolio-card-item">',
          '<div class="fw-bold text-dark small"><i class="fa-solid fa-book-open text-primary me-2"></i>' + escapeHtml(crs.name) + '</div>',
          (crs.organization ? '<div class="text-secondary small">' + escapeHtml(crs.organization) + '</div>' : ''),
        '</div>'
      ].join("");
    }
    for (var a1 = 0; a1 < awards.length; a1++) {
      var awd = awards[a1];
      listItems += [
        '<div class="portfolio-card-item">',
          '<div class="fw-bold text-dark small"><i class="fa-solid fa-trophy text-warning me-2"></i>' + escapeHtml(awd.name) + '</div>',
          (awd.organization ? '<div class="text-secondary small">' + escapeHtml(awd.organization) + '</div>' : ''),
        '</div>'
      ].join("");
    }

    certsAwardsHtml = (
      '<section class="portfolio-panel">' +
        sectionHeader("verified", "Certifications &amp; Achievements") +
        '<div>' + listItems + '</div>' +
      '</section>'
    );
  }

  /* ── Languages Panel ── */
  var languagesHtml = "";
  if (languages.length > 0) {
    var langCards = "";
    for (var lg = 0; lg < languages.length; lg++) {
      var lang = languages[lg];
      langCards += [
        '<div class="portfolio-card-item d-flex justify-content-between align-items-center mb-2">',
          '<span class="fw-bold small text-dark"><i class="fa-solid fa-language text-primary me-2"></i>' + escapeHtml(lang.language) + '</span>',
          '<span class="badge bg-light text-dark border px-2 py-1 small">' + escapeHtml(lang.proficiency || "Proficient") + '</span>',
        '</div>'
      ].join("");
    }

    languagesHtml = (
      '<section class="portfolio-panel">' +
        sectionHeader("translate", "Languages") +
        '<div>' + langCards + '</div>' +
      '</section>'
    );
  }

  /* ── Volunteer & Organizations Panel ── */
  var volOrgHtml = "";
  if (volunteer.length || organizations.length) {
    var voItems = "";
    for (var v1 = 0; v1 < volunteer.length; v1++) {
      var vl = volunteer[v1];
      voItems += [
        '<div class="portfolio-card-item">',
          '<div class="fw-bold text-dark small"><i class="fa-solid fa-hand-holding-heart text-danger me-2"></i>' + escapeHtml(vl.name) + '</div>',
          (vl.organization ? '<div class="text-secondary small">' + escapeHtml(vl.organization) + '</div>' : ''),
        '</div>'
      ].join("");
    }
    for (var o1 = 0; o1 < organizations.length; o1++) {
      var og = organizations[o1];
      voItems += [
        '<div class="portfolio-card-item">',
          '<div class="fw-bold text-dark small"><i class="fa-solid fa-sitemap text-primary me-2"></i>' + escapeHtml(og.name) + '</div>',
          (og.organization ? '<div class="text-secondary small">' + escapeHtml(og.organization) + '</div>' : ''),
        '</div>'
      ].join("");
    }

    volOrgHtml = (
      '<section class="portfolio-panel">' +
        sectionHeader("groups", "Volunteer &amp; Community") +
        '<div>' + voItems + '</div>' +
      '</section>'
    );
  }

  /* Summary / Description text */
  var aboutText = state.summary || p.address || "";

  root.innerHTML = [
    '<div class="portfolio-shell">',
      '<nav class="portfolio-topbar">',
        '<div class="portfolio-topbar-inner d-flex align-items-center justify-content-between">',
          '<div class="portfolio-header-brand"><i class="fa-solid fa-file-signature me-1"></i> XPvolio</div>',
          '<div class="d-flex align-items-center gap-2">',
            '<button class="portfolio-action" onclick="window.print()">',
              '<span class="material-symbols-outlined fs-6">download</span>',
              '<span>Print / PDF</span>',
            '</button>',
          '</div>',
        '</div>',
      '</nav>',

      '<section class="aboutUser">',
        '<div class="d-flex flex-column align-items-center text-center">',
          '<div class="fw-bold fs-3 text-dark mb-1">' + escapeHtml(p.fullName || "Your Name") + '</div>',
          (p.professionalTitle ? '<div class="fs-5 text-primary fw-medium mb-2">' + escapeHtml(p.professionalTitle) + '</div>' : ''),
          (p.address ? '<div class="small text-secondary mb-2"><i class="fa-solid fa-location-dot me-1"></i>' + escapeHtml(p.address) + '</div>' : ''),
          (aboutText ? '<p class="discriptionOfUser mb-3 small">' + escapeHtml(aboutText) + '</p>' : ''),
          (socialHtml ? '<div class="d-flex justify-content-center flex-wrap gap-2 mt-2">' + socialHtml + '</div>' : ''),
        '</div>',
      '</section>',

      statsHtml,
      expEduHtml,
      projectsHtml,
      skillsHtml,
      servicesHtml,
      certsAwardsHtml,
      languagesHtml,
      volOrgHtml,
    '</div>'
  ].join("");
}

/* ── Init ───────────────────────────────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", function() {
  renderPortfolio();
  if (window.CVState) {
    window.CVState.subscribe(renderPortfolio);
  }
});
