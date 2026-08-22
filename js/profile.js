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

  if (profileName) profileName.textContent = currentUser.name;
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
  container.innerHTML = "";

  if (filteredDocs.length === 0) {
    var filterLabel =
      currentFilter === "ALL" ? "resumes or portfolios" : `${currentFilter}s`;

    var showCV = currentFilter === "ALL" || currentFilter === "CV";
    var showPortfolio =
      currentFilter === "ALL" || currentFilter === "Portfolio";

    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="p-3 bg-light rounded-circle d-inline-flex mb-3">
          <i class="fa-regular fa-folder-open fs-2 text-muted"></i>
        </div>
        <h3 class="h6 fw-bold text-dark mb-1">No ${filterLabel} yet</h3>
        <p class="text-secondary small mb-3">You haven't created any documents yet. Start crafting your first one!</p>
        <div class="d-flex justify-content-center gap-2">
          ${
            showCV
              ? `<button onclick="promptCreateDoc('CV')" class="btn btn-sm btn-primary-custom px-3 rounded-2">
                  <i class="fa-solid fa-plus me-1"></i> Create Resume (CV)
                </button>`
              : ""
          }
          ${
            showPortfolio
              ? `<button onclick="promptCreateDoc('Portfolio')" class="btn btn-sm btn-outline-primary px-3 rounded-2">
                  <i class="fa-solid fa-plus me-1"></i> Create Portfolio
                </button>`
              : ""
          }
        </div>
      </div>
    `;
    return;
  }

  filteredDocs.forEach(function (doc) {
    var isCV = doc.type === "CV";
    var encodedId = encodeURIComponent(doc.id);

    var col = document.createElement("div");
    col.className = "col-12 col-md-6";

    var docCard = document.createElement("div");
    docCard.className =
      "doc-card p-3 h-100 d-flex flex-column justify-content-between";

    var topSection = document.createElement("div");

    var badgesRow = document.createElement("div");
    badgesRow.className =
      "d-flex align-items-center justify-content-between mb-2";

    var typeBadge = document.createElement("span");
    if (isCV) {
      typeBadge.className =
        "badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-2 py-1 small";
      typeBadge.innerHTML =
        '<i class="fa-solid fa-id-card me-1"></i> Resume (CV)';
    } else {
      typeBadge.className =
        "badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-2 py-1 small";
      typeBadge.innerHTML =
        '<i class="fa-solid fa-globe me-1"></i> Live Portfolio';
    }

    var statusBadge = document.createElement("span");
    statusBadge.className = isCV
      ? "small fw-semibold text-success"
      : "small fw-semibold text-primary";
    statusBadge.innerHTML = isCV
      ? `<i class="fa-solid fa-circle-check"></i> ATS ${doc.atsScore}%`
      : `<i class="fa-solid fa-signal"></i> ${doc.isPublished ? "Live Online" : "Draft"}`;

    badgesRow.appendChild(typeBadge);
    badgesRow.appendChild(statusBadge);

    var titleEl = document.createElement("h3");
    titleEl.className = "h6 fw-bold text-dark mb-1 text-truncate";
    titleEl.textContent = doc.title || "Untitled";
    titleEl.title = doc.title || "Untitled";

    var lastModifiedEl = document.createElement("p");
    lastModifiedEl.className = "small text-secondary mb-3";
    lastModifiedEl.textContent = "Last modified: " + (doc.updatedAt || "");

    topSection.appendChild(badgesRow);
    topSection.appendChild(titleEl);
    topSection.appendChild(lastModifiedEl);

    var bottomSection = document.createElement("div");
    bottomSection.className =
      "d-flex align-items-center justify-content-between pt-2 border-top gap-2";

    var leftButtons = document.createElement("div");
    leftButtons.className = "d-flex gap-2";

    var editUrl = `editor.html?view=${isCV ? "cv" : "portfolio"}&docId=${encodedId}`;
    var viewUrl = isCV
      ? `cv.html?docId=${encodedId}`
      : `portfolio.html?docId=${encodedId}`;

    leftButtons.innerHTML = `
      <a href="${editUrl}" class="btn btn-sm btn-primary-custom px-3 rounded-2">
        <i class="fa-solid fa-pen-to-square me-1"></i> Edit
      </a>
      <a href="${viewUrl}" target="_blank" class="btn btn-sm ${isCV ? "btn-outline-primary" : "btn-outline-success"} px-2 rounded-2" title="${isCV ? "Open Full CV" : "Open Live Portfolio"}">
        <i class="fa-solid fa-arrow-up-right-from-square"></i>
      </a>
    `;

    var rightButtons = document.createElement("div");
    rightButtons.className = "d-flex gap-1";

    var duplicateBtn = document.createElement("button");
    duplicateBtn.className = "btn btn-sm btn-light border text-secondary";
    duplicateBtn.title = "Duplicate";
    duplicateBtn.innerHTML = '<i class="fa-regular fa-copy"></i>';
    duplicateBtn.onclick = function () {
      duplicateDocument(doc.id);
    };

    var deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-sm btn-light border text-danger";
    deleteBtn.title = "Delete";
    deleteBtn.innerHTML = '<i class="fa-regular fa-trash-can"></i>';
    deleteBtn.onclick = function () {
      deleteDocument(doc.id);
    };

    rightButtons.appendChild(duplicateBtn);
    rightButtons.appendChild(deleteBtn);

    bottomSection.appendChild(leftButtons);
    bottomSection.appendChild(rightButtons);

    docCard.appendChild(topSection);
    docCard.appendChild(bottomSection);
    col.appendChild(docCard);
    container.appendChild(col);
  });
}

window.filterDocs = function (type, btn) {
  currentFilter = type;
  document.querySelectorAll(".filter-btn").forEach(function (b) {
    b.classList.remove("active");
  });
  if (btn) btn.classList.add("active");
  renderUserDocuments();
};

window.promptCreateDoc = function (type) {
  var currentUser = getActiveUser();
  if (!currentUser) {
    alert("Please sign in first.");
    return;
  }

  var title = prompt(`Enter a title for your new ${type}:`, "");
  if (!title || !title.trim()) return;

  var trimmedTitle = title.trim();
  var isCV = type === "CV";
  var docId = `${isCV ? "cv_" : "port_"}${Date.now()}`;

  var docs = getUserDocs(currentUser.email);
  docs.unshift({
    id: docId,
    title: trimmedTitle,
    type: type,
    updatedAt: new Date().toLocaleDateString(),
    atsScore: isCV ? 0 : undefined,
    isPublished: isCV ? undefined : true,
  });
  saveUserDocs(currentUser.email, docs);

  var defaultState = window.CVState.getDefaultState();

  var storageKey = `xpvolio_state_${currentUser.email.toLowerCase().trim()}_${docId}`;
  var initialState = Object.assign({}, defaultState, {
    docId: docId,
    docTitle: trimmedTitle,
  });

  try {
    localStorage.setItem(storageKey, JSON.stringify(initialState));
  } catch (err) {
    console.error("Storage error:", err);
  }

  currentFilter = "ALL";
  document.querySelectorAll(".filter-btn").forEach(function (btn) {
    btn.classList.remove("active");
    if (btn.getAttribute("data-filter") === "ALL" || btn.textContent.trim().toUpperCase() === "ALL") {
      btn.classList.add("active");
    }
  });

  renderUserDocuments();
};

window.previewPortfolio = function (docId) {
  window.open(`portfolio.html?docId=${encodeURIComponent(docId)}`, "_blank");
};

window.previewCv = function (docId) {
  window.open(`cv.html?docId=${encodeURIComponent(docId)}`, "_blank");
};

window.duplicateDocument = function (docId) {
  var currentUser = getActiveUser();
  if (!currentUser) return;

  var docs = getUserDocs(currentUser.email);
  var target = docs.find(function (d) {
    return d.id === docId;
  });
  if (!target) return;

  var isCV = target.type === "CV";
  var newDocId = `${isCV ? "cv_" : "port_"}${Date.now()}`;
  var duplicatedTitle = `${target.title} (Copy)`;

  docs.unshift({
    ...target,
    id: newDocId,
    title: duplicatedTitle,
    updatedAt: new Date().toLocaleDateString(),
  });
  saveUserDocs(currentUser.email, docs);

  var emailClean = currentUser.email.toLowerCase().trim();
  var oldKey = `xpvolio_state_${emailClean}_${docId}`;
  var newKey = `xpvolio_state_${emailClean}_${newDocId}`;

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
  var updatedDocs = docs.filter(function (doc) {
    return doc.id !== docId;
  });
  saveUserDocs(currentUser.email, updatedDocs);

  var emailClean = currentUser.email.toLowerCase().trim();
  localStorage.removeItem(`xpvolio_state_${emailClean}_${docId}`);

  renderUserDocuments();
};

window.handleUpdateProfile = function (e) {
  e.preventDefault();
  var currentUser = getActiveUser();
  if (!currentUser) return;

  var newNameInput = document.getElementById("editNameInput");
  var newPassInput = document.getElementById("editPasswordInput");

  var newName = newNameInput?.value.trim() || "";
  var newPass = newPassInput?.value || "";

  if (!newName) return;

  window.Auth.updateUser(newName, newPass);

  if (newPassInput) newPassInput.value = "";

  var modalEl = document.getElementById("editProfileModal");
  if (modalEl && typeof bootstrap !== "undefined") {
    var modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.hide();
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
