
var ATS_LEVELS = [
  { min: 85, color: "#10b981", cssClass: "text-success", icon: "fa-circle-check",       label: "Optimized for ATS" },
  { min: 60, color: "#f59e0b", cssClass: "text-warning", icon: "fa-triangle-exclamation", label: "Good ATS Match"     },
  { min:  0, color: "#ef4444", cssClass: "text-danger",  icon: "fa-circle-xmark",        label: "Needs Improvement"  }
];

function getAtsLevel(score) {
  for (var i = 0; i < ATS_LEVELS.length; i++) {
    if (score >= ATS_LEVELS[i].min) return ATS_LEVELS[i];
  }
  return ATS_LEVELS[ATS_LEVELS.length - 1];
}

function updateAtsGauge() {
  if (!window.CVState) return;

  var score  = window.CVState.calculateAtsScore();
  var level  = getAtsLevel(score);

  var scoreValueEl  = document.getElementById("atsScoreValue");
  var scoreCircleEl = document.getElementById("atsCircleProgress");
  var scoreStatusEl = document.getElementById("atsScoreStatus");

  if (scoreValueEl) {
    scoreValueEl.textContent = score;
  }

  if (scoreCircleEl) {
    scoreCircleEl.setAttribute("stroke-dasharray", score + ", 100");
    scoreCircleEl.style.stroke = level.color;
  }

  if (scoreStatusEl) {
    scoreStatusEl.className = "ats-status " + level.cssClass + " fw-semibold";
    scoreStatusEl.innerHTML = '<i class="fa-solid ' + level.icon + '"></i> ' + level.label;
  }
}

window.initAtsGauge = function() {
  updateAtsGauge();
  if (window.CVState) {
    window.CVState.subscribe(updateAtsGauge);
  }
};
