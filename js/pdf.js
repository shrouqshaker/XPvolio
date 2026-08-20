var PDF_BTN_ID = "downloadPdfBtn";

function setPdfBtnLoading(isLoading) {
  var btns = document.querySelectorAll(
    "#" + PDF_BTN_ID + ", .download-pdf-trigger",
  );

  btns.forEach(function (btn) {
    btn.disabled = isLoading;
    btn.innerHTML = isLoading
      ? '<i class="fa-solid fa-spinner fa-spin me-1"></i> Generating...'
      : '<i class="fa-solid fa-download fs-6"></i>';
  });
}
function resolveExportTarget() {
  var cvWrapper = document.getElementById("cvPreviewWrapper");
  var portWrapper = document.getElementById("portfolioPreviewWrapper");

  if (cvWrapper || portWrapper) {
    var isPort = !!(portWrapper && !portWrapper.classList.contains("d-none"));
    return {
      element: isPort
        ? document.getElementById("portfolio-root")
        : document.getElementById("cvPaper"),
      isPortfolio: isPort,
    };
  }

  var cvPaper = document.getElementById("cvPaper");
  var portfolioRoot = document.getElementById("portfolio-root");

  return {
    element: cvPaper || portfolioRoot,
    isPortfolio: !cvPaper && !!portfolioRoot,
  };
}

function exportToPdf() {
  var target = resolveExportTarget();
  var element = target.element;

  if (!element) {
    window.print();
    return;
  }

  var state = window.CVState?.getState() || {};
  var name = state.personalInfo?.fullName || "XPvolio";
  var filename = `${name.replace(/\s+/g, "_")}${target.isPortfolio ? "_Portfolio.pdf" : "_CV.pdf"}`;

  var opt = {
    margin: [0.4, 0.4, 0.4, 0.4],
    filename: filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
  };

  setPdfBtnLoading(true);

  var finish = function () {
    setPdfBtnLoading(false);
  };

  if (typeof html2pdf !== "undefined") {
    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(finish)
      .catch(function (err) {
        console.error("PDF error:", err);
        window.print();
        finish();
      });
  } else {
    window.print();
    finish();
  }
}

window.initPdfExport = function () {
  var btns = document.querySelectorAll(
    "#" + PDF_BTN_ID + ", .download-pdf-trigger",
  );

  btns.forEach(function (btn) {
    btn.removeEventListener("click", exportToPdf);
    btn.addEventListener("click", exportToPdf);
  });
};
