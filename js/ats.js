var ATS_LEVELS = [
  {
    min: 90,
    color: "#10b981",
    cssClass: "text-success",
    icon: "fa-circle-check",
    label: "Exceptional (90%+)",
  },
  {
    min: 75,
    color: "#3b82f6",
    cssClass: "text-primary",
    icon: "fa-circle-check",
    label: "Strong Match (75%+)",
  },
  {
    min: 50,
    color: "#f59e0b",
    cssClass: "text-warning",
    icon: "fa-triangle-exclamation",
    label: "Moderate Match (50%+)",
  },
  {
    min: 25,
    color: "#f97316",
    cssClass: "text-orange",
    icon: "fa-triangle-exclamation",
    label: "Needs More Info",
  },
  {
    min: 0,
    color: "#ef4444",
    cssClass: "text-danger",
    icon: "fa-circle-xmark",
    label: "Incomplete CV",
  },
];
function getAtsLevel(score) {
  return (
    ATS_LEVELS.find((lvl) => score >= lvl.min) ||
    ATS_LEVELS[ATS_LEVELS.length - 1]
  );
}

function updateAtsGauge() {
  if (!window.CVState) return;

  var score = window.CVState.calculateAtsScore();
  var level = getAtsLevel(score);

  var scoreValueEl = document.getElementById("atsScoreValue");
  if (scoreValueEl) scoreValueEl.textContent = score;

  var scoreCircleEl = document.getElementById("atsCircleProgress");
  if (scoreCircleEl) {
    scoreCircleEl.setAttribute("stroke-dasharray", `${score}, 100`);
    scoreCircleEl.style.stroke = level.color;
  }

  var scoreStatusEl = document.getElementById("atsScoreStatus");
  if (scoreStatusEl) {
    scoreStatusEl.className = `ats-status ${level.cssClass} fw-semibold`;
    scoreStatusEl.innerHTML = `<i class="fa-solid ${level.icon}"></i> ${level.label}`;
  }
}

window.initAtsGauge = function () {
  updateAtsGauge();
  if (window.CVState) window.CVState.subscribe(updateAtsGauge);
};
