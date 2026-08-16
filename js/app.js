document.addEventListener("DOMContentLoaded", () => {
  window.Auth.requireAuth();

  const currentUser = window.Auth.getCurrentUser();
  const userNameEl = document.getElementById("userNameDisplay");
  if (userNameEl && currentUser) {
    userNameEl.textContent = currentUser.name || currentUser.email;
  }

  // ضبط العنوان في خانة الـ input
  const docTitleInput = document.getElementById("docTitleInput");
  if (docTitleInput && window.CVState) {
    const state = window.CVState.getState();
    if (state && state.docTitle) {
      docTitleInput.value = state.docTitle;
    }

    docTitleInput.addEventListener("input", (e) => {
      window.CVState.setState("docTitle", e.target.value);
    });
  }

  window.initAtsGauge();
  window.initCvPreview();
  window.initEditor();
  window.initPdfExport();

  const navItems = document.querySelectorAll(".sidebar-panel .nav-link");
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      navItems.forEach((n) => n.classList.remove("active"));
      item.classList.add("active");
      const sectionKey = item.getAttribute("data-section");
      renderEditorSection(sectionKey);
    });
  });

  const urlParams = new URLSearchParams(window.location.search);
  const viewType = urlParams.get("view");

  const cvBtn = document.getElementById("cvViewBtn");
  const portfolioBtn = document.getElementById("portfolioViewBtn");

  if (viewType === "portfolio" && portfolioBtn && cvBtn) {
    portfolioBtn.classList.add("active");
    cvBtn.classList.remove("active");
  }

  if (cvBtn && portfolioBtn) {
    cvBtn.addEventListener("click", () => {
      cvBtn.classList.add("active");
      portfolioBtn.classList.remove("active");
    });
    portfolioBtn.addEventListener("click", () => {
      portfolioBtn.classList.add("active");
      cvBtn.classList.remove("active");
    });
  }

  const publishBtn = document.getElementById("publishBtn");
  if (publishBtn) {
    publishBtn.addEventListener("click", () => {
      alert("Your document is published and live!");
    });
  }
});