
var SECTION_INFO = {
  personalInfo:    { title: "Personal Info",               subtitle: "Basic contact details and professional links." },
  summary:         { title: "Professional Summary",        subtitle: "Highlight your key skills and background in a few sentences." },
  experience:      { title: "Work Experience",             subtitle: "List your employment history, roles, and achievements." },
  education:       { title: "Education",                   subtitle: "Add your degrees, schools, and academic accomplishments." },
  skills:          { title: "Skills & Expertise",          subtitle: "Categorize your technical capabilities and proficiency levels." },
  projects:        { title: "Key Projects",                subtitle: "Showcase your notable projects and technical implementations." },
  services:        { title: "Services Offered",            subtitle: "Outline the services or consulting you provide." },
  certifications:  { title: "Certifications",              subtitle: "List professional licenses and verified certificates." },
  courses:         { title: "Courses & Training",          subtitle: "Relevant online or offline training courses." },
  languages:       { title: "Languages",                   subtitle: "Spoken languages and proficiency levels." },
  awards:          { title: "Honors & Awards",             subtitle: "Key achievements, honors, and recognitions." },
  volunteer:       { title: "Volunteer Work",              subtitle: "Community involvement and volunteer experience." },
  organizations:   { title: "Organizations",               subtitle: "Professional associations and affiliations." },
  regionalDetails: { title: "Regional & Personal Details", subtitle: "Optional market details like birthdate and military status." },
  references:      { title: "References",                  subtitle: "Professional references or request status." },
  customization:   { title: "Document Customization",      subtitle: "Adjust styling, primary color, and fonts." }
};

/* Default item templates for each array section */

var ITEM_DEFAULTS = {
  experience:     { jobTitle: "", company: "", startDate: "", endDate: "", currentlyWorking: false, description: "" },
  education:      { degree: "", institution: "", graduationDate: "", gpa: "", description: "" },
  skills:         { name: "", level: "Intermediate" },
  projects:       { name: "", role: "", startDate: "", endDate: "", technologies: [], description: "" },
  services:       { title: "", description: "" },
  certifications: { name: "", organization: "", issueDate: "" },
  courses:        { name: "", organization: "" },
  awards:         { name: "", organization: "" },
  volunteer:      { name: "", organization: "" },
  organizations:  { name: "", organization: "" },
  languages:      { language: "", proficiency: "B2" }
};

var currentActiveSection = "personalInfo";

/*  Escape helpers  */

