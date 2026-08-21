function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

var SECTION_INFO = {
  personalInfo: {
    title: "Personal Info",
    subtitle: "Basic contact details and professional links.",
  },
  summary: {
    title: "Professional Summary",
    subtitle: "Highlight your key skills and background in a few sentences.",
  },
  experience: {
    title: "Work Experience",
    subtitle: "List your employment history, roles, and achievements.",
  },
  education: {
    title: "Education",
    subtitle: "Add your degrees, schools, and academic accomplishments.",
  },
  skills: {
    title: "Skills & Expertise",
    subtitle: "Categorize your technical capabilities and proficiency levels.",
  },
  projects: {
    title: "Key Projects",
    subtitle: "Showcase your notable projects and technical implementations.",
  },
  services: {
    title: "Services Offered",
    subtitle: "Outline the services or consulting you provide.",
  },
  certifications: {
    title: "Certifications",
    subtitle: "List professional licenses and verified certificates.",
  },
  courses: {
    title: "Courses & Training",
    subtitle: "Relevant online or offline training courses.",
  },
  languages: {
    title: "Languages",
    subtitle: "Spoken languages and proficiency levels.",
  },
  awards: {
    title: "Honors & Awards",
    subtitle: "Key achievements, honors, and recognitions.",
  },
  volunteer: {
    title: "Volunteer Work",
    subtitle: "Community involvement and volunteer experience.",
  },
  organizations: {
    title: "Organizations",
    subtitle: "Professional associations and affiliations.",
  },
  regionalDetails: {
    title: "Regional & Personal Details",
    subtitle: "Optional details like birthdate and military status.",
  },
  references: {
    title: "References",
    subtitle: "Professional references or request status.",
  },
  customization: {
    title: "Document Customization",
    subtitle: "Adjust styling, primary color, and fonts.",
  },
};

var ITEM_DEFAULTS = {
  experience: {
    jobTitle: "",
    company: "",
    startDate: "",
    endDate: "",
    currentlyWorking: false,
    description: "",
  },
  education: {
    degree: "",
    institution: "",
    graduationDate: "",
    gpa: "",
    description: "",
  },
  skills: { name: "", level: "Intermediate" },
  projects: {
    name: "",
    role: "",
    startDate: "",
    endDate: "",
    technologies: [],
    description: "",
  },
  services: { title: "", description: "" },
  certifications: { name: "", organization: "", issueDate: "" },
  courses: { name: "", organization: "" },
  awards: { name: "", organization: "" },
  volunteer: { name: "", organization: "" },
  organizations: { name: "", organization: "" },
  languages: { language: "", proficiency: "B2" },
};

var currentActiveSection = "personalInfo";

var REGEX_RULES = {
  email: {
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    message: "Please enter a valid email address (e.g. name@domain.com)",
  },
  phone: {
    pattern:
      /^(\+?\d{1,3}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}$/,
    message:
      "Please enter a valid phone number (e.g. +201012345678 or 01012345678)",
  },
  url: {
    pattern: /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/i,
    message: "Please enter a valid URL (e.g. https://yourwebsite.com)",
  },
  linkedin: {
    pattern:
      /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$|^[a-zA-Z0-9_-]+$/,
    message:
      "Enter a valid LinkedIn username or URL (e.g. linkedin.com/in/username)",
  },
  github: {
    pattern:
      /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$|^[a-zA-Z0-9_-]+$/,
    message: "Enter a valid GitHub username or URL (e.g. github.com/username)",
  },
  behance: {
    pattern:
      /^(https?:\/\/)?(www\.)?behance\.net\/[a-zA-Z0-9_-]+\/?$|^[a-zA-Z0-9_-]+$/,
    message:
      "Enter a valid Behance username or URL (e.g. behance.net/username)",
  },
  date: {
    pattern:
      /^(\d{4}|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}\b|\bPresent\b)$/i,
    message:
      "Format as Year (e.g. 2023) or Month Year (e.g. Mar 2022) or 'Present'",
  },
  dob: {
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    message: "Date of Birth format must be YYYY-MM-DD",
  },
  gpa: {
    pattern:
      /^([0-4](\.\d{1,2})?(\s*\/\s*4(\.0)?)?|[0-5](\.\d{1,2})?(\s*\/\s*5(\.0)?)?|100(\.0)?|\d{1,2}(\.\d{1,2})?%)$/,
    message: "Enter a valid GPA (e.g. 3.8, 3.8/4.0, or 85%)",
  },
};

function parseFlexibleDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return null;
  var clean = dateStr.trim();
  if (clean.toLowerCase() === "present") return new Date();

  if (/^\d{4}$/.test(clean)) {
    return new Date(parseInt(clean, 10), 0, 1);
  }

  var parsed = new Date(clean);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function validateDateRange(containerCard) {
  if (!containerCard) return true;

  var startInput = containerCard.querySelector('input[data-field="startDate"]');
  var endInput = containerCard.querySelector('input[data-field="endDate"]');

  if (!startInput || !endInput) return true;

  var startDate = parseFlexibleDate(startInput.value);
  var endDate = parseFlexibleDate(endInput.value);

  endInput.parentNode.querySelector(".date-range-feedback")?.remove();

  if (startDate && endDate && endDate < startDate) {
    endInput.classList.add("is-invalid");
    endInput.classList.remove("is-valid");
    endInput.insertAdjacentHTML(
      "afterend",
      '<div class="validation-feedback date-range-feedback text-danger small mt-1">End date cannot be earlier than start date.</div>'
    );
    return false;
  } else {
    if (endInput.classList.contains("is-invalid") && !endInput.parentNode.querySelector(".validation-feedback:not(.date-range-feedback)")) {
      endInput.classList.remove("is-invalid");
    }
    return true;
  }
}

function validateField(inputEl) {
  const rule = REGEX_RULES[inputEl.getAttribute("data-validate")];
  const val = inputEl.value.trim();

  if (!rule || val === "") {
    inputEl.classList.remove("is-invalid", "is-valid");
    inputEl.parentNode.querySelector(".validation-feedback")?.remove();
    return true;
  }

  const isValid = rule.pattern.test(val);

  inputEl.classList.toggle("is-valid", isValid);
  inputEl.classList.toggle("is-invalid", !isValid);

  const feedback = inputEl.parentNode.querySelector(".validation-feedback");

  if (!isValid && !feedback) {
    inputEl.insertAdjacentHTML(
      "afterend",
      `<div class="validation-feedback text-danger small mt-1">${rule.message}</div>`,
    );
  } else if (isValid) {
    feedback?.remove();
  }

  return isValid;
}

function escapeAttr(str) {
  return str ? String(str).replaceAll('"', "&quot;") : "";
}

function itemHeader(label, section, index) {
  return `
  <div class="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom">
    <span class="fw-bold text-dark">${escapeHtml(label)}</span>
    <button class="btn btn-outline-danger btn-sm remove-item-btn" data-section="${section}" data-index="${index}">
      <i class="fa-solid fa-trash me-1"></i> Remove
    </button>
  </div>`;
}

function addItemBtn(label, section) {
  return `
  <button class="btn-add-item mt-3 add-item-btn" data-section="${section}">
    <i class="fa-solid fa-plus"></i> ${label}
  </button>`;
}

function field(label, inputHtml) {
  return `<div class="col-md-6"><label class="form-label fw-semibold small text-secondary">${label}</label>${inputHtml}</div>`;
}

function fieldFull(label, inputHtml) {
  return `<div class="col-12"><label class="form-label fw-semibold small text-secondary">${label}</label>${inputHtml}</div>`;
}

function textInput(attrs, value, valType) {
  return `<input type="text" class="form-control" ${attrs} ${valType ? `data-validate="${valType}"` : ""} value="${escapeAttr(value)}">`;
}

function textareaInput(attrs, value, rows = 3) {
  return `<textarea class="form-control" rows="${rows}" ${attrs}>${escapeHtml(value)}</textarea>`;
}

