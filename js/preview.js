/* ==========================================================================
   preview.js — Live CV paper rendering from CVState
   ========================================================================== */

/* ── Escape helper ────────────────────────────────────────────────────────── */

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;");
}

/* ── Date formatting ──────────────────────────────────────────────────────── */

function formatDates(start, end, isCurrent) {
  if (!start && !end) return "";
  if (isCurrent)      return (start || "") + " – Present";
  if (start && end)   return start + " – " + end;
  return start || end || "";
}

/* ── Section builder helpers ──────────────────────────────────────────────── */

function cvSection(title, bodyHtml) {
  return (
    '<div class="cv-section">' +
      '<h3 class="cv-section-title">' + title + '</h3>' +
      bodyHtml +
    '</div>'
  );
}

function cvItemRow(leftHtml, dateStr, metaHtml, descHtml) {
  return (
    '<div class="cv-item">' +
      '<div class="cv-item-header">' +
        '<div>' + leftHtml + '</div>' +
        (dateStr ? '<span class="cv-item-date">' + escapeHtml(dateStr) + '</span>' : '') +
      '</div>' +
      (metaHtml ? '<div class="cv-item-meta">' + metaHtml + '</div>' : '') +
      (descHtml ? '<div class="cv-item-desc">' + descHtml + '</div>' : '') +
    '</div>'
  );
}

function skillTagList(items) {
  var tags = items.map(function(t) {
    return '<span class="cv-skill-tag">' + escapeHtml(t) + '</span>';
  });
  return '<div class="cv-skills-tags">' + tags.join("") + '</div>';
}

/* ── Main render ──────────────────────────────────────────────────────────── */