function escapeAttr(str) {
  if (str === null || str === undefined) return "";
  return String(str).replace(/"/g, "&quot;");
}

/*Shared HTML building blocks  */

function itemHeader(label, section, index) {
  return (
    '<div class="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom">' +
      '<span class="fw-bold text-dark">' + label + '</span>' +
      '<button class="btn btn-outline-danger btn-sm remove-item-btn" data-section="' + section + '" data-index="' + index + '">' +
        '<i class="fa-solid fa-trash me-1"></i> Remove' +
      '</button>' +
    '</div>'
  );
}

function addItemBtn(label, section) {
  return (
    '<button class="btn-add-item mt-3 add-item-btn" data-section="' + section + '">' +
      '<i class="fa-solid fa-plus"></i> ' + label +
    '</button>'
  );
}

function field(label, inputHtml) {
  return '<div class="col-md-6"><label class="form-label">' + label + '</label>' + inputHtml + '</div>';
}

function fieldFull(label, inputHtml) {
  return '<div class="col-12"><label class="form-label">' + label + '</label>' + inputHtml + '</div>';
}

function textInput(attrs, value) {
  return '<input type="text" class="form-control" ' + attrs + ' value="' + escapeAttr(value) + '">';
}

function textareaInput(attrs, value, rows) {
  return '<textarea class="form-control" rows="' + (rows || 3) + '" ' + attrs + '>' + escapeAttr(value) + '</textarea>';
}

/* Section Renderers  */

function renderPersonalInfoForm(p) {
  p = p || {};
  var links = p.socialLinks || {};
  return (
    '<div class="form-card mb-4">' +
      '<div class="row g-3">' +
        fieldFull("Full Name", textInput('data-path="personalInfo.fullName"', p.fullName)) +
        fieldFull("Professional Title", textInput('data-path="personalInfo.professionalTitle"', p.professionalTitle)) +
        field("Email", '<input type="email" class="form-control" data-path="personalInfo.email" value="' + escapeAttr(p.email) + '">') +
        field("Phone", textInput('data-path="personalInfo.phone"', p.phone)) +
        fieldFull("Location / Address", textInput('data-path="personalInfo.address"', p.address)) +
      '</div>' +
    '</div>' +
    '<div class="form-card">' +
      '<h3 class="h6 fw-bold mb-3 text-secondary">Professional Links</h3>' +
      '<div class="row g-3">' +
        field("LinkedIn", textInput('data-path="personalInfo.socialLinks.linkedin"', links.linkedin)) +
        field("GitHub",   textInput('data-path="personalInfo.socialLinks.github"',   links.github)) +
        field("Personal Website", textInput('data-path="personalInfo.socialLinks.website"', links.website)) +
        field("Behance / Portfolio", textInput('data-path="personalInfo.socialLinks.behance"', links.behance)) +
      '</div>' +
    '</div>'
  );
}

function renderSummaryForm(summary) {
  return (
    '<div class="form-card">' +
      '<div class="mb-3">' +
        '<label class="form-label">Professional Summary</label>' +
        textareaInput('data-path="summary" placeholder="Write a summary of your professional background..."', summary || "", 5) +
      '</div>' +
    '</div>'
  );
}

function renderExperienceForm(list) {
  list = list || [];
  var html = "";
  for (var i = 0; i < list.length; i++) {
    var exp = list[i];
    var label = (exp.jobTitle || "New Position") + (exp.company ? " @ " + exp.company : "");
    html += '<div class="item-card mb-3">' + itemHeader(label, "experience", i);
    html += '<div class="row g-3">';
    html += field("Job Title", textInput('data-arr="experience" data-idx="' + i + '" data-field="jobTitle"', exp.jobTitle));
    html += field("Company",   textInput('data-arr="experience" data-idx="' + i + '" data-field="company"',  exp.company));
    html += field("Start Date", '<input type="text" class="form-control" placeholder="e.g. Mar 2021" data-arr="experience" data-idx="' + i + '" data-field="startDate" value="' + escapeAttr(exp.startDate) + '">');
    html += field("End Date",   '<input type="text" class="form-control" placeholder="e.g. Present"  data-arr="experience" data-idx="' + i + '" data-field="endDate" value="' + escapeAttr(exp.endDate) + '"' + (exp.currentlyWorking ? " disabled" : "") + '>');
    html += (
      '<div class="col-12">' +
        '<div class="form-check">' +
          '<input class="form-check-input" type="checkbox" id="currWork_' + i + '" data-arr="experience" data-idx="' + i + '" data-field="currentlyWorking"' + (exp.currentlyWorking ? " checked" : "") + '>' +
          '<label class="form-check-label fw-medium text-dark" for="currWork_' + i + '">I currently work here</label>' +
        '</div>' +
      '</div>'
    );
    html += fieldFull("Description", textareaInput('data-arr="experience" data-idx="' + i + '" data-field="description"', exp.description, 3));
    html += '</div></div>';
  }
  html += addItemBtn("Add Experience Position", "experience");
  return html;
}

function renderEducationForm(list) {
  list = list || [];
  var html = "";
  for (var i = 0; i < list.length; i++) {
    var edu = list[i];
    html += '<div class="item-card mb-3">' + itemHeader(edu.degree || "Degree", "education", i);
    html += '<div class="row g-3">';
    html += field("Degree / Field of Study", textInput('data-arr="education" data-idx="' + i + '" data-field="degree"',          edu.degree));
    html += field("Institution / School",    textInput('data-arr="education" data-idx="' + i + '" data-field="institution"',       edu.institution));
    html += field("Graduation Date",         '<input type="text" class="form-control" placeholder="e.g. 2018" data-arr="education" data-idx="' + i + '" data-field="graduationDate" value="' + escapeAttr(edu.graduationDate) + '">');
    html += field("GPA / Honors",            '<input type="text" class="form-control" placeholder="e.g. 3.8 / 4.0" data-arr="education" data-idx="' + i + '" data-field="gpa" value="' + escapeAttr(edu.gpa) + '">');
    html += fieldFull("Description / Details", textareaInput('data-arr="education" data-idx="' + i + '" data-field="description"', edu.description, 2));
    html += '</div></div>';
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
    var options = levels.map(function(lv) {
      return '<option value="' + lv + '"' + (sk.level === lv ? " selected" : "") + '>' + lv + '</option>';
    }).join("");
    html += (
      '<div class="item-card mb-3 p-3">' +
        '<div class="d-flex gap-2 align-items-center">' +
          '<input type="text" class="form-control flex-grow-1" placeholder="Skill Name (e.g. React)" data-arr="skills" data-idx="' + i + '" data-field="name" value="' + escapeAttr(sk.name) + '">' +
          '<select class="form-select w-auto" data-arr="skills" data-idx="' + i + '" data-field="level">' + options + '</select>' +
          '<button class="btn btn-outline-danger btn-sm remove-item-btn" data-section="skills" data-index="' + i + '"><i class="fa-solid fa-trash"></i></button>' +
        '</div>' +
      '</div>'
    );
  }
  html += addItemBtn("Add Skill", "skills");
  return html;
}

function renderProjectsForm(list) {
  list = list || [];
  var html = "";
  for (var i = 0; i < list.length; i++) {
    var proj = list[i];
    var techStr = Array.isArray(proj.technologies) ? proj.technologies.join(", ") : (proj.technologies || "");
    html += '<div class="item-card mb-3">' + itemHeader(proj.name || "Project", "projects", i);
    html += '<div class="row g-3">';
    html += field("Project Name", textInput('data-arr="projects" data-idx="' + i + '" data-field="name"', proj.name));
    html += field("Role",         textInput('data-arr="projects" data-idx="' + i + '" data-field="role"', proj.role));
    html += field("Start Date",   '<input type="text" class="form-control" placeholder="e.g. Jan 2023" data-arr="projects" data-idx="' + i + '" data-field="startDate" value="' + escapeAttr(proj.startDate) + '">');
    html += field("End Date",     '<input type="text" class="form-control" placeholder="e.g. May 2023" data-arr="projects" data-idx="' + i + '" data-field="endDate" value="' + escapeAttr(proj.endDate) + '">');
    html += fieldFull("Technologies Used (comma separated)", '<input type="text" class="form-control" placeholder="e.g. React, Node.js, PostgreSQL" data-arr="projects" data-idx="' + i + '" data-field="technologies" value="' + escapeAttr(techStr) + '">');
    html += fieldFull("Description", textareaInput('data-arr="projects" data-idx="' + i + '" data-field="description"', proj.description, 3));
    html += '</div></div>';
  }
  html += addItemBtn("Add Project", "projects");
  return html;
}

function renderServicesForm(list) {
  list = list || [];
  var html = "";
  for (var i = 0; i < list.length; i++) {
    var srv = list[i];
    html += '<div class="item-card mb-3">' + itemHeader(srv.title || "Service", "services", i);
    html += '<div class="row g-3">';
    html += fieldFull("Service Title", textInput('data-arr="services" data-idx="' + i + '" data-field="title"', srv.title));
    html += fieldFull("Description",   textareaInput('data-arr="services" data-idx="' + i + '" data-field="description"', srv.description, 3));
    html += '</div></div>';
  }
  html += addItemBtn("Add Service", "services");
  return html;
}

function renderCertificationsForm(list) {
  list = list || [];
  var html = "";
  for (var i = 0; i < list.length; i++) {
    var cert = list[i];
    html += '<div class="item-card mb-3">' + itemHeader(cert.name || "Certification", "certifications", i);
    html += '<div class="row g-3">';
    html += field("Certification Name", textInput('data-arr="certifications" data-idx="' + i + '" data-field="name"', cert.name));
    html += field("Issuing Organization", textInput('data-arr="certifications" data-idx="' + i + '" data-field="organization"', cert.organization));
    html += fieldFull("Issue Date / Year", '<input type="text" class="form-control" placeholder="e.g. 2023" data-arr="certifications" data-idx="' + i + '" data-field="issueDate" value="' + escapeAttr(cert.issueDate) + '">');
    html += '</div></div>';
  }
  html += addItemBtn("Add Certification", "certifications");
  return html;
}

function renderSimpleListForm(list, sectionKey, placeholderName, btnText) {
  list = list || [];
  var html = "";
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    html += '<div class="item-card mb-3">' + itemHeader(item.name || placeholderName, sectionKey, i);
    html += '<div class="row g-3">';
    html += field("Title / Name", textInput('data-arr="' + sectionKey + '" data-idx="' + i + '" data-field="name"', item.name));
    html += field("Organization / Issuer", textInput('data-arr="' + sectionKey + '" data-idx="' + i + '" data-field="organization"', item.organization));
    html += '</div></div>';
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
    var options = levels.map(function(lv) {
      return '<option value="' + lv + '"' + (lang.proficiency === lv ? " selected" : "") + '>' + lv + '</option>';
    }).join("");
    html += (
      '<div class="item-card mb-3 p-3">' +
        '<div class="d-flex gap-2 align-items-center">' +
          '<input type="text" class="form-control flex-grow-1" placeholder="Language (e.g. English)" data-arr="languages" data-idx="' + i + '" data-field="language" value="' + escapeAttr(lang.language) + '">' +
          '<select class="form-select w-auto" data-arr="languages" data-idx="' + i + '" data-field="proficiency">' + options + '</select>' +
          '<button class="btn btn-outline-danger btn-sm remove-item-btn" data-section="languages" data-index="' + i + '"><i class="fa-solid fa-trash"></i></button>' +
        '</div>' +
      '</div>'
    );
  }
  html += addItemBtn("Add Language", "languages");
  return html;
}

