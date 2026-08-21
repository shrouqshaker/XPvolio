document.addEventListener("DOMContentLoaded", function () {
  window.Auth.requireAuth();

  var currentUser = window.Auth.getCurrentUser();

  var userNameEl = document.getElementById("userNameDisplay");
  var userPill = document.getElementById("userProfilePill");
  var signOutBtn = document.getElementById("signOutBtn");
  var publishBtn = document.getElementById("publishBtn");
  var docTitleInput = document.getElementById("docTitleInput");
  var cvViewBtn = document.getElementById("cvViewBtn");
  var portfolioViewBtn = document.getElementById("portfolioViewBtn");
  var cvWrapper = document.getElementById("cvPreviewWrapper");
  var portfolioWrapper = document.getElementById("portfolioPreviewWrapper");
  var downloadBtn = document.getElementById("downloadPdfBtn");
  var openFullCvBtn = document.getElementById("openFullCvBtn");
  var openFullPortfolioBtn = document.getElementById("openFullPortfolioBtn");

  setupUserUI();
  setupDocumentTitle();
  initializeComponents();
  setupSidebarNavigation();
  initializePreviewFromUrl();

  function setupUserUI() {
    if (currentUser) {
      if (userNameEl) userNameEl.textContent = currentUser.name;
      if (publishBtn) publishBtn.classList.remove("d-none");
    } else {
      if (userNameEl) userNameEl.textContent = "Guest Mode";
      if (userPill) userPill.title = "Sign In to Save Account to Dashboard";
      if (publishBtn) publishBtn.classList.add("d-none");
      if (signOutBtn) {
        signOutBtn.title = "Sign In";
        signOutBtn.className = "btn btn-sm btn-outline-primary rounded-pill px-2 px-md-3";
        signOutBtn.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket me-1"></i><span class="d-none d-lg-inline">Sign In</span>';
        signOutBtn.onclick = function () { window.location.href = "login.html"; };
      }
    }
  }

  function setupDocumentTitle() {
    if (!docTitleInput || !window.CVState) return;

    var state = window.CVState.getState();
    docTitleInput.value = state.docTitle || "";

    function autoFitInputWidth() {
      var len = docTitleInput.value.length || docTitleInput.placeholder.length || 10;
      docTitleInput.style.width = `${Math.max(len - 1, 0)}ch`;
    }

    autoFitInputWidth();
    docTitleInput.addEventListener("input", function (e) {
      autoFitInputWidth();
      window.CVState.setState("docTitle", e.target.value);
    });
  }

  function initializeComponents() {
    window.initAtsGauge?.();
    window.initCvPreview?.();
    window.initEditor?.();
    window.initPdfExport?.();
  }

  function setupSidebarNavigation() {
    var navItems = document.querySelectorAll(".sidebar-panel .nav-link");
    navItems.forEach(function (item) {
      item.addEventListener("click", function () {
        navItems.forEach(function (nav) { nav.classList.remove("active"); });
        item.classList.add("active");

        var section = item.getAttribute("data-section");
        if (typeof renderEditorSection === "function") {
          renderEditorSection(section);
        }
      });
    });
  }

  function initializePreviewFromUrl() {
    var urlParams = new URLSearchParams(window.location.search);
    switchPreviewView(urlParams.get("view") === "portfolio" ? "portfolio" : "cv");
  }

  function switchPreviewView(viewName) {
    var isPortfolio = viewName === "portfolio";
    var activeDocId = window.CVState?.getActiveDocId?.() || "default_doc";

    downloadBtn?.classList.remove("d-none");
    cvViewBtn?.classList.toggle("active", !isPortfolio);
    portfolioViewBtn?.classList.toggle("active", isPortfolio);

    cvWrapper?.classList.toggle("d-none", isPortfolio);
    portfolioWrapper?.classList.toggle("d-none", !isPortfolio);

    if (isPortfolio) {
      if (typeof renderPortfolio === "function") renderPortfolio();
      if (openFullPortfolioBtn) {
        openFullPortfolioBtn.href = `portfolio.html?docId=${encodeURIComponent(activeDocId)}`;
      }
    } else {
      if (openFullCvBtn) {
        openFullCvBtn.href = `cv.html?docId=${encodeURIComponent(activeDocId)}`;
      }
    }
  }

  cvViewBtn?.addEventListener("click", function () { switchPreviewView("cv"); });
  portfolioViewBtn?.addEventListener("click", function () { switchPreviewView("portfolio"); });

  publishBtn?.addEventListener("click", handlePublish);

  function handlePublish() {
    if (!currentUser?.email) {
      alert("Please sign in before publishing.");
      window.location.href = "login.html";
      return;
    }

    var isPortfolio = portfolioWrapper && !portfolioWrapper.classList.contains("d-none");
    var docType = isPortfolio ? "Portfolio" : "CV";

    var activeDocId = window.CVState?.getActiveDocId?.() || `${isPortfolio ? "port_" : "cv_"}${Date.now()}`;

    var currentState = window.CVState ? JSON.parse(JSON.stringify(window.CVState.getState())) : {};
    var currentTitle = currentState.docTitle || `New ${docType}`;
    var atsScore = window.CVState?.calculateAtsScore?.() || 0;

    currentState.docId = activeDocId;
    currentState.docTitle = currentTitle;

    var emailClean = currentUser.email.toLowerCase().trim();
    var listKey = `xpvolio_docs_${emailClean}`;
    var newStorageKey = `xpvolio_state_${emailClean}_${activeDocId}`;

    try {
      localStorage.setItem(newStorageKey, JSON.stringify(currentState));
      saveDocumentToList(listKey, activeDocId, currentTitle, docType, atsScore);
      
      var newUrl = `editor.html?view=${isPortfolio ? "portfolio" : "cv"}&docId=${encodeURIComponent(activeDocId)}&title=${encodeURIComponent(currentTitle)}`;
      window.history.replaceState(null, "", newUrl);
    } catch (error) {
      console.error("Save/Publish error:", error);
      alert("Something went wrong while saving your document.");
      return;
    }

    alert(`Your ${docType} has been saved successfully.`);
    window.open(`${isPortfolio ? "portfolio.html" : "cv.html"}?docId=${encodeURIComponent(activeDocId)}`, "_blank");
  }

  function saveDocumentToList(listKey, docId, title, type, atsScore) {
    var docs = [];
    try {
      var savedDocs = localStorage.getItem(listKey);
      docs = savedDocs ? JSON.parse(savedDocs) : [];
      if (!Array.isArray(docs)) docs = [];
    } catch (e) {
      docs = [];
    }

    var updatedDocs = docs.filter(function (d) { return d.id !== docId; });
    updatedDocs.unshift({
      id: docId,
      title: title,
      type: type,
      updatedAt: new Date().toLocaleDateString(),
      isPublished: true,
      atsScore: atsScore,
    });

    localStorage.setItem(listKey, JSON.stringify(updatedDocs));
  }
});