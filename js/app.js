document.addEventListener("DOMContentLoaded", function() {
  window.Auth.requireAuth();

  /* User & Guest Header Display */
  var currentUser = window.Auth.getCurrentUser();
  var userNameEl  = document.getElementById("userNameDisplay");
  var userPill    = document.getElementById("userProfilePill");
  var signOutBtn  = document.getElementById("signOutBtn");

  if (currentUser) {
    if (userNameEl) userNameEl.textContent = currentUser.name || currentUser.email;
  } else {
    /* Guest User Mode */
    if (userNameEl) userNameEl.textContent = "Guest Mode";
    if (userPill) {
      userPill.href  = "login.html";
      userPill.title = "Sign In to Save Account to Dashboard";
    }
    if (signOutBtn) {
      signOutBtn.title = "Sign In";
      signOutBtn.className = "btn btn-sm btn-outline-primary rounded-pill px-2 px-md-3";
      signOutBtn.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket me-1"></i><span class="d-none d-lg-inline">Sign In</span>';
      signOutBtn.onclick = function() { window.location.href = "login.html"; };
    }
  }

  /* Doc title input */
  var docTitleInput = document.getElementById("docTitleInput");
  if (docTitleInput && window.CVState) {
    var state = window.CVState.getState();
    docTitleInput.value = state.docTitle || "";

    docTitleInput.addEventListener("input", function(e) {
      window.CVState.setState("docTitle", e.target.value);
    });
  }

  /* Init all modules */
  window.initAtsGauge();
  window.initCvPreview();
  window.initEditor();
  window.initPdfExport();

  /* Sidebar navigation */
  var navItems = document.querySelectorAll(".sidebar-panel .nav-link");

  for (var i = 0; i < navItems.length; i++) {
    (function(item) {
      item.addEventListener("click", function() {
        for (var j = 0; j < navItems.length; j++) {
          navItems[j].classList.remove("active");
        }
        item.classList.add("active");
        renderEditorSection(item.getAttribute("data-section"));
      });
    })(navItems[i]);
  }

  /* CV View vs. Portfolio View Switcher */
  function switchPreviewView(viewName) {
    var cvBtn        = document.getElementById("cvViewBtn");
    var portfolioBtn = document.getElementById("portfolioViewBtn");
    var cvWrapper    = document.getElementById("cvPreviewWrapper");
    var portWrapper  = document.getElementById("portfolioPreviewWrapper");
    var downloadBtn  = document.getElementById("downloadPdfBtn");

    var activeDocId = window.CVState ? window.CVState.getActiveDocId() : "default_doc";

    if (downloadBtn) {
      downloadBtn.classList.remove("d-none");
    }

    if (viewName === "portfolio") {
      if (portfolioBtn) portfolioBtn.classList.add("active");
      if (cvBtn)        cvBtn.classList.remove("active");
      if (cvWrapper)    cvWrapper.classList.add("d-none");
      if (portWrapper)  portWrapper.classList.remove("d-none");

      if (typeof renderPortfolio === "function") {
        renderPortfolio();
      }

      var fullPortLink = document.getElementById("openFullPortfolioBtn");
      if (fullPortLink) {
        fullPortLink.href = "portfolio.html?docId=" + encodeURIComponent(activeDocId);
      }
    } else {
      if (cvBtn)        cvBtn.classList.add("active");
      if (portfolioBtn) portfolioBtn.classList.remove("active");
      if (cvWrapper)    cvWrapper.classList.remove("d-none");
      if (portWrapper)  portWrapper.classList.add("d-none");

      var fullCvLink = document.getElementById("openFullCvBtn");
      if (fullCvLink) {
        fullCvLink.href = "cv.html?docId=" + encodeURIComponent(activeDocId);
      }
    }
  }

  var cvBtn        = document.getElementById("cvViewBtn");
  var portfolioBtn = document.getElementById("portfolioViewBtn");

  if (cvBtn) {
    cvBtn.addEventListener("click", function() {
      switchPreviewView("cv");
    });
  }

  if (portfolioBtn) {
    portfolioBtn.addEventListener("click", function() {
      switchPreviewView("portfolio");
    });
  }

  /* Check URL view parameter on load */
  var urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("view") === "portfolio") {
    switchPreviewView("portfolio");
  } else {
    switchPreviewView("cv");
  }

  /* Publish button */
  var publishBtn = document.getElementById("publishBtn");
  if (publishBtn) {
    publishBtn.addEventListener("click", function() {
      var activeDocId = window.CVState ? window.CVState.getActiveDocId() : "default_doc";
      alert("Your CV & Portfolio are published and live!");
      window.open("portfolio.html?docId=" + encodeURIComponent(activeDocId), "_blank");
    });
  }
});