function renderRegionalDetailsForm(r) {
  r = r || {};
  var options = ["Not Applicable", "Exempted", "Completed", "Postponed"].map(function(opt) {
    return '<option value="' + opt + '"' + (r.militaryStatus === opt ? " selected" : "") + '>' + opt + '</option>';
  }).join("");

  return (
    '<div class="form-card">' +
      '<div class="form-check mb-4">' +
        '<input class="form-check-input" type="checkbox" id="regEnable" data-path="regionalDetails.enabled"' + (r.enabled ? " checked" : "") + '>' +
        '<label class="form-check-label fw-bold text-dark" for="regEnable">Enable Personal / Regional Information Section</label>' +
      '</div>' +
      '<div class="row g-3">' +
        field("Date of Birth",  textInput('data-path="regionalDetails.dateOfBirth"',  r.dateOfBirth)) +
        field("Nationality",    textInput('data-path="regionalDetails.nationality"',   r.nationality)) +
        field("Marital Status", textInput('data-path="regionalDetails.maritalStatus"', r.maritalStatus)) +
        '<div class="col-md-6"><label class="form-label">Military Status</label><select class="form-select" data-path="regionalDetails.militaryStatus">' + options + '</select></div>' +
      '</div>' +
    '</div>'
  );
}

function renderReferencesForm(ref) {
  ref = ref || {};
  return (
    '<div class="form-card">' +
      '<div class="form-check">' +
        '<input class="form-check-input" type="checkbox" id="refReq" data-path="references.availableUponRequest"' + (ref.availableUponRequest ? " checked" : "") + '>' +
        '<label class="form-check-label fw-bold text-dark" for="refReq">Show "References available upon request"</label>' +
      '</div>' +
    '</div>'
  );
}

