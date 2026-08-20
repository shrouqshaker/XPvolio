/* HTML escaping helper — prevents XSS from user-entered data */
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* Date formatting */
function formatDates(start, end, isCurrent) {
  if (!start && !end) return "";
  if (isCurrent) return `${escapeHtml(start) || ""} – Present`;
  if (start && end) return `${escapeHtml(start)} – ${escapeHtml(end)}`;
  return escapeHtml(start) || escapeHtml(end) || "";
}

/* Section builder helpers */
function cvSection(title, bodyHtml) {
  return `
    <div class="cv-section">
      <h3 class="cv-section-title">${title}</h3>
      ${bodyHtml}
    </div>
  `;
}

function cvItemRow(leftHtml, dateStr, metaHtml, descHtml) {
  return `
    <div class="cv-item">
      <div class="cv-item-header">
        <div>${leftHtml}</div>
        ${dateStr ? `<span class="cv-item-date">${dateStr}</span>` : ""}
      </div>
      ${metaHtml ? `<div class="cv-item-meta">${metaHtml}</div>` : ""}
      ${descHtml ? `<div class="cv-item-desc">${descHtml}</div>` : ""}
    </div>
  `;
}

function skillTagList(items) {
  var tags = items.map((t) => `<span class="cv-skill-tag">${t}</span>`);
  return `<div class="cv-skills-tags">${tags.join("")}</div>`;
}

