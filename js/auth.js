/* ==========================================================================
   auth.js — Authentication, Session & Local Storage Management
   ========================================================================== */

var USERS_KEY   = "xpvolio_registered_users";
var SESSION_KEY = "xpvolio_active_session";

/* ── Shared localStorage helper ────────────────────────────────────────── */

function loadFromStorage(key, fallback) {
  try {
    var data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Storage error for key " + key + ":", e);
  }
}

/* Auth Manager */

function AuthManager() {
  this.users   = loadFromStorage(USERS_KEY, {});
  this.session = loadFromStorage(SESSION_KEY, null);
}

AuthManager.prototype.getCurrentUser = function() {
  return this.session;
};

AuthManager.prototype.isGuest = function() {
  return !this.session;
};

AuthManager.prototype.saveSession = function(user) {
  this.session = user;
  if (user) {
    saveToStorage(SESSION_KEY, user);
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
};

/* Migrate any guest document from sessionStorage into user's localStorage account */
AuthManager.prototype.migrateGuestSession = function(email, userName) {
  try {
    email = email.toLowerCase().trim();
    var docListKey = "xpvolio_docs_" + email;
    var userDocs   = JSON.parse(localStorage.getItem(docListKey)) || [];

    for (var i = 0; i < sessionStorage.length; i++) {
      var key = sessionStorage.key(i);
      if (key && key.indexOf("xpvolio_guest_state_") === 0) {
        var rawData = sessionStorage.getItem(key);
        if (rawData) {
          var stateObj = JSON.parse(rawData);
          var docId = stateObj.docId || ("doc_" + Date.now());

          if (stateObj.personalInfo) {
            if (!stateObj.personalInfo.fullName || stateObj.personalInfo.fullName === "Your Name") {
              stateObj.personalInfo.fullName = userName;
            }
            if (!stateObj.personalInfo.email || stateObj.personalInfo.email === "user@example.com") {
              stateObj.personalInfo.email = email;
            }
          }

          var targetKey = "xpvolio_state_" + email + "_" + docId;
          localStorage.setItem(targetKey, JSON.stringify(stateObj));

          /* Register in document list if not already there */
          var exists = false;
          for (var d = 0; d < userDocs.length; d++) {
            if (userDocs[d].id === docId) { exists = true; break; }
          }

          if (!exists) {
            userDocs.unshift({
              id:          docId,
              title:       stateObj.docTitle || "My Resume",
              type:        "CV",
              updatedAt:   new Date().toLocaleDateString(),
              atsScore:    85
            });
          }
        }
      }
    }

    localStorage.setItem(docListKey, JSON.stringify(userDocs));
    sessionStorage.clear();
  } catch (e) {
    console.error("Migration error:", e);
  }
};

AuthManager.prototype.register = function(name, email, password) {
  email = email.trim().toLowerCase();

  if (this.users[email]) {
    return { success: false, message: "An account with this email already exists. Please Sign In." };
  }

  var newUser = {
    name:      name.trim(),
    email:     email,
    password:  password,
    createdAt: new Date().toISOString()
  };

  this.users[email] = newUser;
  saveToStorage(USERS_KEY, this.users);
  this.saveSession({ name: newUser.name, email: newUser.email });

  /* Migrate any work done during guest session */
  this.migrateGuestSession(newUser.email, newUser.name);

  return { success: true, user: newUser };
};

AuthManager.prototype.login = function(email, password) {
  email = email.trim().toLowerCase();
  var user = this.users[email];

  if (!user)                    return { success: false, message: "No account found with this email. Please register first." };
  if (user.password !== password) return { success: false, message: "Incorrect password. Please try again." };

  this.saveSession({ name: user.name, email: user.email });

  /* Migrate any work done during guest session */
  this.migrateGuestSession(user.email, user.name);

  return { success: true, user: user };
};

AuthManager.prototype.loginOrRegister = function(name, email) {
  email = email.trim().toLowerCase();
  if (this.users[email]) {
    return this.login(email, "demo123");
  }
  return this.register(name, email, "demo123");
};

AuthManager.prototype.updateUser = function(newName, newPassword) {
  var user = this.getCurrentUser();
  if (!user) return false;

  var email = user.email.toLowerCase().trim();
  if (this.users[email]) {
    if (newName) {
      this.users[email].name = newName.trim();
      user.name = newName.trim();
    }
    if (newPassword && newPassword.trim()) {
      this.users[email].password = newPassword.trim();
    }
    saveToStorage(USERS_KEY, this.users);
    this.saveSession(user);
    return true;
  }
  return false;
};

AuthManager.prototype.logout = function() {
  this.saveSession(null);
  sessionStorage.clear();
  window.location.href = "login.html";
};

/* Strictly require auth for protected pages like profile.html */
AuthManager.prototype.requireAuth = function() {
  if (!this.getCurrentUser()) {
    /* If on profile.html, redirect to login */
    var path = window.location.pathname;
    if (path.indexOf("profile.html") !== -1) {
      window.location.href = "login.html";
    }
  }
};

/* Update navbar links based on login state */
AuthManager.prototype.updateNavbar = function() {
  var user    = this.getCurrentUser();
  var navList = document.querySelector(".navbar-nav");
  if (!navList) return;

  var signInBtn     = navList.querySelector('a[href="login.html"]');
  var getStartedBtn = navList.querySelector('a[href="editor.html"]');

  if (!user) {
    /* Guest User: Get Started Free button goes directly to editor */
    if (getStartedBtn) {
      getStartedBtn.href = "editor.html";
    }
    return;
  }

  /* Logged In User: Remove "Get Started" button and show Profile link */
  if (getStartedBtn && getStartedBtn.closest("li")) {
    getStartedBtn.closest("li").remove();
  }

  if (signInBtn && signInBtn.closest("li")) {
    signInBtn.closest("li").innerHTML = [
      '<div class="d-flex align-items-center gap-2">',
        '<a href="profile.html" class="btn btn-outline-primary d-flex align-items-center gap-2 px-3 rounded-3 text-decoration-none shadow-sm" title="Go to Profile">',
          '<i class="fa-solid fa-circle-user fs-5"></i>',
          '<span class="fw-semibold small">' + (user.name || "Profile") + '</span>',
        '</a>',
        '<button onclick="window.Auth.logout()" class="btn btn-sm btn-outline-danger rounded-3 px-2 py-2" title="Sign Out">',
          '<i class="fa-solid fa-right-from-bracket"></i>',
        '</button>',
      '</div>'
    ].join("");
  }
};


window.Auth = new AuthManager();

document.addEventListener("DOMContentLoaded", function() {
  window.Auth.updateNavbar();
});