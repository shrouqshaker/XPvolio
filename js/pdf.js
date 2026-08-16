function exportCvToPdf() {
  const element = document.getElementById("cvPaper");
  if (!element) {
    alert("CV Preview element not found.");
    return;
  }

  const state = window.CVState ? window.CVState.getState() : {};
  const name = state.personalInfo?.fullName || "Resume";
  const filename = `${name.replace(/\s+/g, '_')}_CV.pdf`;

  const opt = {
    margin:       [0.4, 0.4, 0.4, 0.4],
    filename:     filename,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, logging: false },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  const downloadBtn = document.getElementById("downloadPdfBtn");
  if (downloadBtn) {
    downloadBtn.disabled = true;
    downloadBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-1"></i> Generating...';
  }

  if (typeof html2pdf !== "undefined") {
    html2pdf().set(opt).from(element).save().then(() => {
      if (downloadBtn) {
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = '<i class="fa-solid fa-download fs-6"></i>';
      }
    }).catch(err => {
      console.error("PDF generation error:", err);
      window.print();
      if (downloadBtn) {
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = '<i class="fa-solid fa-download fs-6"></i>';
      }
    });
  } else {
    window.print();
    if (downloadBtn) {
      downloadBtn.disabled = false;
      downloadBtn.innerHTML = '<i class="fa-solid fa-download fs-6"></i>';
    }
  }
}

window.initPdfExport = function() {
  const btn = document.getElementById("downloadPdfBtn");
  if (btn) {
    btn.addEventListener("click", exportCvToPdf);
  }
};
