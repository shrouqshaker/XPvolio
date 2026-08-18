function StateManager() {
  this.listeners = [];
  this.currentDocId = this.getActiveDocId();
  this.state = this.loadCurrentState();
}

StateManager.prototype.getActiveDocId = function () {
  var urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("docId") || "default_doc";
};

StateManager.prototype.isGuest = function () {
  return !(window.Auth && window.Auth.getCurrentUser());
};

/* Get storage driver: sessionStorage for guests, localStorage for registered users */
StateManager.prototype.getStorage = function () {
  return this.isGuest() ? window.sessionStorage : window.localStorage;
};

StateManager.prototype.getStorageKey = function () {
  if (this.isGuest()) {
    return "xpvolio_guest_state_" + this.currentDocId;
  }
  var user = window.Auth.getCurrentUser();
  var email = user ? user.email.toLowerCase().trim() : "guest";
  return "xpvolio_state_" + email + "_" + this.currentDocId;
};

StateManager.prototype.getDocTitleFromProfile = function () {
  if (this.isGuest()) {
    var urlParams = new URLSearchParams(window.location.search);
    var pTitle = urlParams.get("title");
    return pTitle ? decodeURIComponent(pTitle) : null;
  }

  var user = window.Auth.getCurrentUser();
  if (!user) return null;

  try {
    var listKey = "xpvolio_docs_" + user.email.toLowerCase().trim();
    var docs = JSON.parse(localStorage.getItem(listKey)) || [];
    for (var i = 0; i < docs.length; i++) {
      if (docs[i].id === this.currentDocId && docs[i].title) {
        return docs[i].title;
      }
    }
  } catch (e) {
    console.error("Error reading doc title:", e);
  }

  var urlParams2 = new URLSearchParams(window.location.search);
  var passedTitle = urlParams2.get("title");
  return passedTitle ? decodeURIComponent(passedTitle) : null;
};

StateManager.prototype.getDefaultState = function () {
  var isGuestUser = this.isGuest();
  var user = isGuestUser ? null : window.Auth.getCurrentUser();
  var userName = user ? user.name : "Your Name";
  var userEmail = user ? user.email : "user@example.com";
  var resolvedTitle =
    this.getDocTitleFromProfile() || "Software Engineer Resume";

  return {
    docId: this.currentDocId,
    docTitle: resolvedTitle,
    personalInfo: {
      fullName: userName,
      professionalTitle: "",
      email: userEmail,
      phone: "",
      address: "",
      socialLinks: {
        linkedin: "",
        github: "",
        website: "",
        behance: "",
      },
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    services: [],
    certifications: [],
    courses: [],
    languages: [],
    awards: [],
    volunteer: [],
    organizations: [],
    regionalDetails: {
      enabled: false,
      dateOfBirth: "",
      nationality: "",
      maritalStatus: "",
      militaryStatus: "Not Applicable",
    },
    references: {
      availableUponRequest: true,
    },
    customization: {
      primaryColor: "#004ac6",
      font: "Inter",
    },
  };
};

StateManager.prototype.loadCurrentState = function () {
  try {
    var storage = this.getStorage();
    var data = storage.getItem(this.getStorageKey());
    if (data) {
      var parsed = JSON.parse(data);
      var profileTitle = this.getDocTitleFromProfile();
      if (profileTitle) {
        parsed.docTitle = profileTitle;
      }
      return parsed;
    }
  } catch (e) {
    console.error("Error loading state:", e);
  }
  return this.getDefaultState();
};

StateManager.prototype.saveState = function () {
  try {
    var storage = this.getStorage();
    storage.setItem(this.getStorageKey(), JSON.stringify(this.state));
    if (!this.isGuest()) {
      this.syncWithProfileList();
    }
  } catch (e) {
    console.error("Error saving state:", e);
  }
};

StateManager.prototype.syncWithProfileList = function () {
  var user = window.Auth ? window.Auth.getCurrentUser() : null;
  if (!user) return;

  var listKey = "xpvolio_docs_" + user.email.toLowerCase().trim();
  try {
    var docs = JSON.parse(localStorage.getItem(listKey)) || [];
    for (var i = 0; i < docs.length; i++) {
      if (docs[i].id === this.currentDocId) {
        docs[i].title = this.state.docTitle || docs[i].title;
        docs[i].updatedAt = new Date().toLocaleDateString();
        docs[i].atsScore = this.calculateAtsScore();
        localStorage.setItem(listKey, JSON.stringify(docs));
        break;
      }
    }
  } catch (e) {
    console.error("Sync error:", e);
  }
};

StateManager.prototype.getState = function () {
  return this.state;
};

StateManager.prototype.setState = function (path, value) {
  var keys = path.split(".");
  var current = this.state;

  for (var i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) current[keys[i]] = {};
    current = current[keys[i]];
  }

  current[keys[keys.length - 1]] = value;
  this.saveState();
  this.notify();
};

StateManager.prototype.updateState = function (fn) {
  fn(this.state);
  this.saveState();
  this.notify();
};

StateManager.prototype.subscribe = function (listener) {
  this.listeners.push(listener);
};

StateManager.prototype.notify = function () {
  for (var i = 0; i < this.listeners.length; i++) {
    this.listeners[i](this.state);
  }
};

StateManager.prototype.calculateAtsScore = function () {
  var score = 20;
  var p = this.state.personalInfo || {};

  if (p.fullName && p.fullName.trim() && p.fullName !== "Your Name")
    score += 15;
  if (p.professionalTitle && p.professionalTitle.trim()) score += 10;
  if (p.email && p.email.trim() && p.email !== "user@example.com") score += 10;
  if (p.phone && p.phone.trim()) score += 10;
  if (this.state.summary && this.state.summary.trim().length > 20) score += 15;
  if (this.state.experience && this.state.experience.length > 0) score += 10;
  if (this.state.education && this.state.education.length > 0) score += 10;
  if (this.state.skills && this.state.skills.length > 0) score += 10;

  return Math.min(score, 100);
};


window.CVState = new StateManager();
