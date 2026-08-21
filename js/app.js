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

  function setupUserUI() {
    if (currentUser) {
      setupLoggedInUser();
    } else {
      setupGuestUser();
    }
  }

  function setupLoggedInUser() {
    if (userNameEl) {
      userNameEl.textContent = currentUser.name || currentUser.email;
    }

    if (publishBtn) {
      publishBtn.classList.remove("d-none");
    }
  }

  function setupGuestUser() {
    if (userNameEl) {
      userNameEl.textContent = "Guest Mode";
    }

    if (userPill) {
      userPill.title = "Sign In to Save Account to Dashboard";
    }

    if (signOutBtn) {
      signOutBtn.title = "Sign In";

      signOutBtn.className =
        "btn btn-sm btn-outline-primary rounded-pill px-2 px-md-3";

      signOutBtn.innerHTML =
        '<i class="fa-solid fa-arrow-right-to-bracket me-1"></i>' +
        '<span class="d-none d-lg-inline">Sign In</span>';

      signOutBtn.onclick = function () {
        window.location.href = "login.html";
      };
    }

    if (publishBtn) {
      publishBtn.classList.add("d-none");
    }
  }

  function setupDocumentTitle() {
    if (!docTitleInput || !window.CVState) {
      return;
    }

    var state = window.CVState.getState();
    docTitleInput.value = state.docTitle || "";

    function autoFitInputWidth() {
      var len =
        docTitleInput.value.length || docTitleInput.placeholder.length || 10;
      docTitleInput.style.width = Math.max(len + 2, 8) + "ch";
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
        navItems.forEach(function (nav) {
          nav.classList.remove("active");
        });

        item.classList.add("active");

        var section = item.getAttribute("data-section");

        if (typeof renderEditorSection === "function") {
          renderEditorSection(section);
        }
      });
    });
  }

  function setActiveViewBtn(btn, isActive) {
    if (btn) {
      btn.classList.toggle("active", isActive);
    }
  }

  function switchPreviewView(viewName) {
    var isPortfolio = viewName === "portfolio";

    var activeDocId = window.CVState?.getActiveDocId() || "default_doc";

    downloadBtn?.classList.remove("d-none");

    setActiveViewBtn(cvViewBtn, !isPortfolio);
    setActiveViewBtn(portfolioViewBtn, isPortfolio);

    cvWrapper?.classList.toggle("d-none", isPortfolio);
    portfolioWrapper?.classList.toggle("d-none", !isPortfolio);

    if (isPortfolio) {
      showPortfolioPreview(activeDocId);
    } else {
      showCvPreview(activeDocId);
    }
  }

  function showPortfolioPreview(activeDocId) {
    if (typeof renderPortfolio === "function") {
      renderPortfolio();
    }

    if (openFullPortfolioBtn) {
      openFullPortfolioBtn.href = `portfolio.html?docId=${encodeURIComponent(activeDocId)}`;
    }
  }

  function showCvPreview(activeDocId) {
    if (openFullCvBtn) {
      openFullCvBtn.href = `cv.html?docId=${encodeURIComponent(activeDocId)}`;
    }
  }

  cvViewBtn?.addEventListener("click", function () {
    switchPreviewView("cv");
  });

  portfolioViewBtn?.addEventListener("click", function () {
    switchPreviewView("portfolio");
  });

  initializePreviewFromUrl();

  function initializePreviewFromUrl() {
    var urlParams = new URLSearchParams(window.location.search);

    var view = urlParams.get("view");

    if (view === "portfolio") {
      switchPreviewView("portfolio");
    } else {
      switchPreviewView("cv");
    }
  }

  if (publishBtn) {
    publishBtn.addEventListener("click", handlePublish);
  }

  function handlePublish() {
    if (!currentUser || !currentUser.email) {
      alert("Please sign in before publishing.");
      window.location.href = "login.html";
      return;
    }

    var isPortfolio =
      portfolioWrapper && !portfolioWrapper.classList.contains("d-none");

    var docType = isPortfolio ? "Portfolio" : "CV";

    var newDocId = (isPortfolio ? "port_" : "cv_") + Date.now();

    var currentState = window.CVState
      ? JSON.parse(JSON.stringify(window.CVState.getState()))
      : {};

    var currentTitle = currentState.docTitle || "New " + docType;

    if (
      window.CVState &&
      typeof window.CVState.calculateAtsScore === "function"
    ) {
      atsScore = window.CVState.calculateAtsScore();
    }

    currentState.docId = newDocId;
    currentState.docTitle = currentTitle;

    var emailClean = currentUser.email.toLowerCase().trim();

    var listKey = "xpvolio_docs_" + emailClean;

    var newStorageKey = "xpvolio_state_" + emailClean + "_" + newDocId;

    try {
      saveDocument(newStorageKey, currentState);

      saveDocumentToList(listKey, newDocId, currentTitle, docType, atsScore);

      updateEditorUrl(isPortfolio, newDocId, currentTitle);
    } catch (error) {
      console.error("Save/Publish error:", error);

      alert("Something went wrong while saving your document.");

      return;
    }

    alert(`Your new ${docType} has been saved successfully.`);

    openPublishedDocument(isPortfolio, newDocId);
  }

  function saveDocument(storageKey, state) {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function saveDocumentToList(listKey, docId, title, type, atsScore) {
    var docs = [];

    var savedDocs = localStorage.getItem(listKey);

    if (savedDocs) {
      try {
        docs = JSON.parse(savedDocs);

        if (!Array.isArray(docs)) {
          docs = [];
        }
      } catch (error) {
        console.error("Error reading documents list:", error);

        docs = [];
      }
    }

    docs.unshift({
      id: docId,
      title: title,
      type: type,
      updatedAt: new Date().toLocaleDateString(),
      isPublished: true,
      atsScore: atsScore,
    });

    localStorage.setItem(listKey, JSON.stringify(docs));
  }

  function updateEditorUrl(isPortfolio, docId, title) {
    var view = isPortfolio ? "portfolio" : "cv";

    var newUrl =
      `editor.html?view=${view}` +
      `&docId=${encodeURIComponent(docId)}` +
      `&title=${encodeURIComponent(title)}`;

    window.history.replaceState(null, "", newUrl);
  }

  function openPublishedDocument(isPortfolio, docId) {
    var targetPage = isPortfolio ? "portfolio.html" : "cv.html";

    var url = `${targetPage}?docId=${encodeURIComponent(docId)}`;

    window.open(url, "_blank");
  }
});
