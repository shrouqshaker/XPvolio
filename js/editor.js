const sectionTitles = {
  personalInfo:    { title: "Personal Info",              subtitle: "Basic contact details and professional links." },
  summary:         { title: "Professional Summary",       subtitle: "Highlight your key skills and background in a few sentences." },
  experience:      { title: "Work Experience",            subtitle: "List your employment history, roles, and achievements." },
  education:       { title: "Education",                  subtitle: "Add your degrees, schools, and academic accomplishments." },
  skills:          { title: "Skills & Expertise",         subtitle: "Categorize your technical capabilities and proficiency levels." },
  projects:        { title: "Key Projects",               subtitle: "Showcase your notable projects and technical implementations." },
  services:        { title: "Services Offered",           subtitle: "Outline the services or consulting you provide." },
  certifications:  { title: "Certifications",             subtitle: "List professional licenses and verified certificates." },
  courses:         { title: "Courses & Training",         subtitle: "Relevant online or offline training courses." },
  languages:       { title: "Languages",                  subtitle: "Spoken languages and proficiency levels." },
  awards:          { title: "Honors & Awards",            subtitle: "Key achievements, honors, and recognitions." },
  volunteer:       { title: "Volunteer Work",             subtitle: "Community involvement and volunteer experience." },
  organizations:   { title: "Organizations",              subtitle: "Professional associations and affiliations." },
  regionalDetails: { title: "Regional & Personal Details",subtitle: "Optional market details like birthdate and military status." },
  references:      { title: "References",                 subtitle: "Professional references or request status." },
  customization:   { title: "Document Customization",     subtitle: "Adjust styling, primary color, and fonts." }
};

let currentActiveSection = "personalInfo";

function renderEditorSection(sectionKey) {
  currentActiveSection = sectionKey;
  const container  = document.getElementById("editorContent");
  const titleEl    = document.getElementById("sectionTitle");
  const subtitleEl = document.getElementById("sectionSubtitle");

  if (!container) return;

  const info = sectionTitles[sectionKey] || { title: sectionKey, subtitle: "" };
  if (titleEl)    titleEl.textContent    = info.title;
  if (subtitleEl) subtitleEl.textContent = info.subtitle;

  const state = window.CVState.getState();

  switch (sectionKey) {
    case "personalInfo":    container.innerHTML = renderPersonalInfoForm(state.personalInfo);              break;
    case "summary":         container.innerHTML = renderSummaryForm(state.summary);                        break;
    case "experience":      container.innerHTML = renderExperienceForm(state.experience || []);            break;
    case "education":       container.innerHTML = renderEducationForm(state.education || []);              break;
    case "skills":          container.innerHTML = renderSkillsForm(state.skills || []);                    break;
    case "projects":        container.innerHTML = renderProjectsForm(state.projects || []);                break;
    case "services":        container.innerHTML = renderServicesForm(state.services || []);                break;
    case "certifications":  container.innerHTML = renderCertificationsForm(state.certifications || []);   break;
    case "courses":         container.innerHTML = renderCoursesForm(state.courses || []);                  break;
    case "languages":       container.innerHTML = renderLanguagesForm(state.languages || []);              break;
    case "awards":          container.innerHTML = renderAwardsForm(state.awards || []);                    break;
    case "volunteer":       container.innerHTML = renderVolunteerForm(state.volunteer || []);              break;
    case "organizations":   container.innerHTML = renderOrganizationsForm(state.organizations || []);      break;
    case "regionalDetails": container.innerHTML = renderRegionalDetailsForm(state.regionalDetails || {}); break;
    case "references":      container.innerHTML = renderReferencesForm(state.references || {});            break;
    case "customization":   container.innerHTML = renderCustomizationForm(state.customization || {});      break;
    default:                container.innerHTML = `<div class="form-card"><p>Section under construction.</p></div>`;
  }

  attachEditorListeners(sectionKey);
}

