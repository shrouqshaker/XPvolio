document.addEventListener("DOMContentLoaded", function () {
  window.Auth.requireAuth();
  var currentUser = window.Auth.getCurrentUser();
  var userNameEl = document.getElementById("userNameDisplay");
  var userPill = document.getElementById("userProfilePill");
  var signOutBtn = document.getElementById("signOutBtn");

  if (currentUser) {
    if (userNameEl)
      userNameEl.textContent = currentUser.name || currentUser.email;
  } else {
    if (userNameEl) userNameEl.textContent = "Guest Mode";
    if (userPill) {
      userPill.href = "login.html";
      userPill.title = "Sign In to Save Account to Dashboard";
    }
    if (signOutBtn) {
      signOutBtn.title = "Sign In";
      signOutBtn.className =
        "btn btn-sm btn-outline-primary rounded-pill px-2 px-md-3";
      signOutBtn.innerHTML =
        '<i class="fa-solid fa-arrow-right-to-bracket me-1"></i><span class="d-none d-lg-inline">Sign In</span>';
      signOutBtn.onclick = function () {
        window.location.href = "login.html";
      };
    }
  }

  var docTitleInput = document.getElementById("docTitleInput");
  if (docTitleInput && window.CVState) {
    docTitleInput.value = window.CVState.getState().docTitle || "";
    docTitleInput.addEventListener("input", function (e) {
      window.CVState.setState("docTitle", e.target.value);
    });
  }

  /* 3. Initialize All Modules */
  window.initAtsGauge?.();
  window.initCvPreview?.();
  window.initEditor?.();
  window.initPdfExport?.();

  /* 4. Sidebar Navigation */
  var navItems = document.querySelectorAll(".sidebar-panel .nav-link");
  navItems.forEach(function (item) {
    item.addEventListener("click", function () {
      navItems.forEach((nav) => nav.classList.remove("active"));
      item.classList.add("active");
      renderEditorSection(item.getAttribute("data-section"));
    });
  });

  /* 5. CV vs. Portfolio View Switcher */
  function setActiveViewBtn(btn, isActive) {
    if (btn) btn.classList.toggle("active", isActive);
  }

  function switchPreviewView(viewName) {
    var cvBtn = document.getElementById("cvViewBtn");
    var portfolioBtn = document.getElementById("portfolioViewBtn");
    var cvWrapper = document.getElementById("cvPreviewWrapper");
    var portWrapper = document.getElementById("portfolioPreviewWrapper");
    var downloadBtn = document.getElementById("downloadPdfBtn");
    var activeDocId = window.CVState?.getActiveDocId() || "default_doc";

    downloadBtn?.classList.remove("d-none");

    var isPortfolio = viewName === "portfolio";

    setActiveViewBtn(cvBtn, !isPortfolio);
    setActiveViewBtn(portfolioBtn, isPortfolio);

    cvWrapper?.classList.toggle("d-none", isPortfolio);
    portWrapper?.classList.toggle("d-none", !isPortfolio);

    if (isPortfolio) {
      typeof renderPortfolio === "function" && renderPortfolio();
      var fullPortLink = document.getElementById("openFullPortfolioBtn");
      if (fullPortLink)
        fullPortLink.href = `portfolio.html?docId=${encodeURIComponent(activeDocId)}`;
    } else {
      var fullCvLink = document.getElementById("openFullCvBtn");
      if (fullCvLink)
        fullCvLink.href = `cv.html?docId=${encodeURIComponent(activeDocId)}`;
    }
  }

  document
    .getElementById("cvViewBtn")
    ?.addEventListener("click", () => switchPreviewView("cv"));
  document
    .getElementById("portfolioViewBtn")
    ?.addEventListener("click", () => switchPreviewView("portfolio"));

  var urlParams = new URLSearchParams(window.location.search);
  switchPreviewView(urlParams.get("view") === "portfolio" ? "portfolio" : "cv");

  var publishBtn = document.getElementById("publishBtn");
  if (publishBtn) {
    publishBtn.addEventListener("click", function () {
      var activeDocId = window.CVState?.getActiveDocId() || "default_doc";
      var user = window.Auth ? window.Auth.getCurrentUser() : null;

      if (user) {
        var listKey = "xpvolio_docs_" + user.email.toLowerCase().trim();
        try {
          var docs = JSON.parse(localStorage.getItem(listKey)) || [];
          var doc = null;
          for (var i = 0; i < docs.length; i++) {
            if (docs[i].id === activeDocId) {
              doc = docs[i];
              break;
            }
          }
          if (doc) {
            doc.isPublished = true;
            localStorage.setItem(listKey, JSON.stringify(docs));
          }
        } catch (e) {
          console.error("Publish error:", e);
        }
      }

      alert("Your CV & Portfolio are published and live!");
      window.open(
        `portfolio.html?docId=${encodeURIComponent(activeDocId)}`,
        "_blank",
      );
    });
  }
});
