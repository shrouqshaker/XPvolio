function renderCvPreview(state) {
  const paper = document.getElementById("cvPaper");
  if (!paper) return;

  const p = state.personalInfo || {};
  const links = p.socialLinks || {};

  const contactItems = [];
  if (p.address || p.city || p.country) {
    contactItems.push(escapeHtml(p.address || `${p.city || ''}, ${p.country || ''}`));
  }
  if (p.email) contactItems.push(escapeHtml(p.email));
  if (p.phone) contactItems.push(escapeHtml(p.phone));
  if (links.linkedin) contactItems.push(escapeHtml(links.linkedin));
  if (links.github) contactItems.push(escapeHtml(links.github));
  if (links.website) contactItems.push(escapeHtml(links.website));

  let html = `
    <div class="cv-header">
      <h1 class="cv-name">${escapeHtml(p.fullName || 'ALEX RIVERA')}</h1>
      <div class="cv-contact-line">
        ${contactItems.map(item => `<span class="cv-contact-item">${item}</span>`).join(' <span class="cv-contact-sep">|</span> ')}
      </div>
    </div>
    <hr class="cv-divider">
  `;

  if (state.summary && state.summary.trim()) {
    html += `
      <div class="cv-section">
        <h3 class="cv-section-title">PROFESSIONAL SUMMARY</h3>
        <p class="cv-summary-text">${escapeHtml(state.summary)}</p>
      </div>
    `;
  }

  if (state.experience && state.experience.length > 0) {
    html += `
      <div class="cv-section">
        <h3 class="cv-section-title">PROFESSIONAL EXPERIENCE</h3>
        ${state.experience.map(exp => `
          <div class="cv-item">
            <div class="cv-item-header">
              <div>
                <span class="cv-item-role">${escapeHtml(exp.jobTitle || '')}</span>
                ${exp.company ? `<span class="cv-item-org">, ${escapeHtml(exp.company)}</span>` : ''}
                ${exp.location ? `<span class="cv-item-org"> — ${escapeHtml(exp.location)}</span>` : ''}
              </div>
              <span class="cv-item-date">${formatDates(exp.startDate, exp.endDate, exp.currentlyWorking)}</span>
            </div>
            ${exp.description ? `<div class="cv-item-desc">${escapeHtml(exp.description)}</div>` : ''}
            ${exp.responsibilities && exp.responsibilities.length ? `
              <ul style="margin-top:6px; padding-left:20px; font-size:0.85rem; color:#334155;">
                ${exp.responsibilities.map(r => `<li>${escapeHtml(r)}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  if (state.education && state.education.length > 0) {
    html += `
      <div class="cv-section">
        <h3 class="cv-section-title">EDUCATION</h3>
        ${state.education.map(edu => `
          <div class="cv-item">
            <div class="cv-item-header">
              <div>
                <span class="cv-item-role">${escapeHtml(edu.degree || '')}</span>
                ${edu.institution ? `<span class="cv-item-org"> — ${escapeHtml(edu.institution)}</span>` : ''}
              </div>
              <span class="cv-item-date">${formatDates(edu.startDate, edu.graduationDate, edu.currentlyStudying)}</span>
            </div>
            ${edu.gpa ? `<div style="font-size:0.82rem; color:#64748b; margin-top:2px;">GPA: ${escapeHtml(edu.gpa)}</div>` : ''}
            ${edu.description ? `<div class="cv-item-desc">${escapeHtml(edu.description)}</div>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  if (state.skills && state.skills.length > 0) {
    html += `
      <div class="cv-section">
        <h3 class="cv-section-title">SKILLS & EXPERTISE</h3>
        <div class="cv-skills-tags">
          ${state.skills.map(sk => `
            <span class="cv-skill-tag">${escapeHtml(sk.name)}${sk.level ? ` (${sk.level})` : ''}</span>
          `).join('')}
        </div>
      </div>
    `;
  }

  if (state.projects && state.projects.length > 0) {
    html += `
      <div class="cv-section">
        <h3 class="cv-section-title">KEY PROJECTS</h3>
        ${state.projects.map(proj => `
          <div class="cv-item">
            <div class="cv-item-header">
              <div>
                <span class="cv-item-role">${escapeHtml(proj.name)}</span>
                ${proj.role ? `<span class="cv-item-org"> (${escapeHtml(proj.role)})</span>` : ''}
              </div>
              <span class="cv-item-date">${formatDates(proj.startDate, proj.endDate)}</span>
            </div>
            ${proj.description ? `<div class="cv-item-desc">${escapeHtml(proj.description)}</div>` : ''}
            ${proj.technologies && proj.technologies.length ? `
              <div style="font-size:0.8rem; color:#64748b; margin-top:3px;"><strong>Tech:</strong> ${proj.technologies.map(t => escapeHtml(t)).join(', ')}</div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  if (state.services && state.services.length > 0) {
    html += `
      <div class="cv-section">
        <h3 class="cv-section-title">SERVICES OFFERED</h3>
        ${state.services.map(srv => `
          <div class="cv-item">
            <span class="cv-item-role">${escapeHtml(srv.title)}</span>
            ${srv.description ? `<div class="cv-item-desc">${escapeHtml(srv.description)}</div>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  if (state.certifications && state.certifications.length > 0) {
    html += `
      <div class="cv-section">
        <h3 class="cv-section-title">CERTIFICATIONS</h3>
        ${state.certifications.map(cert => `
          <div class="cv-item">
            <div class="cv-item-header">
              <span class="cv-item-role">${escapeHtml(cert.name)} - ${escapeHtml(cert.organization)}</span>
              <span class="cv-item-date">${cert.issueDate || ''}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  if (state.languages && state.languages.length > 0) {
    html += `
      <div class="cv-section">
        <h3 class="cv-section-title">LANGUAGES</h3>
        <div class="cv-skills-tags">
          ${state.languages.map(lang => `
            <span class="cv-skill-tag">${escapeHtml(lang.language)}: ${escapeHtml(lang.proficiency || 'Proficient')}</span>
          `).join('')}
        </div>
      </div>
    `;
  }

  if (state.regionalDetails && state.regionalDetails.enabled) {
    const r = state.regionalDetails;
    html += `
      <div class="cv-section">
        <h3 class="cv-section-title">PERSONAL DETAILS</h3>
        <div style="font-size:0.85rem; color:#475569; display:grid; grid-template-columns:repeat(2, 1fr); gap:6px;">
          ${r.dateOfBirth ? `<div><strong>Date of Birth:</strong> ${escapeHtml(r.dateOfBirth)}</div>` : ''}
          ${r.nationality ? `<div><strong>Nationality:</strong> ${escapeHtml(r.nationality)}</div>` : ''}
          ${r.maritalStatus ? `<div><strong>Marital Status:</strong> ${escapeHtml(r.maritalStatus)}</div>` : ''}
          ${r.militaryStatus ? `<div><strong>Military Status:</strong> ${escapeHtml(r.militaryStatus)}</div>` : ''}
        </div>
      </div>
    `;
  }

  if (state.references && state.references.availableUponRequest) {
    html += `
      <div class="cv-section">
        <h3 class="cv-section-title">REFERENCES</h3>
        <p style="font-size:0.85rem; color:#64748b; font-style:italic;">References available upon request.</p>
      </div>
    `;
  }

  paper.innerHTML = html;

  if (state.customization) {
    if (state.customization.primaryColor) {
      document.querySelectorAll(".cv-section-title").forEach(el => {
        el.style.color = state.customization.primaryColor;
      });
    }
    if (state.customization.font) {
      paper.style.fontFamily = `'${state.customization.font}', sans-serif`;
    }
  }
}

function formatDates(start, end, current) {
  if (!start && !end) return '';
  if (current) return `${start || ''} - Present`;
  if (start && end) return `${start} - ${end}`;
  return start || end || '';
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

window.initCvPreview = function() {
  const state = window.CVState.getState();
  renderCvPreview(state);

  window.CVState.subscribe((newState) => {
    renderCvPreview(newState);
  });
};