function renderPersonalInfoForm(p) {
  p = p || {};
  var links = p.socialLinks || {};

  return `
    <div class="form-card mb-4">
      <div class="row g-3">
        ${fieldFull("Full Name", textInput('data-path="personalInfo.fullName"', p.fullName))}
        ${fieldFull("Professional Title", textInput('data-path="personalInfo.professionalTitle"', p.professionalTitle))}
        ${field("Email", `<input type="email" class="form-control" data-validate="email" data-path="personalInfo.email" value="${escapeAttr(p.email)}">`)}
        ${field("Phone", textInput('data-path="personalInfo.phone"', p.phone, "phone"))}
        ${fieldFull("Location / Address", textInput('data-path="personalInfo.address"', p.address))}
      </div>
    </div>
    
    <div class="form-card">
      <h3 class="h6 fw-bold mb-3 text-secondary">Professional Links</h3>
      <div class="row g-3">
        ${field("LinkedIn", textInput('data-path="personalInfo.socialLinks.linkedin"', links.linkedin, "linkedin"))}
        ${field("GitHub", textInput('data-path="personalInfo.socialLinks.github"', links.github, "github"))}
        ${field("Personal Website", textInput('data-path="personalInfo.socialLinks.website"', links.website, "url"))}
        ${field("Behance / Portfolio", textInput('data-path="personalInfo.socialLinks.behance"', links.behance, "behance"))}
      </div>
    </div>
  `;
}

function renderSummaryForm(summary) {
  return `
    <div class="form-card">
      <div class="mb-3">
        <label class="form-label fw-semibold small text-secondary">Professional Summary</label>
        ${textareaInput('data-path="summary" placeholder="Write a summary of your professional background..."', summary || "", 5)}
      </div>
    </div>
  `;
}

function renderExperienceForm(list) {
  list = list || [];
  var html = "";

  for (var i = 0; i < list.length; i++) {
    var exp = list[i];
    var label =
      (exp.jobTitle || "New Position") +
      (exp.company ? " @ " + exp.company : "");

    html += `
      <div class="item-card mb-3">
        ${itemHeader(label, "experience", i)}
        <div class="row g-3">
          ${field("Job Title", textInput(`data-arr="experience" data-idx="${i}" data-field="jobTitle"`, exp.jobTitle))}
          ${field("Company", textInput(`data-arr="experience" data-idx="${i}" data-field="company"`, exp.company))}
          ${field("Start Date", textInput(`data-arr="experience" data-idx="${i}" data-field="startDate" placeholder="e.g. Mar 2021"`, exp.startDate, "date"))}
          ${field("End Date", textInput(`data-arr="experience" data-idx="${i}" data-field="endDate" placeholder="e.g. Present" ${exp.currentlyWorking ? "disabled" : ""}`, exp.endDate, "date"))}
          
          <div class="col-12">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="currWork_${i}" data-arr="experience" data-idx="${i}" data-field="currentlyWorking" ${exp.currentlyWorking ? "checked" : ""}>
              <label class="form-check-label fw-medium text-dark" for="currWork_${i}">I currently work here</label>
            </div>
          </div>
          
          ${fieldFull("Description", textareaInput(`data-arr="experience" data-idx="${i}" data-field="description"`, exp.description, 3))}
        </div>
      </div>
    `;
  }

  html += addItemBtn("Add Experience Position", "experience");
  return html;
}

function renderEducationForm(list) {
  list = list || [];
  var html = "";

  for (var i = 0; i < list.length; i++) {
    var edu = list[i];
    html += `
      <div class="item-card mb-3">
        ${itemHeader(edu.degree || "Degree", "education", i)}
        <div class="row g-3">
          ${field("Degree / Field of Study", textInput(`data-arr="education" data-idx="${i}" data-field="degree"`, edu.degree))}
          ${field("Institution / School", textInput(`data-arr="education" data-idx="${i}" data-field="institution"`, edu.institution))}
          ${field("Graduation Date", textInput(`data-arr="education" data-idx="${i}" data-field="graduationDate" placeholder="e.g. 2023"`, edu.graduationDate, "date"))}
          ${field("GPA / Honors", textInput(`data-arr="education" data-idx="${i}" data-field="gpa" placeholder="e.g. 3.8 / 4.0"`, edu.gpa, "gpa"))}
          ${fieldFull("Description / Details", textareaInput(`data-arr="education" data-idx="${i}" data-field="description"`, edu.description, 2))}
        </div>
      </div>
    `;
  }

  html += addItemBtn("Add Education", "education");
  return html;
}