function renderCustomizationForm(c) {
  c = c || {};
  var fonts = ["Inter", "Playfair Display", "Roboto Mono"];
  var fontOptions = fonts.map(function(f) {
    return '<option value="' + f + '"' + (c.font === f ? " selected" : "") + '>' + f + '</option>';
  }).join("");

  return (
    '<div class="form-card">' +
      '<div class="row g-3">' +
        '<div class="col-md-6">' +
          '<label class="form-label">Primary Theme Color</label>' +
          '<input type="color" class="form-control form-control-color w-100" style="height:44px;" data-path="customization.primaryColor" value="' + escapeAttr(c.primaryColor || "#2563EB") + '">' +
        '</div>' +
        '<div class="col-md-6">' +
          '<label class="form-label">Font Family</label>' +
          '<select class="form-select" data-path="customization.font">' + fontOptions + '</select>' +
        '</div>' +
      '</div>' +
    '</div>'
  );
}

/*  Main Section Renderer  */

function renderEditorSection(sectionKey) {
  currentActiveSection = sectionKey;

  var container  = document.getElementById("editorContent");
  var titleEl    = document.getElementById("sectionTitle");
  var subtitleEl = document.getElementById("sectionSubtitle");

  if (!container) return;

  var info = SECTION_INFO[sectionKey] || { title: sectionKey, subtitle: "" };
  if (titleEl)    titleEl.textContent    = info.title;
  if (subtitleEl) subtitleEl.textContent = info.subtitle;

  var state = window.CVState.getState();
  var html  = "";

  switch (sectionKey) {
    case "personalInfo":    html = renderPersonalInfoForm(state.personalInfo);                    break;
    case "summary":         html = renderSummaryForm(state.summary);                              break;
    case "experience":      html = renderExperienceForm(state.experience);                        break;
    case "education":       html = renderEducationForm(state.education);                          break;
    case "skills":          html = renderSkillsForm(state.skills);                                break;
    case "projects":        html = renderProjectsForm(state.projects);                            break;
    case "services":        html = renderServicesForm(state.services);                            break;
    case "certifications":  html = renderCertificationsForm(state.certifications);                break;
    case "courses":         html = renderSimpleListForm(state.courses, "courses", "Course", "Add Course"); break;
    case "awards":          html = renderSimpleListForm(state.awards, "awards", "Award", "Add Award");   break;
    case "volunteer":       html = renderSimpleListForm(state.volunteer, "volunteer", "Activity", "Add Volunteer Activity"); break;
    case "organizations":   html = renderSimpleListForm(state.organizations, "organizations", "Organization", "Add Organization"); break;
    case "languages":       html = renderLanguagesForm(state.languages);                          break;
    case "regionalDetails": html = renderRegionalDetailsForm(state.regionalDetails);              break;
    case "references":      html = renderReferencesForm(state.references);                        break;
    case "customization":   html = renderCustomizationForm(state.customization);                  break;
    default:                html = '<div class="form-card"><p>Section under construction.</p></div>';
  }

  container.innerHTML = html;
}

