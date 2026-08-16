document.addEventListener("DOMContentLoaded", () => {
  window.Auth.requireAuth();

  const currentUser = window.Auth.getCurrentUser();
  const userNameEl = document.getElementById("userNameDisplay");
  if (userNameEl && currentUser) {
    userNameEl.textContent = currentUser.name || currentUser.email;
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

  const cvBtn = document.getElementById("cvViewBtn");
  const portfolioBtn = document.getElementById("portfolioViewBtn");
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
      alert(" Your CV is published and live!");
    });
  }

  const docTitleInput = document.getElementById("docTitleInput");
  if (docTitleInput) {
    const initialState = window.CVState.getState();
    if (initialState.docTitle) {
      docTitleInput.value = initialState.docTitle;
    }
    docTitleInput.addEventListener("input", (e) => {
      window.CVState.setState("docTitle", e.target.value);
    });
  }
});