function renderSkillsForm(list) {
  list = list || [];
  var levels = ["Beginner", "Intermediate", "Advanced", "Expert"];
  var html = "";

  for (var i = 0; i < list.length; i++) {
    var sk = list[i];
    var options = levels
      .map(function (lv) {
        return `<option value="${lv}" ${sk.level === lv ? "selected" : ""}>${lv}</option>`;
      })
      .join("");

    html += `
      <div class="item-card mb-3 p-3">
        <div class="d-flex gap-2 align-items-center">
          <input type="text" class="form-control flex-grow-1" placeholder="Skill Name (e.g. React)" data-arr="skills" data-idx="${i}" data-field="name" value="${escapeAttr(sk.name)}">
          <select class="form-select w-auto" data-arr="skills" data-idx="${i}" data-field="level">
            ${options}
          </select>
          <button class="btn btn-outline-danger btn-sm remove-item-btn" data-section="skills" data-index="${i}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }

  html += addItemBtn("Add Skill", "skills");
  return html;
}

function renderProjectsForm(list) {
  list = list || [];
  var html = "";

  for (var i = 0; i < list.length; i++) {
    var proj = list[i];
    var techStr = Array.isArray(proj.technologies)
      ? proj.technologies.join(", ")
      : proj.technologies || "";

    html += `
      <div class="item-card mb-3">
        ${itemHeader(proj.name || "Project", "projects", i)}
        <div class="row g-3">
          ${field("Project Name", textInput(`data-arr="projects" data-idx="${i}" data-field="name"`, proj.name))}
          ${field("Role", textInput(`data-arr="projects" data-idx="${i}" data-field="role"`, proj.role))}
          ${field("Start Date", textInput(`data-arr="projects" data-idx="${i}" data-field="startDate" placeholder="e.g. Jan 2023"`, proj.startDate, "date"))}
          ${field("End Date", textInput(`data-arr="projects" data-idx="${i}" data-field="endDate" placeholder="e.g. May 2023"`, proj.endDate, "date"))}
          ${fieldFull("Technologies Used (comma separated)", `<input type="text" class="form-control" placeholder="e.g. React, Node.js, PostgreSQL" data-arr="projects" data-idx="${i}" data-field="technologies" value="${escapeAttr(techStr)}">`)}
          ${fieldFull("Description", textareaInput(`data-arr="projects" data-idx="${i}" data-field="description"`, proj.description, 3))}
        </div>
      </div>
    `;
  }

  html += addItemBtn("Add Project", "projects");
  return html;
}

function renderServicesForm(list) {
  list = list || [];
  var html = "";

  for (var i = 0; i < list.length; i++) {
    var srv = list[i];
    html += `
      <div class="item-card mb-3">
        ${itemHeader(srv.title || "Service", "services", i)}
        <div class="row g-3">
          ${fieldFull("Service Title", textInput(`data-arr="services" data-idx="${i}" data-field="title"`, srv.title))}
          ${fieldFull("Description", textareaInput(`data-arr="services" data-idx="${i}" data-field="description"`, srv.description, 3))}
        </div>
      </div>
    `;
  }

  html += addItemBtn("Add Service", "services");
  return html;
}

function renderCertificationsForm(list) {
  list = list || [];
  var html = "";

  for (var i = 0; i < list.length; i++) {
    var cert = list[i];
    html += `
      <div class="item-card mb-3">
        ${itemHeader(cert.name || "Certification", "certifications", i)}
        <div class="row g-3">
          ${field("Certification Name", textInput(`data-arr="certifications" data-idx="${i}" data-field="name"`, cert.name))}
          ${field("Issuing Organization", textInput(`data-arr="certifications" data-idx="${i}" data-field="organization"`, cert.organization))}
          ${fieldFull("Issue Date / Year", textInput(`data-arr="certifications" data-idx="${i}" data-field="issueDate" placeholder="e.g. 2023"`, cert.issueDate, "date"))}
        </div>
      </div>
    `;
  }

  html += addItemBtn("Add Certification", "certifications");
  return html;
}

function renderSimpleListForm(list, sectionKey, placeholderName, btnText) {
  list = list || [];
  var html = "";

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    html += `
      <div class="item-card mb-3">
        ${itemHeader(item.name || placeholderName, sectionKey, i)}
        <div class="row g-3">
          ${field("Title / Name", textInput(`data-arr="${sectionKey}" data-idx="${i}" data-field="name"`, item.name))}
          ${field("Organization / Issuer", textInput(`data-arr="${sectionKey}" data-idx="${i}" data-field="organization"`, item.organization))}
        </div>
      </div>
    `;
  }

  html += addItemBtn(btnText, sectionKey);
  return html;
}

function renderLanguagesForm(list) {
  list = list || [];
  var levels = ["Native", "C2", "C1", "B2", "B1"];
  var html = "";

  for (var i = 0; i < list.length; i++) {
    var lang = list[i];
    var options = levels
      .map(function (lv) {
        return `<option value="${lv}" ${lang.proficiency === lv ? "selected" : ""}>${lv}</option>`;
      })
      .join("");

    html += `
      <div class="item-card mb-3 p-3">
        <div class="d-flex gap-2 align-items-center">
          <input type="text" class="form-control flex-grow-1" placeholder="Language (e.g. English)" data-arr="languages" data-idx="${i}" data-field="language" value="${escapeAttr(lang.language)}">
          <select class="form-select w-auto" data-arr="languages" data-idx="${i}" data-field="proficiency">
            ${options}
          </select>
          <button class="btn btn-outline-danger btn-sm remove-item-btn" data-section="languages" data-index="${i}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }

  html += addItemBtn("Add Language", "languages");
  return html;
}

function renderRegionalDetailsForm(r) {
  r = r || {};
  var options = ["Not Applicable", "Exempted", "Completed", "Postponed"]
    .map(function (opt) {
      return `<option value="${opt}" ${r.militaryStatus === opt ? "selected" : ""}>${opt}</option>`;
    })
    .join("");

  return `
    <div class="form-card">
      <div class="form-check mb-4">
        <input class="form-check-input" type="checkbox" id="regEnable" data-path="regionalDetails.enabled" ${r.enabled ? "checked" : ""}>
        <label class="form-check-label fw-bold text-dark" for="regEnable">Enable Personal / Regional Information Section</label>
      </div>
      <div class="row g-3">
        ${field("Date of Birth", textInput('data-path="regionalDetails.dateOfBirth" placeholder="YYYY-MM-DD"', r.dateOfBirth, "dob"))}
        ${field("Nationality", textInput('data-path="regionalDetails.nationality"', r.nationality))}
        ${field("Marital Status", textInput('data-path="regionalDetails.maritalStatus"', r.maritalStatus))}
        <div class="col-md-6">
          <label class="form-label fw-semibold small text-secondary">Military Status</label>
          <select class="form-select" data-path="regionalDetails.militaryStatus">
            ${options}
          </select>
        </div>
      </div>
    </div>
  `;
}

function renderReferencesForm(ref) {
  ref = ref || {};
  return `
    <div class="form-card">
      <div class="form-check">
        <input class="form-check-input" type="checkbox" id="refReq" data-path="references.availableUponRequest" ${ref.availableUponRequest ? "checked" : ""}>
        <label class="form-check-label fw-bold text-dark" for="refReq">Show "References available upon request"</label>
      </div>
    </div>
  `;
}

function renderCustomizationForm(c) {
  c = c || {};
  var fonts = ["Inter", "Playfair Display", "Roboto Mono"];
  var fontOptions = fonts
    .map(function (f) {
      return `<option value="${f}" ${c.font === f ? "selected" : ""}>${f}</option>`;
    })
    .join("");

  return `
    <div class="form-card">
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label fw-semibold small text-secondary">Primary Theme Color</label>
          <input type="color" class="form-control form-control-color w-100" style="height:44px;" data-path="customization.primaryColor" value="${escapeAttr(c.primaryColor || "#2563EB")}">
        </div>
        <div class="col-md-6">
          <label class="form-label fw-semibold small text-secondary">Font Family</label>
          <select class="form-select" data-path="customization.font">
            ${fontOptions}
          </select>
        </div>
      </div>
    </div>
  `;
}

function renderEditorSection(sectionKey) {
  currentActiveSection = sectionKey;

  var container = document.getElementById("editorContent");
  var titleEl = document.getElementById("sectionTitle");
  var subtitleEl = document.getElementById("sectionSubtitle");

  if (!container) return;

  var info = SECTION_INFO[sectionKey] || { title: sectionKey, subtitle: "" };
  if (titleEl) titleEl.textContent = info.title;
  if (subtitleEl) subtitleEl.textContent = info.subtitle;

  var state = window.CVState.getState();

  var simpleSections = {
    courses: ["courses", "Course", "Add Course"],
    awards: ["awards", "Award", "Add Award"],
    volunteer: ["volunteer", "Activity", "Add Volunteer Activity"],
    organizations: ["organizations", "Organization", "Add Organization"],
  };

  var html = "";

  if (simpleSections[sectionKey]) {
    var conf = simpleSections[sectionKey];
    html = renderSimpleListForm(state[conf[0]], conf[0], conf[1], conf[2]);
  } else {
    switch (sectionKey) {
      case "personalInfo":
        html = renderPersonalInfoForm(state.personalInfo);
        break;
      case "summary":
        html = renderSummaryForm(state.summary);
        break;
      case "experience":
        html = renderExperienceForm(state.experience);
        break;
      case "education":
        html = renderEducationForm(state.education);
        break;
      case "skills":
        html = renderSkillsForm(state.skills);
        break;
      case "projects":
        html = renderProjectsForm(state.projects);
        break;
      case "services":
        html = renderServicesForm(state.services);
        break;
      case "certifications":
        html = renderCertificationsForm(state.certifications);
        break;
      case "languages":
        html = renderLanguagesForm(state.languages);
        break;
      case "regionalDetails":
        html = renderRegionalDetailsForm(state.regionalDetails);
        break;
      case "references":
        html = renderReferencesForm(state.references);
        break;
      case "customization":
        html = renderCustomizationForm(state.customization);
        break;
      default:
        html =
          '<div class="form-card"><p>Section under construction.</p></div>';
    }
  }

  container.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", function () {
  var container = document.getElementById("editorContent");
  if (!container) return;

  function getElementValue(el) {
    return el.type === "checkbox" ? el.checked : el.value;
  }

  container.addEventListener("input", function (e) {
    var el = e.target;
    validateField(el);

    var fieldName = el.getAttribute("data-field");
    if (fieldName === "startDate" || fieldName === "endDate") {
      var itemCard = el.closest(".item-card");
      validateDateRange(itemCard);
    }

    if (el.hasAttribute("data-path")) {
      window.CVState.setState(
        el.getAttribute("data-path"),
        getElementValue(el),
      );
    }

    if (el.hasAttribute("data-arr")) {
      var arrName = el.getAttribute("data-arr");
      var idx = parseInt(el.getAttribute("data-idx"), 10);
      var value = getElementValue(el);

      if (fieldName === "technologies" && typeof value === "string") {
        value = value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }

      window.CVState.updateState(function (state) {
        if (state[arrName]?.[idx] !== undefined) {
          state[arrName][idx][fieldName] = value;
        }
      });
    }
  });

  container.addEventListener("change", function (e) {
    var el = e.target;
    if (el.type !== "checkbox") return;

    if (el.hasAttribute("data-path")) {
      window.CVState.setState(el.getAttribute("data-path"), el.checked);
    }

    if (el.hasAttribute("data-arr")) {
      var arrName = el.getAttribute("data-arr");
      var idx = parseInt(el.getAttribute("data-idx"), 10);
      var fieldName = el.getAttribute("data-field");

      window.CVState.updateState(function (state) {
        if (state[arrName]?.[idx] !== undefined) {
          state[arrName][idx][fieldName] = el.checked;
          if (fieldName === "currentlyWorking") {
            renderEditorSection(currentActiveSection);
          }
        }
      });
    }
  });

  container.addEventListener("click", function (e) {
    var removeBtn = e.target.closest(".remove-item-btn");
    if (removeBtn) {
      var section = removeBtn.getAttribute("data-section");
      var index = parseInt(removeBtn.getAttribute("data-index"), 10);

      window.CVState.updateState(function (state) {
        state[section]?.splice(index, 1);
      });
      renderEditorSection(currentActiveSection);
      return;
    }

    var addBtn = e.target.closest(".add-item-btn");
    if (addBtn) {
      var sec = addBtn.getAttribute("data-section");
      var defaults = ITEM_DEFAULTS[sec];
      if (!defaults) return;

      window.CVState.updateState(function (state) {
        if (!state[sec]) state[sec] = [];
        var newItem = {};
        for (var key in defaults) {
          newItem[key] = Array.isArray(defaults[key]) ? [] : defaults[key];
        }
        state[sec].push(newItem);
      });
      renderEditorSection(sec);
    }
  });
});

window.initEditor = function () {
  renderEditorSection("personalInfo");
};