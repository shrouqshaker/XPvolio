function updateAtsGauge() {
  if (!window.CVState) return;

  const score = window.CVState.calculateAtsScore();
  const scoreValueEl = document.getElementById("atsScoreValue");
  const scoreCircleEl = document.getElementById("atsCircleProgress");
  const scoreStatusEl = document.getElementById("atsScoreStatus");

  if (scoreValueEl) scoreValueEl.textContent = score;

  if (scoreCircleEl) {
    scoreCircleEl.setAttribute("stroke-dasharray", `${score}, 100`);

    if (score >= 85) {
      scoreCircleEl.style.stroke = "#10b981";
    } else if (score >= 60) {
      scoreCircleEl.style.stroke = "#f59e0b";
    } else {
      scoreCircleEl.style.stroke = "#ef4444";
    }
  }

  if (scoreStatusEl) {
    if (score >= 85) {
      scoreStatusEl.className = "ats-status text-success fw-semibold";
      scoreStatusEl.innerHTML = '<i class="fa-solid fa-circle-check"></i> Optimized for ATS';
    } else if (score >= 60) {
      scoreStatusEl.className = "ats-status text-warning fw-semibold";
      scoreStatusEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Good ATS Match';
    } else {
      scoreStatusEl.className = "ats-status text-danger fw-semibold";
      scoreStatusEl.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Needs Improvement';
    }
  }
}

window.initAtsGauge = function() {
  updateAtsGauge();
  if (window.CVState) {
    window.CVState.subscribe(() => {
      updateAtsGauge();
    });
  }
};
