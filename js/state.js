class StateManager {
  constructor() {
    this.listeners = [];
    this.currentDocId = this.getActiveDocId();
    this.state = this.loadCurrentState();
  }

  getActiveDocId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("docId") || "default_doc";
  }

  getStorageKey() {
    const user = window.Auth ? window.Auth.getCurrentUser() : null;
    const email = user ? user.email.toLowerCase().trim() : "guest";
    return `xpvolio_state_${email}_${this.currentDocId}`;
  }

  getDocTitleFromProfile() {
    const user = window.Auth ? window.Auth.getCurrentUser() : null;
    if (!user) return null;

    try {
      const listKey = `xpvolio_docs_${user.email.toLowerCase().trim()}`;
      const docs = JSON.parse(localStorage.getItem(listKey)) || [];
      const found = docs.find(d => d.id === this.currentDocId);
      if (found && found.title) return found.title;
    } catch (e) {
      console.error(e);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const passedTitle = urlParams.get("title");
    return passedTitle ? decodeURIComponent(passedTitle) : null;
  }

  getDefaultState() {
    const user = window.Auth ? window.Auth.getCurrentUser() : null;
    const userName = user ? user.name : "Your Name";
    const userEmail = user ? user.email : "user@example.com";
    const resolvedTitle = this.getDocTitleFromProfile() || "Software Engineer Resume";

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
          behance: ""
        }
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
        militaryStatus: "Not Applicable"
      },
      references: {
        availableUponRequest: true
      },
      customization: {
        primaryColor: "#004ac6",
        font: "Inter"
      }
    };
  }

  loadCurrentState() {
    try {
      const data = localStorage.getItem(this.getStorageKey());
      if (data) {
        const parsed = JSON.parse(data);
        // نضمن مزامنة العنوان مع عنوان البروفايل
        const profileTitle = this.getDocTitleFromProfile();
        if (profileTitle) {
          parsed.docTitle = profileTitle;
        }
        return parsed;
      }
    } catch (e) {
      console.error("Error loading state:", e);
    }
    return this.getDefaultState();
  }

  saveState() {
    try {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(this.state));
      this.syncWithProfileList();
    } catch (e) {
      console.error("Error saving state:", e);
    }
  }

  syncWithProfileList() {
    const user = window.Auth ? window.Auth.getCurrentUser() : null;
    if (!user) return;

    const listKey = `xpvolio_docs_${user.email.toLowerCase().trim()}`;
    try {
      let docs = JSON.parse(localStorage.getItem(listKey)) || [];
      const index = docs.findIndex(d => d.id === this.currentDocId);
      if (index !== -1) {
        docs[index].title = this.state.docTitle || docs[index].title;
        docs[index].updatedAt = new Date().toLocaleDateString();
        docs[index].atsScore = this.calculateAtsScore();
        localStorage.setItem(listKey, JSON.stringify(docs));
      }
    } catch (e) {
      console.error("Sync error:", e);
    }
  }

  getState() {
    return this.state;
  }

  setState(path, value) {
    const keys = path.split(".");
    let current = this.state;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    this.saveState();
    this.notify();
  }

  updateState(fn) {
    fn(this.state);
    this.saveState();
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn(this.state));
  }

  calculateAtsScore() {
    let score = 30;
    const p = this.state.personalInfo || {};
    if (p.fullName && p.fullName.trim()) score += 10;
    if (p.email && p.email.trim()) score += 10;
    if (p.phone && p.phone.trim()) score += 10;
    if (this.state.summary && this.state.summary.length > 30) score += 15;
    if (this.state.experience && this.state.experience.length > 0) score += 15;
    if (this.state.education && this.state.education.length > 0) score += 10;
    return Math.min(score, 100);
  }
}

window.CVState = new StateManager();