/* Main render (Optimized & Short) */
function renderCvPreview(state) {
  var paper = document.getElementById("cvPaper");
  if (!paper) return;

  var p = state.personalInfo || {};
  var links = p.socialLinks || {};

  /* Build contact line dynamically using map & filter */
  var contactValues = [
    p.address,
    p.email,
    p.phone,
    links.linkedin,
    links.github,
    links.website,
    links.behance,
  ];
  var contactHtml = contactValues
    .filter(Boolean) // بيشيل أي قيمة فاضية أو null تلقائياً
    .map((item) => `<span class="cv-contact-item">${escapeHtml(item)}</span>`)
    .join(' <span class="cv-contact-sep">|</span> ');

  var html = `
    <div class="cv-header">
      <h1 class="cv-name">${escapeHtml(p.fullName) || "YOUR NAME"}</h1>
      ${p.professionalTitle ? `<div class="cv-professional-title">${escapeHtml(p.professionalTitle)}</div>` : ""}
      <div class="cv-contact-line">${contactHtml}</div>
    </div>
    <hr class="cv-divider">
  `;

  /* Summary */
  if (state.summary?.trim()) {
    html += cvSection(
      "PROFESSIONAL SUMMARY",
      `<p class="cv-summary-text">${escapeHtml(state.summary)}</p>`,
    );
  }

  /* Experience */
  if (state.experience?.length) {
    var expHtml = state.experience
      .map((exp) => {
        var leftHtml = `
        <span class="cv-item-role">${escapeHtml(exp.jobTitle) || ""}</span>
        ${exp.company ? `<span class="cv-item-org">, ${escapeHtml(exp.company)}</span>` : ""}
        ${exp.location ? `<span class="cv-item-org"> — ${escapeHtml(exp.location)}</span>` : ""}
      `;
        return cvItemRow(
          leftHtml,
          formatDates(exp.startDate, exp.endDate, exp.currentlyWorking),
          "",
          escapeHtml(exp.description) || "",
        );
      })
      .join("");

    html += cvSection("PROFESSIONAL EXPERIENCE", expHtml);
  }

  /* Education */
  if (state.education?.length) {
    var eduHtml = state.education
      .map((edu) => {
        var leftHtml = `
        <span class="cv-item-role">${escapeHtml(edu.degree) || ""}</span>
        ${edu.institution ? `<span class="cv-item-org"> — ${escapeHtml(edu.institution)}</span>` : ""}
      `;
        return cvItemRow(
          leftHtml,
          formatDates(edu.startDate, edu.graduationDate),
          edu.gpa ? `GPA: ${escapeHtml(edu.gpa)}` : "",
          escapeHtml(edu.description) || "",
        );
      })
      .join("");

    html += cvSection("EDUCATION", eduHtml);
  }

  /* Skills */
  if (state.skills?.length) {
    var tags = state.skills.map((sk) =>
      sk.level
        ? `${escapeHtml(sk.name)} (${escapeHtml(sk.level)})`
        : escapeHtml(sk.name),
    );
    html += cvSection("SKILLS & EXPERTISE", skillTagList(tags));
  }

  /* Projects */
  if (state.projects?.length) {
    var projHtml = state.projects
      .map((proj) => {
        var leftHtml = `
        <span class="cv-item-role">${escapeHtml(proj.name)}</span>
        ${proj.role ? `<span class="cv-item-org"> (${escapeHtml(proj.role)})</span>` : ""}
      `;

        var techList = Array.isArray(proj.technologies)
          ? proj.technologies
          : proj.technologies
            ? String(proj.technologies).split(",")
            : [];

        var techLine = techList.length
          ? `<strong>Tech:</strong> ${techList.map((t) => escapeHtml(t.trim())).join(", ")}`
          : "";
        var descPart =
          (escapeHtml(proj.description) || "") +
          (techLine
            ? `<div style="font-size:0.8rem;color:#64748b;margin-top:3px;">${techLine}</div>`
            : "");

        return cvItemRow(
          leftHtml,
          formatDates(proj.startDate, proj.endDate),
          "",
          descPart,
        );
      })
      .join("");

    html += cvSection("KEY PROJECTS", projHtml);
  }

  /* Services */
  if (state.services?.length) {
    var srvHtml = state.services
      .map((srv) =>
        cvItemRow(
          `<span class="cv-item-role">${escapeHtml(srv.title) || ""}</span>`,
          "",
          "",
          escapeHtml(srv.description) || "",
        ),
      )
      .join("");
    html += cvSection("SERVICES OFFERED", srvHtml);
  }

  /* ── الأقسام المتشابهة (Courses, Awards, Volunteer, Organizations, Certifications) ── */
  var simpleListSections = [
    {
      key: "certifications",
      title: "CERTIFICATIONS",
      getDate: (c) => c.issueDate || "",
    },
    { key: "courses", title: "COURSES & TRAINING", getDate: () => "" },
    { key: "awards", title: "HONORS & AWARDS", getDate: () => "" },
    { key: "volunteer", title: "VOLUNTEER WORK", getDate: () => "" },
    { key: "organizations", title: "ORGANIZATIONS", getDate: () => "" },
  ];

  simpleListSections.forEach((sec) => {
    if (state[sec.key]?.length) {
      var sectionHtml = state[sec.key]
        .map((item) => {
          var leftHtml = `
            <span class="cv-item-role">${escapeHtml(item.name) || ""}</span>
            ${item.organization ? `<span class="cv-item-org"> — ${escapeHtml(item.organization)}</span>` : ""}
          `;
          return cvItemRow(leftHtml, escapeHtml(sec.getDate(item)), "", "");
        })
        .join("");

      html += cvSection(sec.title, sectionHtml);
    }
  });

  /* Languages */
  if (state.languages?.length) {
    var langTags = state.languages.map(
      (lang) =>
        `${escapeHtml(lang.language)}: ${escapeHtml(lang.proficiency || "Proficient")}`,
    );
    html += cvSection("LANGUAGES", skillTagList(langTags));
  }

  /* Regional / Personal Details */
  if (state.regionalDetails?.enabled) {
    var r = state.regionalDetails;
    var fields = [
      r.dateOfBirth
        ? `<div><strong>Date of Birth:</strong> ${escapeHtml(r.dateOfBirth)}</div>`
        : "",
      r.nationality
        ? `<div><strong>Nationality:</strong> ${escapeHtml(r.nationality)}</div>`
        : "",
      r.maritalStatus
        ? `<div><strong>Marital Status:</strong> ${escapeHtml(r.maritalStatus)}</div>`
        : "",
      r.militaryStatus
        ? `<div><strong>Military Status:</strong> ${escapeHtml(r.militaryStatus)}</div>`
        : "",
    ]
      .filter(Boolean)
      .join("");

    if (fields) {
      html += cvSection(
        "PERSONAL DETAILS",
        `<div class="cv-personal-details">${fields}</div>`,
      );
    }
  }

  /* References */
  if (state.references?.availableUponRequest) {
    html += cvSection(
      "REFERENCES",
      '<p style="font-size:0.85rem;color:#64748b;font-style:italic;">References available upon request.</p>',
    );
  }

  paper.innerHTML = html;

  /* Apply customization */
  var c = state.customization;
  if (c) {
    if (c.primaryColor) {
      paper
        .querySelectorAll(".cv-section-title")
        .forEach((el) => (el.style.color = c.primaryColor));
    }
    if (c.font) {
      paper.style.fontFamily = `'${c.font}', sans-serif`;
    }
  }
}

window.initCvPreview = function () {
  renderCvPreview(window.CVState.getState());
  window.CVState.subscribe(renderCvPreview);
};