function renderPersonalInfoForm(p = {}) {
  const links = p.socialLinks || {};
  return `
    <div class="form-card mb-4">
      <div class="row g-3">
        <div class="col-12">
          <label class="form-label">Full Name</label>
          <input type="text" class="form-control" data-path="personalInfo.fullName" value="${escapeAttr(p.fullName)}">
        </div>
        <div class="col-12">
          <label class="form-label">Professional Title</label>
          <input type="text" class="form-control" data-path="personalInfo.professionalTitle" value="${escapeAttr(p.professionalTitle)}">
        </div>
        <div class="col-md-6">
          <label class="form-label">Email</label>
          <input type="email" class="form-control" data-path="personalInfo.email" value="${escapeAttr(p.email)}">
        </div>
        <div class="col-md-6">
          <label class="form-label">Phone</label>
          <input type="text" class="form-control" data-path="personalInfo.phone" value="${escapeAttr(p.phone)}">
        </div>
        <div class="col-12">
          <label class="form-label">Location / Address</label>
          <input type="text" class="form-control" data-path="personalInfo.address" value="${escapeAttr(p.address)}">
        </div>
      </div>
    </div>

    <div class="form-card">
      <h3 class="h6 fw-bold mb-3 text-secondary">Professional Links</h3>
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">LinkedIn</label>
          <input type="text" class="form-control" data-path="personalInfo.socialLinks.linkedin" value="${escapeAttr(links.linkedin)}">
        </div>
        <div class="col-md-6">
          <label class="form-label">GitHub</label>
          <input type="text" class="form-control" data-path="personalInfo.socialLinks.github" value="${escapeAttr(links.github)}">
        </div>
        <div class="col-md-6">
          <label class="form-label">Personal Website</label>
          <input type="text" class="form-control" data-path="personalInfo.socialLinks.website" value="${escapeAttr(links.website)}">
        </div>
        <div class="col-md-6">
          <label class="form-label">Behance / Portfolio</label>
          <input type="text" class="form-control" data-path="personalInfo.socialLinks.behance" value="${escapeAttr(links.behance)}">
        </div>
      </div>
    </div>
  `;
}

function renderSummaryForm(summary = "") {
  return `
    <div class="form-card">
      <div class="mb-3">
        <label class="form-label">Professional Summary</label>
        <textarea class="form-control" data-path="summary" rows="5" placeholder="Write a summary of your professional background...">${escapeAttr(summary)}</textarea>
      </div>
    </div>
  `;
}

function renderExperienceForm(expList = []) {
  let html = expList.map((exp, index) => `
    <div class="item-card mb-3" data-index="${index}">
      <div class="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom">
        <span class="fw-bold text-dark">${exp.jobTitle || 'New Position'} ${exp.company ? `@ ${exp.company}` : ''}</span>
        <button class="btn btn-outline-danger btn-sm" onclick="removeItem('experience', ${index})"><i class="fa-solid fa-trash me-1"></i> Remove</button>
      </div>
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Job Title</label>
          <input type="text" class="form-control" data-arr="experience" data-idx="${index}" data-field="jobTitle" value="${escapeAttr(exp.jobTitle)}">
        </div>
        <div class="col-md-6">
          <label class="form-label">Company</label>
          <input type="text" class="form-control" data-arr="experience" data-idx="${index}" data-field="company" value="${escapeAttr(exp.company)}">
        </div>
        <div class="col-md-6">
          <label class="form-label">Start Date</label>
          <input type="text" class="form-control" placeholder="e.g. Mar 2021" data-arr="experience" data-idx="${index}" data-field="startDate" value="${escapeAttr(exp.startDate)}">
        </div>
        <div class="col-md-6">
          <label class="form-label">End Date</label>
          <input type="text" class="form-control" placeholder="e.g. Present" data-arr="experience" data-idx="${index}" data-field="endDate" value="${escapeAttr(exp.endDate)}" ${exp.currentlyWorking ? 'disabled' : ''}>
        </div>
        <div class="col-12">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="currWork_${index}" data-arr="experience" data-idx="${index}" data-field="currentlyWorking" ${exp.currentlyWorking ? 'checked' : ''}>
            <label class="form-check-label fw-medium text-dark" for="currWork_${index}">I currently work here</label>
          </div>
        </div>
        <div class="col-12">
          <label class="form-label">Description</label>
          <textarea class="form-control" rows="3" data-arr="experience" data-idx="${index}" data-field="description">${escapeAttr(exp.description)}</textarea>
        </div>
      </div>
    </div>
  `).join('');

  html += `
    <button class="btn-add-item mt-3" onclick="addExperienceItem()">
      <i class="fa-solid fa-plus"></i> Add Experience Position
    </button>
  `;
  return html;
}

