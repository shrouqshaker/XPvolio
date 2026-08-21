function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

var currentFilter = "ALL";

document.addEventListener("DOMContentLoaded", function () {
  window.Auth.requireAuth();
  loadUserProfile();
  renderUserDocuments();
});

function getActiveUser() {
  return window.Auth ? window.Auth.getCurrentUser() : null;
}

function getUserDocsKey(email) {
  return "xpvolio_docs_" + email.toLowerCase().trim();
}

function getUserDocs(email) {
  try {
    var data = localStorage.getItem(getUserDocsKey(email));
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveUserDocs(email, docs) {
  try {
    localStorage.setItem(getUserDocsKey(email), JSON.stringify(docs));
  } catch (e) {
    console.error("Save docs error:", e);
  }
}

function loadUserProfile() {
  var currentUser = getActiveUser();
  if (!currentUser) return;

  var profileName = document.getElementById("profileName");
  var profileEmail = document.getElementById("profileEmail");
  var userAvatar = document.getElementById("userAvatar");
  var editNameInput = document.getElementById("editNameInput");

  if (profileName) profileName.textContent = currentUser.name || "User";
  if (profileEmail) profileEmail.textContent = currentUser.email;
  if (editNameInput) editNameInput.value = currentUser.name || "";

  if (userAvatar && currentUser.name) {
    var parts = currentUser.name.trim().split(" ");
    var initials = "";
    for (var i = 0; i < parts.length && i < 2; i++) {
      if (parts[i].length > 0) initials += parts[i][0].toUpperCase();
    }
    userAvatar.textContent = initials || "U";
  }
}

function renderUserDocuments() {
  var currentUser = getActiveUser();
  if (!currentUser) return;

  var docs = getUserDocs(currentUser.email);

  var cvCount = 0;
  var portfolioCount = 0;
  var totalAts = 0;

  for (var i = 0; i < docs.length; i++) {
    if (docs[i].type === "CV") {
      cvCount++;
      totalAts += docs[i].atsScore || 0;
    } else if (docs[i].type === "Portfolio") {
      portfolioCount++;
    }
  }

  var totalCvsCount = document.getElementById("totalCvsCount");
  var totalPortfoliosCount = document.getElementById("totalPortfoliosCount");
  var avgAtsScore = document.getElementById("avgAtsScore");

  if (totalCvsCount) totalCvsCount.textContent = cvCount;
  if (totalPortfoliosCount) totalPortfoliosCount.textContent = portfolioCount;
  if (avgAtsScore) {
    avgAtsScore.textContent =
      cvCount > 0 ? Math.round(totalAts / cvCount) + "%" : "--";
  }

  var filteredDocs = [];
  for (var j = 0; j < docs.length; j++) {
    if (currentFilter === "ALL" || docs[j].type === currentFilter) {
      filteredDocs.push(docs[j]);
    }
  }

  var container = document.getElementById("documentsListContainer");
  if (!container) return;

  if (filteredDocs.length === 0) {
    var filterLabel =
      currentFilter === "ALL" ? "resumes or portfolios" : currentFilter + "s";
    container.innerHTML = [
      '<div class="col-12 text-center py-5">',
      '<div class="p-3 bg-light rounded-circle d-inline-flex mb-3">',
      '<i class="fa-regular fa-folder-open fs-2 text-muted"></i>',
      "</div>",
      '<h3 class="h6 fw-bold text-dark mb-1">No ' + filterLabel + " yet</h3>",
      '<p class="text-secondary small mb-3">You haven\'t created any documents yet. Start crafting your first one!</p>',
      '<div class="d-flex justify-content-center gap-2">',
      '<button onclick="promptCreateDoc(\'CV\')" class="btn btn-sm btn-primary-custom px-3 rounded-2">',
      '<i class="fa-solid fa-plus me-1"></i> Create Resume (CV)',
      "</button>",
      '<button onclick="promptCreateDoc(\'Portfolio\')" class="btn btn-sm btn-outline-primary px-3 rounded-2">',
      '<i class="fa-solid fa-plus me-1"></i> Create Portfolio',
      "</button>",
      "</div>",
      "</div>",
    ].join("");
    return;
  }

  var html = "";
  for (var k = 0; k < filteredDocs.length; k++) {
    var doc = filteredDocs[k];
    var isCV = doc.type === "CV";
    var safeTitle = escapeHtml(doc.title);

    var typeBadge = isCV
      ? '<span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-2 py-1 small"><i class="fa-solid fa-id-card me-1"></i> Resume (CV)</span>'
      : '<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-2 py-1 small"><i class="fa-solid fa-globe me-1"></i> Live Portfolio</span>';

    var statusBadge = isCV
      ? '<span class="small fw-semibold text-success"><i class="fa-solid fa-circle-check"></i> ATS ' +
        (doc.atsScore || 0) +
        "%</span>"
      : '<span class="small fw-semibold text-primary"><i class="fa-solid fa-signal"></i> ' +
        (doc.isPublished ? "Live Online" : "Draft") +
        "</span>";

    var editUrl = isCV
      ? "editor.html?view=cv&docId=" + encodeURIComponent(doc.id)
      : "editor.html?view=portfolio&docId=" + encodeURIComponent(doc.id);

    html += [
      '<div class="col-12 col-md-6">',
      '<div class="doc-card p-3 h-100 d-flex flex-column justify-content-between">',
      "<div>",
      '<div class="d-flex align-items-center justify-content-between mb-2">',
      typeBadge,
      statusBadge,
      "</div>",
      '<h3 class="h6 fw-bold text-dark mb-1 text-truncate" title="' +
        safeTitle +
        '">' +
        safeTitle +
        "</h3>",
      '<p class="small text-secondary mb-3">Last modified: ' +
        escapeHtml(doc.updatedAt || "") +
        "</p>",
      "</div>",
      '<div class="d-flex align-items-center justify-content-between pt-2 border-top gap-2">',
      '<div class="d-flex gap-2">',
      '<a href="' +
        editUrl +
        '" class="btn btn-sm btn-primary-custom px-3 rounded-2">',
      '<i class="fa-solid fa-pen-to-square me-1"></i> Edit',
      "</a>",
      isCV
        ? '<a href="cv.html?docId=' +
          encodeURIComponent(doc.id) +
          '" target="_blank" class="btn btn-sm btn-outline-primary px-2 rounded-2" title="Open Full CV"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>'
        : '<a href="portfolio.html?docId=' +
          encodeURIComponent(doc.id) +
          '" target="_blank" class="btn btn-sm btn-outline-success px-2 rounded-2" title="Open Live Portfolio"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>',
      "</div>",
      '<div class="d-flex gap-1">',
      "<button onclick=\"duplicateDocument('" +
        doc.id +
        '\')" class="btn btn-sm btn-light border text-secondary" title="Duplicate">',
      '<i class="fa-regular fa-copy"></i>',
      "</button>",
      "<button onclick=\"deleteDocument('" +
        doc.id +
        '\')" class="btn btn-sm btn-light border text-danger" title="Delete">',
      '<i class="fa-regular fa-trash-can"></i>',
      "</button>",
      "</div>",
      "</div>",
      "</div>",
      "</div>",
    ].join("");
  }

  container.innerHTML = html;
}

window.filterDocs = function (type, btn) {
  currentFilter = type;
  var buttons = document.querySelectorAll(".filter-btn");
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove("active");
  }
  if (btn) btn.classList.add("active");
  renderUserDocuments();
};

window.promptCreateDoc = function (type) {
  var currentUser = getActiveUser();
  if (!currentUser) return;

  var title = prompt("Enter a title for your new " + type + ":", "");
  if (!title || !title.trim()) return;

  var trimmedTitle = title.trim();
  var docId = (type === "CV" ? "cv_" : "port_") + Date.now();

  var docs = getUserDocs(currentUser.email);
  var newDoc = {
    id: docId,
    title: trimmedTitle,
    type: type,
    updatedAt: new Date().toLocaleDateString(),
    atsScore: type === "CV" ? 0 : undefined,
    isPublished: type === "Portfolio" ? true : undefined,
  };

  docs.unshift(newDoc);
  saveUserDocs(currentUser.email, docs);

  var storageKey =
    "xpvolio_state_" + currentUser.email.toLowerCase().trim() + "_" + docId;

  var initialState;
  if (window.CVState && typeof window.CVState.getDefaultState === "function") {
    initialState = window.CVState.getDefaultState();
    initialState.docId = docId;
    initialState.docTitle = trimmedTitle;
  } else {
    initialState = {
      docId: docId,
      docTitle: trimmedTitle,
      personalInfo: {
        fullName: currentUser.name || "Your Name",
        professionalTitle: "",
        email: currentUser.email || "user@example.com",
        phone: "",
        address: "",
        socialLinks: { linkedin: "", github: "", website: "", behance: "" },
      },
      summary: "",
      experience: [],
      education: [],
      skills: [],
      projects: [],
      services: [],
      certifications: [],
      courses: [],
      languages: [],
      awards: [],
      volunteer: [],
      organizations: [],
      regionalDetails: {
        enabled: false,
        dateOfBirth: "",
        nationality: "",
        maritalStatus: "",
        militaryStatus: "Not Applicable",
      },
      references: { availableUponRequest: true },
      customization: { primaryColor: "#004ac6", font: "Inter" },
    };
  }

  localStorage.setItem(storageKey, JSON.stringify(initialState));
  renderUserDocuments();

  var targetView = type === "CV" ? "cv" : "portfolio";
  window.location.href =
    "editor.html?view=" +
    targetView +
    "&docId=" +
    docId +
    "&title=" +
    encodeURIComponent(trimmedTitle);
};

window.previewPortfolio = function (docId) {
  window.location.href = "portfolio.html?docId=" + encodeURIComponent(docId);
};

window.duplicateDocument = function (docId) {
  var currentUser = getActiveUser();
  if (!currentUser) return;

  var docs = getUserDocs(currentUser.email);
  var target = null;
  for (var i = 0; i < docs.length; i++) {
    if (docs[i].id === docId) {
      target = docs[i];
      break;
    }
  }
  if (!target) return;

  var newDocId = (target.type === "CV" ? "cv_" : "port_") + Date.now();
  var duplicatedTitle = target.title + " (Copy)";

  var duplicated = {
    id: newDocId,
    title: duplicatedTitle,
    type: target.type,
    updatedAt: new Date().toLocaleDateString(),
    atsScore: target.atsScore,
    isPublished: target.isPublished,
  };

  docs.unshift(duplicated);
  saveUserDocs(currentUser.email, docs);

  var emailClean = currentUser.email.toLowerCase().trim();
  var oldKey = "xpvolio_state_" + emailClean + "_" + docId;
  var newKey = "xpvolio_state_" + emailClean + "_" + newDocId;

  try {
    var oldState = localStorage.getItem(oldKey);
    if (oldState) {
      var parsedState = JSON.parse(oldState);
      parsedState.docId = newDocId;
      parsedState.docTitle = duplicatedTitle;
      localStorage.setItem(newKey, JSON.stringify(parsedState));
    }
  } catch (e) {
    console.error("Duplicate state error:", e);
  }

  renderUserDocuments();
};

window.deleteDocument = function (docId) {
  if (!confirm("Are you sure you want to delete this item?")) return;

  var currentUser = getActiveUser();
  if (!currentUser) return;

  var docs = getUserDocs(currentUser.email);
  var updatedDocs = [];
  for (var i = 0; i < docs.length; i++) {
    if (docs[i].id !== docId) {
      updatedDocs.push(docs[i]);
    }
  }

  saveUserDocs(currentUser.email, updatedDocs);

  var storageKey =
    "xpvolio_state_" + currentUser.email.toLowerCase().trim() + "_" + docId;
  localStorage.removeItem(storageKey);

  renderUserDocuments();
};

window.handleUpdateProfile = function (e) {
  e.preventDefault();
  var currentUser = getActiveUser();
  if (!currentUser) return;

  var newNameInput = document.getElementById("editNameInput");
  var newPassInput = document.getElementById("editPasswordInput");

  var newName = newNameInput ? newNameInput.value.trim() : "";
  var newPass = newPassInput ? newPassInput.value : "";

  if (!newName) return;

  window.Auth.updateUser(newName, newPass);

  var modalEl = document.getElementById("editProfileModal");
  if (modalEl && typeof bootstrap !== "undefined") {
    var modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  }

  loadUserProfile();

  var alertBox = document.getElementById("profileAlert");
  if (alertBox) {
    alertBox.textContent = "Profile updated successfully!";
    alertBox.classList.remove("d-none");
    setTimeout(function () {
      alertBox.classList.add("d-none");
    }, 3000);
  }
};