var USERS_KEY = "xpvolio_registered_users";
var SESSION_KEY = "xpvolio_active_session";

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

function AuthManager() {
  this.users = loadFromStorage(USERS_KEY, {});
  this.session = loadFromStorage(SESSION_KEY, null);
}

AuthManager.prototype.getCurrentUser = function () {
  return this.session;
};

AuthManager.prototype.isGuest = function () {
  return !this.session;
};

AuthManager.prototype.saveSession = function (user) {
  this.session = user;
  if (user) {
    saveToStorage(SESSION_KEY, user);
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
};

AuthManager.prototype.register = function (name, email, password) {
  email = email.trim().toLowerCase();

  if (this.users[email]) {
    return {
      success: false,
      message: "An account with this email already exists. Please Sign In.",
    };
  }

  var newUser = {
    name: name.trim(),
    email: email,
    password: password,
    createdAt: new Date().toISOString(),
  };

  this.users[email] = newUser;
  saveToStorage(USERS_KEY, this.users);
  this.saveSession({ name: newUser.name, email: newUser.email });

  var docListKey = "xpvolio_docs_" + email;
  saveToStorage(docListKey, []);
  sessionStorage.clear();

  return { success: true, user: newUser };
};

AuthManager.prototype.login = function (email, password) {
  email = email.trim().toLowerCase();
  var user = this.users[email];

  if (!user)
    return {
      success: false,
      message: "No account found with this email. Please register first.",
    };
  if (user.password !== password)
    return { success: false, message: "Incorrect password. Please try again." };

  this.saveSession({ name: user.name, email: user.email });
  return { success: true, user: user };
};

AuthManager.prototype.loginOrRegister = function (name, email) {
  email = email.trim().toLowerCase();
  if (this.users[email]) {
    return this.login(email, "demo123");
  }
  return this.register(name, email, "demo123");
};

AuthManager.prototype.updateUser = function (newName, newPassword) {
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

AuthManager.prototype.logout = function () {
  this.saveSession(null);
  sessionStorage.clear();
  window.location.href = "index.html";
};

AuthManager.prototype.requireAuth = function () {
  if (!this.getCurrentUser()) {
    var path = window.location.pathname;
    if (path.indexOf("profile.html") !== -1) {
      window.location.href = "login.html";
    }
  }
};

AuthManager.prototype.updateNavbar = function () {
  var user = this.getCurrentUser();
  var navList = document.querySelector(".navbar-nav");
  
  var aboutCtaBtn = document.getElementById("aboutCtaBtn");
  var heroCvBtn = document.getElementById("heroCvBtn");
  var heroPortfolioBtn = document.getElementById("heroPortfolioBtn");

  if (!user) {
    if (aboutCtaBtn) {
      aboutCtaBtn.href = "editor.html";
      aboutCtaBtn.textContent = "Get Started Free";
    }
    if (heroCvBtn) {
      heroCvBtn.href = "editor.html";
      heroCvBtn.innerHTML = 'Create My CV <i class="fa-solid fa-file-lines ms-2 fs-5"></i>';
    }
    if (heroPortfolioBtn) {
      heroPortfolioBtn.classList.remove("d-none");
    }
    return;
  }

  if (aboutCtaBtn) {
    aboutCtaBtn.href = "profile.html";
    aboutCtaBtn.innerHTML = '<i class="fa-solid fa-table-columns me-2"></i> Go to Dashboard';
  }

  if (heroCvBtn) {
    heroCvBtn.href = "profile.html";
    heroCvBtn.innerHTML = '<i class="fa-solid fa-table-columns me-2"></i> Go to Dashboard';
  }

  if (heroPortfolioBtn) {
    heroPortfolioBtn.classList.add("d-none");
  }

  if (!navList) return;

  var signInBtn = navList.querySelector('a[href="login.html"]');
  var getStartedBtn = navList.querySelector('a[href="editor.html"]');

  if (getStartedBtn && getStartedBtn.closest("li")) {
    getStartedBtn.closest("li").remove();
  }

  if (signInBtn && signInBtn.closest("li")) {
    signInBtn.closest("li").innerHTML = `
      <div class="d-flex align-items-center gap-2">
        <a href="profile.html" class="btn btn-outline-primary d-flex align-items-center gap-2 px-3 rounded-3 text-decoration-none shadow-sm" title="Go to Profile">
          <i class="fa-solid fa-circle-user fs-5"></i>
          <span class="fw-semibold small">${user.name || "Profile"}</span>
        </a>
        <button onclick="window.Auth.logout()" class="btn btn-sm btn-outline-danger rounded-3 px-2 py-2" title="Sign Out">
          <i class="fa-solid fa-right-from-bracket"></i>
        </button>
      </div>
    `;
  }
};

window.Auth = new AuthManager();

document.addEventListener("DOMContentLoaded", function () {
  window.Auth.updateNavbar();
});