function renderEducationForm(eduList = []) {
  let html = eduList.map((edu, index) => `
    <div class="item-card mb-3" data-index="${index}">
      <div class="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom">
        <span class="fw-bold text-dark">${edu.degree || 'Degree'}</span>
        <button class="btn btn-outline-danger btn-sm" onclick="removeItem('education', ${index})"><i class="fa-solid fa-trash me-1"></i> Remove</button>
      </div>
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Degree / Field of Study</label>
          <input type="text" class="form-control" data-arr="education" data-idx="${index}" data-field="degree" value="${escapeAttr(edu.degree)}">
        </div>
        <div class="col-md-6">
          <label class="form-label">Institution / School</label>
          <input type="text" class="form-control" data-arr="education" data-idx="${index}" data-field="institution" value="${escapeAttr(edu.institution)}">
        </div>
        <div class="col-md-6">
          <label class="form-label">Graduation Date</label>
          <input type="text" class="form-control" placeholder="e.g. 2018" data-arr="education" data-idx="${index}" data-field="graduationDate" value="${escapeAttr(edu.graduationDate)}">
        </div>
        <div class="col-md-6">
          <label class="form-label">GPA / Honors</label>
          <input type="text" class="form-control" placeholder="e.g. 3.8 / 4.0" data-arr="education" data-idx="${index}" data-field="gpa" value="${escapeAttr(edu.gpa)}">
        </div>
      </div>
    </div>
  `).join('');

  html += `
    <button class="btn-add-item mt-3" onclick="addEducationItem()">
      <i class="fa-solid fa-plus"></i> Add Education
    </button>
  `;
  return html;
}

function renderSkillsForm(skillsList = []) {
  let html = skillsList.map((sk, index) => `
    <div class="item-card mb-3 p-3">
      <div class="d-flex gap-2 align-items-center">
        <input type="text" class="form-control flex-grow-1" placeholder="Skill Name (e.g. React)" data-arr="skills" data-idx="${index}" data-field="name" value="${escapeAttr(sk.name)}">
        <select class="form-select w-auto" data-arr="skills" data-idx="${index}" data-field="level">
          <option value="Beginner"     ${sk.level === 'Beginner'     ? 'selected' : ''}>Beginner</option>
          <option value="Intermediate" ${sk.level === 'Intermediate' ? 'selected' : ''}>Intermediate</option>
          <option value="Advanced"     ${sk.level === 'Advanced'     ? 'selected' : ''}>Advanced</option>
          <option value="Expert"       ${sk.level === 'Expert'       ? 'selected' : ''}>Expert</option>
        </select>
        <button class="btn btn-outline-danger btn-sm" onclick="removeItem('skills', ${index})"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>
  `).join('');

  html += `
    <button class="btn-add-item mt-3" onclick="addSkillItem()">
      <i class="fa-solid fa-plus"></i> Add Skill
    </button>
  `;
  return html;
}

function renderProjectsForm(projList = []) {
  let html = projList.map((proj, index) => `
    <div class="item-card mb-3">
      <div class="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom">
        <span class="fw-bold text-dark">${proj.name || 'Project'}</span>
        <button class="btn btn-outline-danger btn-sm" onclick="removeItem('projects', ${index})"><i class="fa-solid fa-trash me-1"></i> Remove</button>
      </div>
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Project Name</label>
          <input type="text" class="form-control" data-arr="projects" data-idx="${index}" data-field="name" value="${escapeAttr(proj.name)}">
        </div>
        <div class="col-md-6">
          <label class="form-label">Role</label>
          <input type="text" class="form-control" data-arr="projects" data-idx="${index}" data-field="role" value="${escapeAttr(proj.role)}">
        </div>
        <div class="col-12">
          <label class="form-label">Description</label>
          <textarea class="form-control" rows="3" data-arr="projects" data-idx="${index}" data-field="description">${escapeAttr(proj.description)}</textarea>
        </div>
      </div>
    </div>
  `).join('');

  html += `
    <button class="btn-add-item mt-3" onclick="addProjectItem()">
      <i class="fa-solid fa-plus"></i> Add Project
    </button>
  `;
  return html;
}

function renderServicesForm(srvList = []) {
  let html = srvList.map((srv, index) => `
    <div class="item-card mb-3">
      <div class="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom">
        <span class="fw-bold text-dark">${srv.title || 'Service'}</span>
        <button class="btn btn-outline-danger btn-sm" onclick="removeItem('services', ${index})"><i class="fa-solid fa-trash me-1"></i> Remove</button>
      </div>
      <div class="row g-3">
        <div class="col-12">
          <label class="form-label">Service Title</label>
          <input type="text" class="form-control" data-arr="services" data-idx="${index}" data-field="title" value="${escapeAttr(srv.title)}">
        </div>
        <div class="col-12">
          <label class="form-label">Description</label>
          <textarea class="form-control" rows="3" data-arr="services" data-idx="${index}" data-field="description">${escapeAttr(srv.description)}</textarea>
        </div>
      </div>
    </div>
  `).join('');

  html += `
    <button class="btn-add-item mt-3" onclick="addServiceItem()">
      <i class="fa-solid fa-plus"></i> Add Service
    </button>
  `;
  return html;
}