function renderCvPreview(state) {
  var paper = document.getElementById("cvPaper");
  if (!paper) return;

  var p     = state.personalInfo || {};
  var links = p.socialLinks     || {};

  /* Build contact line */
  var contactParts = [];
  if (p.address)       contactParts.push(escapeHtml(p.address));
  if (p.email)         contactParts.push(escapeHtml(p.email));
  if (p.phone)         contactParts.push(escapeHtml(p.phone));
  if (links.linkedin)  contactParts.push(escapeHtml(links.linkedin));
  if (links.github)    contactParts.push(escapeHtml(links.github));
  if (links.website)   contactParts.push(escapeHtml(links.website));
  if (links.behance)   contactParts.push(escapeHtml(links.behance));

  var contactHtml = contactParts.map(function(item) {
    return '<span class="cv-contact-item">' + item + '</span>';
  }).join(' <span class="cv-contact-sep">|</span> ');

  var html = (
    '<div class="cv-header">' +
      '<h1 class="cv-name">' + escapeHtml(p.fullName || "YOUR NAME") + '</h1>' +
      (p.professionalTitle ? '<div class="cv-professional-title">' + escapeHtml(p.professionalTitle) + '</div>' : '') +
      '<div class="cv-contact-line">' + contactHtml + '</div>' +
    '</div>' +
    '<hr class="cv-divider">'
  );

  /* Summary */
  if (state.summary && state.summary.trim()) {
    html += cvSection("PROFESSIONAL SUMMARY", '<p class="cv-summary-text">' + escapeHtml(state.summary) + '</p>');
  }

  /* Experience */
  if (state.experience && state.experience.length) {
    var expHtml = "";
    for (var i = 0; i < state.experience.length; i++) {
      var exp = state.experience[i];
      var leftHtml = '<span class="cv-item-role">' + escapeHtml(exp.jobTitle || "") + '</span>' +
        (exp.company  ? '<span class="cv-item-org">, '   + escapeHtml(exp.company)  + '</span>' : '') +
        (exp.location ? '<span class="cv-item-org"> — ' + escapeHtml(exp.location) + '</span>' : '');
      expHtml += cvItemRow(leftHtml, formatDates(exp.startDate, exp.endDate, exp.currentlyWorking), "", exp.description ? escapeHtml(exp.description) : "");
    }
    html += cvSection("PROFESSIONAL EXPERIENCE", expHtml);
  }

  /* Education */
  if (state.education && state.education.length) {
    var eduHtml = "";
    for (var i = 0; i < state.education.length; i++) {
      var edu = state.education[i];
      var leftHtml = '<span class="cv-item-role">' + escapeHtml(edu.degree || "") + '</span>' +
        (edu.institution ? '<span class="cv-item-org"> — ' + escapeHtml(edu.institution) + '</span>' : '');
      eduHtml += cvItemRow(leftHtml, formatDates(edu.startDate, edu.graduationDate), edu.gpa ? "GPA: " + escapeHtml(edu.gpa) : "", edu.description ? escapeHtml(edu.description) : "");
    }
    html += cvSection("EDUCATION", eduHtml);
  }

  /* Skills */
  if (state.skills && state.skills.length) {
    var tags = state.skills.map(function(sk) {
      return escapeHtml(sk.name) + (sk.level ? " (" + sk.level + ")" : "");
    });
    html += cvSection("SKILLS & EXPERTISE", skillTagList(tags));
  }

  /* Projects */
  if (state.projects && state.projects.length) {
    var projHtml = "";
    for (var i = 0; i < state.projects.length; i++) {
      var proj = state.projects[i];
      var leftHtml = '<span class="cv-item-role">' + escapeHtml(proj.name) + '</span>' +
        (proj.role ? '<span class="cv-item-org"> (' + escapeHtml(proj.role) + ')</span>' : '');
      
      var techList = Array.isArray(proj.technologies) ? proj.technologies : (proj.technologies ? String(proj.technologies).split(",") : []);
      var techLine = techList.length
        ? '<strong>Tech:</strong> ' + techList.map(escapeHtml).join(", ")
        : "";
      
      var descPart = (proj.description ? escapeHtml(proj.description) : "") + 
        (techLine ? '<div style="font-size:0.8rem;color:#64748b;margin-top:3px;">' + techLine + '</div>' : "");

      projHtml += cvItemRow(leftHtml, formatDates(proj.startDate, proj.endDate), "", descPart);
    }
    html += cvSection("KEY PROJECTS", projHtml);
  }

  /* Services */
  if (state.services && state.services.length) {
    var srvHtml = "";
    for (var i = 0; i < state.services.length; i++) {
      var srv = state.services[i];
      srvHtml += cvItemRow('<span class="cv-item-role">' + escapeHtml(srv.title) + '</span>', "", "", escapeHtml(srv.description));
    }
    html += cvSection("SERVICES OFFERED", srvHtml);
  }

  /* Certifications */
  if (state.certifications && state.certifications.length) {
    var certHtml = "";
    for (var i = 0; i < state.certifications.length; i++) {
      var cert = state.certifications[i];
      var leftHtml = '<span class="cv-item-role">' + escapeHtml(cert.name) + '</span>' +
        (cert.organization ? '<span class="cv-item-org"> — ' + escapeHtml(cert.organization) + '</span>' : '');
      certHtml += cvItemRow(leftHtml, cert.issueDate ? escapeHtml(cert.issueDate) : "", "", "");
    }
    html += cvSection("CERTIFICATIONS", certHtml);
  }

  /* Courses */
  if (state.courses && state.courses.length) {
    var coursesHtml = "";
    for (var i = 0; i < state.courses.length; i++) {
      var c = state.courses[i];
      var leftHtml = '<span class="cv-item-role">' + escapeHtml(c.name) + '</span>' +
        (c.organization ? '<span class="cv-item-org"> — ' + escapeHtml(c.organization) + '</span>' : '');
      coursesHtml += cvItemRow(leftHtml, "", "", "");
    }
    html += cvSection("COURSES & TRAINING", coursesHtml);
  }

  /* Awards */
  if (state.awards && state.awards.length) {
    var awardsHtml = "";
    for (var i = 0; i < state.awards.length; i++) {
      var a = state.awards[i];
      var leftHtml = '<span class="cv-item-role">' + escapeHtml(a.name) + '</span>' +
        (a.organization ? '<span class="cv-item-org"> — ' + escapeHtml(a.organization) + '</span>' : '');
      awardsHtml += cvItemRow(leftHtml, "", "", "");
    }
    html += cvSection("HONORS & AWARDS", awardsHtml);
  }

  /* Volunteer */
  if (state.volunteer && state.volunteer.length) {
    var volHtml = "";
    for (var i = 0; i < state.volunteer.length; i++) {
      var v = state.volunteer[i];
      var leftHtml = '<span class="cv-item-role">' + escapeHtml(v.name) + '</span>' +
        (v.organization ? '<span class="cv-item-org"> — ' + escapeHtml(v.organization) + '</span>' : '');
      volHtml += cvItemRow(leftHtml, "", "", "");
    }
    html += cvSection("VOLUNTEER WORK", volHtml);
  }

  /* Organizations */
  if (state.organizations && state.organizations.length) {
    var orgHtml = "";
    for (var i = 0; i < state.organizations.length; i++) {
      var o = state.organizations[i];
      var leftHtml = '<span class="cv-item-role">' + escapeHtml(o.name) + '</span>' +
        (o.organization ? '<span class="cv-item-org"> — ' + escapeHtml(o.organization) + '</span>' : '');
      orgHtml += cvItemRow(leftHtml, "", "", "");
    }
    html += cvSection("ORGANIZATIONS", orgHtml);
  }

  /* Languages */
  if (state.languages && state.languages.length) {
    var langTags = state.languages.map(function(lang) {
      return escapeHtml(lang.language) + ": " + escapeHtml(lang.proficiency || "Proficient");
    });
    html += cvSection("LANGUAGES", skillTagList(langTags));
  }

  /* Regional / Personal Details */
  if (state.regionalDetails && state.regionalDetails.enabled) {
    var r = state.regionalDetails;
    var fields = "";
    if (r.dateOfBirth)    fields += '<div><strong>Date of Birth:</strong> '   + escapeHtml(r.dateOfBirth)   + '</div>';
    if (r.nationality)    fields += '<div><strong>Nationality:</strong> '      + escapeHtml(r.nationality)   + '</div>';
    if (r.maritalStatus)  fields += '<div><strong>Marital Status:</strong> '   + escapeHtml(r.maritalStatus) + '</div>';
    if (r.militaryStatus) fields += '<div><strong>Military Status:</strong> ' + escapeHtml(r.militaryStatus) + '</div>';
    if (fields) {
      html += cvSection("PERSONAL DETAILS", '<div class="cv-personal-details">' + fields + '</div>');
    }
  }

  /* References */
  if (state.references && state.references.availableUponRequest) {
    html += cvSection("REFERENCES", '<p style="font-size:0.85rem;color:#64748b;font-style:italic;">References available upon request.</p>');
  }

  paper.innerHTML = html;

  /* Apply customization */
  var c = state.customization;
  if (c) {
    if (c.primaryColor) {
      var titles = paper.querySelectorAll(".cv-section-title");
      for (var i = 0; i < titles.length; i++) {
        titles[i].style.color = c.primaryColor;
      }
    }
    if (c.font) {
      paper.style.fontFamily = "'" + c.font + "', sans-serif";
    }
  }
}

/* ── Init ─────────────────────────────────────────────────────────────────── */

window.initCvPreview = function() {
  renderCvPreview(window.CVState.getState());

  window.CVState.subscribe(function(newState) {
    renderCvPreview(newState);
  });
};
