var PDF_BTN_ID = "downloadPdfBtn";

function setPdfBtnLoading(isLoading) {
  var btn = document.getElementById(PDF_BTN_ID);
  if (!btn) return;
  btn.disabled = isLoading;
  btn.innerHTML = isLoading
    ? '<i class="fa-solid fa-spinner fa-spin me-1"></i> Generating...'
    : '<i class="fa-solid fa-download fs-6"></i>';
}

function exportToPdf() {
  var element = document.getElementById("cvPaper") || document.getElementById("portfolio-root");
  if (!element) {
    window.print();
    return;
  }

  var state    = window.CVState ? window.CVState.getState() : {};
  var name     = (state.personalInfo && state.personalInfo.fullName) ? state.personalInfo.fullName : "XPvolio";
  var isPort   = document.getElementById("portfolio-root") && !document.getElementById("cvPaper");
  var filename = name.replace(/\s+/g, "_") + (isPort ? "_Portfolio.pdf" : "_CV.pdf");

  var opt = {
    margin:      [0.4, 0.4, 0.4, 0.4],
    filename:    filename,
    image:       { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF:       { unit: "in", format: "letter", orientation: "portrait" }
  };

  setPdfBtnLoading(true);

  if (typeof html2pdf !== "undefined") {
    html2pdf().set(opt).from(element).save()
      .then(function() { 
        setPdfBtnLoading(false); 
      })
      .catch(function(err) { 
        console.error("PDF error:", err); 
        window.print(); 
        setPdfBtnLoading(false); 
      });
  } else {
    window.print();
    setPdfBtnLoading(false);
  }
}

window.initPdfExport = function() {
  var btn = document.getElementById(PDF_BTN_ID);
  if (btn) {
    btn.removeEventListener("click", exportToPdf);
    btn.addEventListener("click", exportToPdf);
  }
};