function renderCertificationsForm(list = []) {
  let html = list.map((cert, index) => `
    <div class="item-card mb-3">
      <div class="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom">
        <span class="fw-bold text-dark">${cert.name || 'Certification'}</span>
        <button class="btn btn-outline-danger btn-sm" onclick="removeItem('certifications', ${index})"><i class="fa-solid fa-trash me-1"></i> Remove</button>
      </div>
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Certification Name</label>
          <input type="text" class="form-control" data-arr="certifications" data-idx="${index}" data-field="name" value="${escapeAttr(cert.name)}">
        </div>
        <div class="col-md-6">
          <label class="form-label">Issuing Organization</label>
          <input type="text" class="form-control" data-arr="certifications" data-idx="${index}" data-field="organization" value="${escapeAttr(cert.organization)}">
        </div>
      </div>
    </div>
  `).join('');
  html += `<button class="btn-add-item mt-3" onclick="addSimpleArrayItem('certifications', {name:'', organization:''})"><i class="fa-solid fa-plus"></i> Add Certification</button>`;
  return html;
}

function renderCoursesForm(list = []) {
  return renderCertificationsForm(list);
}

function renderLanguagesForm(list = []) {
  let html = list.map((lang, index) => `
    <div class="item-card mb-3 p-3">
      <div class="d-flex gap-2 align-items-center">
        <input type="text" class="form-control flex-grow-1" placeholder="Language (e.g. English)" data-arr="languages" data-idx="${index}" data-field="language" value="${escapeAttr(lang.language)}">
        <select class="form-select w-auto" data-arr="languages" data-idx="${index}" data-field="proficiency">
          <option value="Native" ${lang.proficiency === 'Native' ? 'selected' : ''}>Native</option>
          <option value="C2"     ${lang.proficiency === 'C2'     ? 'selected' : ''}>C2 (Mastery)</option>
          <option value="C1"     ${lang.proficiency === 'C1'     ? 'selected' : ''}>C1 (Advanced)</option>
          <option value="B2"     ${lang.proficiency === 'B2'     ? 'selected' : ''}>B2 (Upper Int.)</option>
          <option value="B1"     ${lang.proficiency === 'B1'     ? 'selected' : ''}>B1 (Intermediate)</option>
        </select>
        <button class="btn btn-outline-danger btn-sm" onclick="removeItem('languages', ${index})"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>
  `).join('');
  html += `<button class="btn-add-item mt-3" onclick="addSimpleArrayItem('languages', {language:'', proficiency:'B2'})"><i class="fa-solid fa-plus"></i> Add Language</button>`;
  return html;
}

function renderAwardsForm(list = []) {
  return renderCertificationsForm(list);
}

function renderVolunteerForm(list = []) {
  return renderCertificationsForm(list);
}

function renderOrganizationsForm(list = []) {
  return renderCertificationsForm(list);
}

function renderRegionalDetailsForm(r = {}) {
  return `
    <div class="form-card">
      <div class="form-check mb-4">
        <input class="form-check-input" type="checkbox" id="regEnable" data-path="regionalDetails.enabled" ${r.enabled ? 'checked' : ''}>
        <label class="form-check-label fw-bold text-dark" for="regEnable">Enable Personal/Regional Information Section</label>
      </div>
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Date of Birth</label>
          <input type="text" class="form-control" data-path="regionalDetails.dateOfBirth" value="${escapeAttr(r.dateOfBirth)}">
        </div>
        <div class="col-md-6">
          <label class="form-label">Nationality</label>
          <input type="text" class="form-control" data-path="regionalDetails.nationality" value="${escapeAttr(r.nationality)}">
        </div>
        <div class="col-md-6">
          <label class="form-label">Marital Status</label>
          <input type="text" class="form-control" data-path="regionalDetails.maritalStatus" value="${escapeAttr(r.maritalStatus)}">
        </div>
        <div class="col-md-6">
          <label class="form-label">Military Status</label>
          <select class="form-select" data-path="regionalDetails.militaryStatus">
            <option value="Not Applicable" ${r.militaryStatus === 'Not Applicable' ? 'selected' : ''}>Not Applicable</option>
            <option value="Exempted"       ${r.militaryStatus === 'Exempted'       ? 'selected' : ''}>Exempted</option>
            <option value="Completed"      ${r.militaryStatus === 'Completed'      ? 'selected' : ''}>Completed</option>
            <option value="Postponed"      ${r.militaryStatus === 'Postponed'      ? 'selected' : ''}>Postponed</option>
          </select>
        </div>
      </div>
    </div>
  `;
}