/*Event Delegation — single listener on the container  */

document.addEventListener("DOMContentLoaded", function() {
  var container = document.getElementById("editorContent");
  if (!container) return;

  /* Handle all input/change events via one delegated listener */
  container.addEventListener("input", function(e) {
    var el = e.target;

    if (el.hasAttribute("data-path")) {
      var path = el.getAttribute("data-path");
      var val  = el.type === "checkbox" ? el.checked : el.value;
      window.CVState.setState(path, val);
    }

    if (el.hasAttribute("data-arr")) {
      var arrName   = el.getAttribute("data-arr");
      var idx       = parseInt(el.getAttribute("data-idx"), 10);
      var fieldName = el.getAttribute("data-field");
      var value     = el.type === "checkbox" ? el.checked : el.value;

      /* If technologies, parse comma-separated string into array */
      if (fieldName === "technologies" && typeof value === "string") {
        value = value.split(",").map(function(s) { return s.trim(); }).filter(Boolean);
      }

      window.CVState.updateState(function(state) {
        if (state[arrName] && state[arrName][idx] !== undefined) {
          state[arrName][idx][fieldName] = value;
        }
      });
    }
  });

  /* "change" needed for checkbox to fire immediately on toggle */
  container.addEventListener("change", function(e) {
    var el = e.target;
    if (el.type !== "checkbox") return;

    if (el.hasAttribute("data-path")) {
      window.CVState.setState(el.getAttribute("data-path"), el.checked);
    }

    if (el.hasAttribute("data-arr")) {
      var arrName   = el.getAttribute("data-arr");
      var idx       = parseInt(el.getAttribute("data-idx"), 10);
      var fieldName = el.getAttribute("data-field");
      window.CVState.updateState(function(state) {
        if (state[arrName] && state[arrName][idx] !== undefined) {
          state[arrName][idx][fieldName] = el.checked;

          if (fieldName === "currentlyWorking") {
            renderEditorSection(currentActiveSection);
          }
        }
      });
    }
  });

  /* Remove item button */
  container.addEventListener("click", function(e) {
    var btn = e.target.closest(".remove-item-btn");
    if (!btn) return;

    var section = btn.getAttribute("data-section");
    var index   = parseInt(btn.getAttribute("data-index"), 10);

    window.CVState.updateState(function(state) {
      if (state[section]) {
        state[section].splice(index, 1);
      }
    });
    renderEditorSection(currentActiveSection);
  });

  /* Add item button */
  container.addEventListener("click", function(e) {
    var btn = e.target.closest(".add-item-btn");
    if (!btn) return;

    var section = btn.getAttribute("data-section");
    var defaults = ITEM_DEFAULTS[section];
    if (!defaults) return;

    window.CVState.updateState(function(state) {
      if (!state[section]) state[section] = [];
      var newItem = {};
      for (var key in defaults) {
        newItem[key] = Array.isArray(defaults[key]) ? [] : defaults[key];
      }
      state[section].push(newItem);
    });
    renderEditorSection(section);
  });
});

/* Init */

window.initEditor = function() {
  renderEditorSection("personalInfo");
};
