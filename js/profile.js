let currentFilter = "ALL";

document.addEventListener("DOMContentLoaded", () => {
  window.Auth.requireAuth();
  loadUserProfile();
  renderUserDocuments();
});

function getUserDocsKey(email) {
  return `xpvolio_docs_${email.toLowerCase().trim()}`;
}

function getUserDocs(email) {
  try {
    const data = localStorage.getItem(getUserDocsKey(email));
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveUserDocs(email, docs) {
  localStorage.setItem(getUserDocsKey(email), JSON.stringify(docs));
}

function loadUserProfile() {
  const currentUser = window.Auth.getCurrentUser();
  if (!currentUser) return;

  const profileName = document.getElementById("profileName");
  const profileEmail = document.getElementById("profileEmail");
  const userAvatar = document.getElementById("userAvatar");
  const editNameInput = document.getElementById("editNameInput");

  if (profileName) profileName.textContent = currentUser.name || "User";
  if (profileEmail) profileEmail.textContent = currentUser.email;
  if (editNameInput) editNameInput.value = currentUser.name || "";

  if (userAvatar && currentUser.name) {
    const initials = currentUser.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
    userAvatar.textContent = initials || "U";
  }
}

function renderUserDocuments() {
  const currentUser = window.Auth.getCurrentUser();
  if (!currentUser) return;

  let docs = getUserDocs(currentUser.email);

  if (docs.length === 0) {
    docs = [
      {
        id: "cv_" + Date.now(),
        title: "Software Engineer Resume",
        type: "CV",
        updatedAt: new Date().toLocaleDateString(),
        atsScore: 92
      },
      {
        id: "port_" + (Date.now() + 1),
        title: "Main Developer Portfolio",
        type: "Portfolio",
        updatedAt: new Date().toLocaleDateString(),
        isPublished: true,
        slug: (currentUser.name || "user").toLowerCase().replace(/\s+/g, '-')
      }
    ];
    saveUserDocs(currentUser.email, docs);
  }

  const cvs = docs.filter(d => d.type === "CV");
  const portfolios = docs.filter(d => d.type === "Portfolio");

  const totalCvsCount = document.getElementById("totalCvsCount");
  const totalPortfoliosCount = document.getElementById("totalPortfoliosCount");
  const avgAtsScore = document.getElementById("avgAtsScore");

  if (totalCvsCount) totalCvsCount.textContent = cvs.length;
  if (totalPortfoliosCount) totalPortfoliosCount.textContent = portfolios.length;

  if (avgAtsScore) {
    if (cvs.length > 0) {
      const totalScore = cvs.reduce((acc, curr) => acc + (curr.atsScore || 85), 0);
      avgAtsScore.textContent = Math.round(totalScore / cvs.length) + "%";
    } else {
      avgAtsScore.textContent = "--";
    }
  }

  let filteredDocs = docs;
  if (currentFilter !== "ALL") {
    filteredDocs = docs.filter(d => d.type === currentFilter);
  }

  const container = document.getElementById("documentsListContainer");
  if (!container) return;

  if (filteredDocs.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5 text-secondary">
        <i class="fa-regular fa-folder-open fs-1 mb-3 text-muted"></i>
        <p class="mb-0">No ${currentFilter === "ALL" ? "items" : currentFilter + "s"} found. Create one now!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredDocs.map(doc => {
    const isCV = doc.type === "CV";
    
    const typeBadge = isCV
      ? `<span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-2 py-1 small"><i class="fa-solid fa-id-card me-1"></i> Resume (CV)</span>`
      : `<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-2 py-1 small"><i class="fa-solid fa-globe me-1"></i> Live Portfolio</span>`;

    const statusBadge = isCV
      ? `<span class="small fw-semibold text-success"><i class="fa-solid fa-circle-check"></i> ATS ${doc.atsScore || 85}%</span>`
      : `<span class="small fw-semibold text-primary"><i class="fa-solid fa-signal"></i> ${doc.isPublished ? 'Live Online' : 'Draft'}</span>`;

    const editUrl = isCV ? `editor.html?view=cv&docId=${doc.id}` : `editor.html?view=portfolio&docId=${doc.id}`;

    return `
      <div class="col-12 col-md-6">
        <div class="doc-card p-3 h-100 d-flex flex-column justify-content-between">
          <div>
            <div class="d-flex align-items-center justify-content-between mb-2">
              ${typeBadge}
              ${statusBadge}
            </div>
            <h3 class="h6 fw-bold text-dark mb-1 text-truncate" title="${doc.title}">${doc.title}</h3>
            <p class="small text-secondary mb-3">Last modified: ${doc.updatedAt}</p>
          </div>

          <div class="d-flex align-items-center justify-content-between pt-2 border-top gap-2">
            <div class="d-flex gap-2">
              <a href="${editUrl}" class="btn btn-sm btn-primary-custom px-3 rounded-2">
                <i class="fa-solid fa-pen-to-square me-1"></i> Edit
              </a>
              ${!isCV ? `
                <button onclick="previewPortfolio('${doc.id}')" class="btn btn-sm btn-outline-success px-2 rounded-2" title="View Live Portfolio">
                  <i class="fa-solid fa-arrow-up-right-from-square"></i>
                </button>
              ` : ''}
            </div>

            <div class="d-flex gap-1">
              <button onclick="duplicateDocument('${doc.id}')" class="btn btn-sm btn-light border text-secondary" title="Duplicate">
                <i class="fa-regular fa-copy"></i>
              </button>
              <button onclick="deleteDocument('${doc.id}')" class="btn btn-sm btn-light border text-danger" title="Delete">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.filterDocs = function(type, btn) {
  currentFilter = type;
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  renderUserDocuments();
};

window.promptCreateDoc = function(type) {
  const currentUser = window.Auth.getCurrentUser();
  if (!currentUser) return;

  const defaultTitle = type === "CV" ? "Software Engineer Resume" : "Web Developer Portfolio";
  const title = prompt(`Enter a title for your new ${type}:`, defaultTitle);
  if (!title || !title.trim()) return;

  const docs = getUserDocs(currentUser.email);
  const newDoc = {
    id: (type === "CV" ? "cv_" : "port_") + Date.now(),
    title: title.trim(),
    type: type,
    updatedAt: new Date().toLocaleDateString(),
    atsScore: type === "CV" ? 88 : undefined,
    isPublished: type === "Portfolio" ? true : undefined
  };

  docs.unshift(newDoc);
  saveUserDocs(currentUser.email, docs);
  renderUserDocuments();

  const targetView = type === "CV" ? "cv" : "portfolio";
  window.location.href = `editor.html?view=${targetView}&docId=${newDoc.id}`;
};

window.previewPortfolio = function(docId) {
  window.location.href = `editor.html?view=portfolio&docId=${docId}`;
};

window.duplicateDocument = function(docId) {
  const currentUser = window.Auth.getCurrentUser();
  if (!currentUser) return;

  const docs = getUserDocs(currentUser.email);
  const target = docs.find(d => d.id === docId);
  if (!target) return;

  const duplicated = {
    ...target,
    id: (target.type === "CV" ? "cv_" : "port_") + Date.now(),
    title: target.title + " (Copy)",
    updatedAt: new Date().toLocaleDateString()
  };

  docs.unshift(duplicated);
  saveUserDocs(currentUser.email, docs);
  renderUserDocuments();
};

window.deleteDocument = function(docId) {
  if (!confirm("Are you sure you want to delete this item?")) return;

  const currentUser = window.Auth.getCurrentUser();
  if (!currentUser) return;

  let docs = getUserDocs(currentUser.email);
  docs = docs.filter(d => d.id !== docId);
  saveUserDocs(currentUser.email, docs);
  renderUserDocuments();
};

window.handleUpdateProfile = function(e) {
  e.preventDefault();
  const currentUser = window.Auth.getCurrentUser();
  if (!currentUser) return;

  const newName = document.getElementById("editNameInput").value.trim();
  const newPass = document.getElementById("editPasswordInput").value;

  if (!newName) return;

  const users = window.Auth.loadUsers();
  if (users[currentUser.email]) {
    users[currentUser.email].name = newName;
    if (newPass.trim()) {
      users[currentUser.email].password = newPass;
    }
    window.Auth.users = users;
    window.Auth.saveUsers();
    window.Auth.saveSession({ name: newName, email: currentUser.email });
  }

  const modalEl = document.getElementById("editProfileModal");
  const modal = bootstrap.Modal.getInstance(modalEl);
  if (modal) modal.hide();

  loadUserProfile();

  const alertBox = document.getElementById("profileAlert");
  if (alertBox) {
    alertBox.textContent = "Profile updated successfully!";
    alertBox.classList.remove("d-none");
    setTimeout(() => alertBox.classList.add("d-none"), 3000);
  }
};