function renderReferencesForm(ref = {}) {
  return `
    <div class="form-card">
      <div class="form-check">
        <input class="form-check-input" type="checkbox" id="refReq" data-path="references.availableUponRequest" ${ref.availableUponRequest ? 'checked' : ''}>
        <label class="form-check-label fw-bold text-dark" for="refReq">Show "References available upon request"</label>
      </div>
    </div>
  `;
}

function renderCustomizationForm(c = {}) {
  return `
    <div class="form-card">
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Primary Theme Color</label>
          <input type="color" class="form-control form-control-color w-100" style="height:44px;" data-path="customization.primaryColor" value="${escapeAttr(c.primaryColor || '#2563EB')}">
        </div>
        <div class="col-md-6">
          <label class="form-label">Font Family</label>
          <select class="form-select" data-path="customization.font">
            <option value="Inter"            ${c.font === 'Inter'            ? 'selected' : ''}>Inter (Modern Sans)</option>
            <option value="Playfair Display" ${c.font === 'Playfair Display' ? 'selected' : ''}>Playfair Display (Serif)</option>
            <option value="Roboto Mono"      ${c.font === 'Roboto Mono'      ? 'selected' : ''}>Roboto Mono (Monospace)</option>
          </select>
        </div>
      </div>
    </div>
  `;
}

function attachEditorListeners(sectionKey) {
  const container = document.getElementById("editorContent");
  if (!container) return;

  const pathInputs = container.querySelectorAll("[data-path]");
  pathInputs.forEach(input => {
    input.addEventListener("input", (e) => {
      const path = e.target.getAttribute("data-path");
      const val  = e.target.type === "checkbox" ? e.target.checked : e.target.value;
      window.CVState.setState(path, val);
    });
  });

  const arrInputs = container.querySelectorAll("[data-arr]");
  arrInputs.forEach(input => {
    input.addEventListener("input", (e) => {
      const arrName = e.target.getAttribute("data-arr");
      const idx     = parseInt(e.target.getAttribute("data-idx"), 10);
      const field   = e.target.getAttribute("data-field");
      const val     = e.target.type === "checkbox" ? e.target.checked : e.target.value;

      window.CVState.updateState(state => {
        if (state[arrName] && state[arrName][idx]) {
          state[arrName][idx][field] = val;
        }
      });
    });
  });
}

window.removeItem = function(arrName, index) {
  window.CVState.updateState(state => {
    if (state[arrName]) state[arrName].splice(index, 1);
  });
  renderEditorSection(currentActiveSection);
};

window.addExperienceItem = function() {
  window.CVState.updateState(state => {
    if (!state.experience) state.experience = [];
    state.experience.push({ jobTitle: "", company: "", startDate: "", endDate: "", currentlyWorking: false, description: "" });
  });
  renderEditorSection("experience");
};

window.addEducationItem = function() {
  window.CVState.updateState(state => {
    if (!state.education) state.education = [];
    state.education.push({ degree: "", institution: "", graduationDate: "", gpa: "", description: "" });
  });
  renderEditorSection("education");
};

window.addSkillItem = function() {
  window.CVState.updateState(state => {
    if (!state.skills) state.skills = [];
    state.skills.push({ name: "", level: "Intermediate" });
  });
  renderEditorSection("skills");
};

window.addProjectItem = function() {
  window.CVState.updateState(state => {
    if (!state.projects) state.projects = [];
    state.projects.push({ name: "", role: "", description: "", technologies: [] });
  });
  renderEditorSection("projects");
};

window.addServiceItem = function() {
  window.CVState.updateState(state => {
    if (!state.services) state.services = [];
    state.services.push({ title: "", description: "" });
  });
  renderEditorSection("services");
};

window.addSimpleArrayItem = function(key, defaultObj) {
  window.CVState.updateState(state => {
    if (!state[key]) state[key] = [];
    state[key].push({ ...defaultObj });
  });
  renderEditorSection(key);
};

function escapeAttr(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/"/g, '&quot;');
}

window.initEditor = function() {
  renderEditorSection("personalInfo");
};
