const DEFAULT_STORAGE_KEY = "xpvolio_master_cv_data";

function getUserStorageKey() {
  if (window.Auth && window.Auth.getCurrentUser()) {
    const user = window.Auth.getCurrentUser();
    return "xpvolio_cv_" + user.email.replace(/[^a-zA-Z0-9]/g, "_");
  }
  return DEFAULT_STORAGE_KEY;
}

function generateDefaultData(
  fullName = "Alex Rivera",
  email = "alex.rivera@example.com",
) {
  return {
    docTitle: `${fullName}'s Master CV`,
    lastUpdated: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    personalInfo: {
      fullName: fullName,
      professionalTitle: "Software Engineer",
      email: email,
      phone: "01234567890",
      address: "San Francisco, CA, USA",
      socialLinks: {
        linkedin: `linkedin.com/in/${fullName.toLowerCase().replace(/\s+/g, "")}`,
        github: `github.com/${fullName.toLowerCase().replace(/\s+/g, "")}`,
        website: `${fullName.toLowerCase().replace(/\s+/g, "")}.dev`,
        behance: "",
      },
    },
    summary: `Results-driven Software Engineer with hands-on experience building scalable backend microservices and full-stack web applications. Dedicated to clean architecture and modern software practices.`,
    experience: [
      {
        jobTitle: "Software Engineer",
        company: "TechNexus Inc.",
        location: "San Francisco, CA",
        startDate: "Mar 2022",
        endDate: "Present",
        currentlyWorking: true,
        description:
          "Architected scalable RESTful microservices and frontend web components using modern JavaScript frameworks.",
      },
    ],
    education: [
      {
        degree: "B.S. in Computer Science",
        institution: "State University",
        location: "CA, USA",
        startDate: "Sep 2018",
        graduationDate: "May 2022",
        gpa: "3.8 / 4.0",
        description: "Graduated with Honors.",
      },
    ],
    skills: [
      { name: "JavaScript / TypeScript", level: "Expert" },
      { name: "React & HTML5/CSS3", level: "Advanced" },
      { name: "Node.js & Express", level: "Advanced" },
      { name: "SQL / PostgreSQL", level: "Intermediate" },
    ],
    projects: [
      {
        name: "Cloud Application Suite",
        role: "Full Stack Developer",
        startDate: "Jan 2023",
        endDate: "Present",
        description:
          "An interactive web platform enabling real-time data visualization and document generation.",
        technologies: ["JavaScript", "HTML5", "CSS3", "Node.js"],
      },
    ],
    services: [
      {
        title: "Full-Stack Development",
        description:
          "Custom web applications, responsive interfaces, and scalable backend integrations.",
      },
    ],
    certifications: [],
    courses: [],
    languages: [{ language: "English", proficiency: "Native / Professional" }],
    awards: [],
    volunteer: [],
    organizations: [],
    regionalDetails: {
      enabled: false,
      dateOfBirth: "",
      nationality: "",
      maritalStatus: "",
      militaryStatus: "",
    },
    references: {
      availableUponRequest: true,
    },
    customization: {
      primaryColor: "#2563eb",
      font: "Inter",
    },
  };
}

class CVStateManager {
  constructor() {
    this.listeners = [];
    this.state = this.loadFromStorage();
  }

  loadFromStorage() {
    const key = getUserStorageKey();
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Could not load CVState from localStorage:", e);
    }

    const user = window.Auth ? window.Auth.getCurrentUser() : null;
    const initialData = generateDefaultData(
      user ? user.name : "Alex Rivera",
      user ? user.email : "alex.rivera@example.com",
    );
    this.saveToStorage(initialData);
    return initialData;
  }

  initUserCVData(name, email) {
    const key = "xpvolio_cv_" + email.replace(/[^a-zA-Z0-9]/g, "_");
    const data = generateDefaultData(name, email);
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {}
    this.state = data;
    this.notify();
  }

  saveToStorage(data) {
    const key = getUserStorageKey();
    try {
      data.lastUpdated = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save CVState to localStorage:", e);
    }
  }

  getState() {
    return this.state;
  }

  setState(path, value) {
    const keys = path.split(".");
    let target = this.state;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!target[keys[i]]) target[keys[i]] = {};
      target = target[keys[i]];
    }

    target[keys[keys.length - 1]] = value;
    this.saveToStorage(this.state);
    this.notify();
  }

  updateState(mutatorFn) {
    mutatorFn(this.state);
    this.saveToStorage(this.state);
    this.notify();
  }

  updateArrayItem(arrayName, index, field, value) {
    if (!this.state[arrayName]) this.state[arrayName] = [];
    if (this.state[arrayName][index]) {
      this.state[arrayName][index][field] = value;
      this.saveToStorage(this.state);
      this.notify();
    }
  }

  addItem(arrayName, item) {
    if (!this.state[arrayName]) this.state[arrayName] = [];
    this.state[arrayName].push(item);
    this.saveToStorage(this.state);
    this.notify();
  }

  removeItem(arrayName, index) {
    if (this.state[arrayName] && this.state[arrayName][index] !== undefined) {
      this.state[arrayName].splice(index, 1);
      this.saveToStorage(this.state);
      this.notify();
    }
  }

  resetToDefault() {
    const user = window.Auth ? window.Auth.getCurrentUser() : null;
    this.state = generateDefaultData(
      user ? user.name : "Alex Rivera",
      user ? user.email : "alex.rivera@example.com",
    );
    this.saveToStorage(this.state);
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  calculateAtsScore() {
    let score = 0;
    const s = this.state;

    if (s.personalInfo?.fullName) score += 5;
    if (s.personalInfo?.email) score += 5;
    if (s.personalInfo?.phone) score += 5;
    if (s.personalInfo?.address) score += 5;
    if (s.personalInfo?.socialLinks?.linkedin) score += 5;

    if (s.summary && s.summary.length > 50) score += 15;
    else if (s.summary) score += 5;

    if (s.experience && s.experience.length > 0) {
      score += 15;
      if (
        s.experience[0].description &&
        s.experience[0].description.length > 30
      )
        score += 10;
    }

    if (s.education && s.education.length > 0) score += 15;
    if (s.skills && s.skills.length >= 3) score += 10;
    else if (s.skills && s.skills.length > 0) score += 5;

    if (
      (s.projects && s.projects.length > 0) ||
      (s.certifications && s.certifications.length > 0)
    )
      score += 10;

    return Math.min(100, score);
  }
}

window.CVState = new CVStateManager();
