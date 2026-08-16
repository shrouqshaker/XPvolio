const USERS_STORAGE_KEY = "xpvolio_registered_users";
const SESSION_STORAGE_KEY = "xpvolio_active_session";

class AuthManager {
  constructor() {
    this.users = this.loadUsers();
    this.session = this.loadSession();
  }

  loadUsers() {
    try {
      const data = localStorage.getItem(USERS_STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  saveUsers() {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(this.users));
    } catch (e) {
      console.error("Failed to save users:", e);
    }
  }

  loadSession() {
    try {
      const data = localStorage.getItem(SESSION_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  saveSession(user) {
    try {
      if (user) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
      this.session = user;
    } catch (e) {
      console.error("Failed to save session:", e);
    }
  }

  getCurrentUser() {
    return this.session;
  }

  register(name, email, password) {
    email = email.trim().toLowerCase();
    if (this.users[email]) {
      return { success: false, message: "An account with this email already exists. Please Sign In." };
    }

    const newUser = {
      name: name.trim(),
      email: email,
      password: password,
      createdAt: new Date().toISOString()
    };

    this.users[email] = newUser;
    this.saveUsers();
    this.saveSession({ name: newUser.name, email: newUser.email });

    if (window.CVState) {
      window.CVState.initUserCVData(newUser.name, newUser.email);
    }

    return { success: true, user: newUser };
  }

  login(email, password) {
    email = email.trim().toLowerCase();
    const user = this.users[email];

    if (!user) {
      return { success: false, message: "No account found with this email. Please register first." };
    }

    if (user.password !== password) {
      return { success: false, message: "Incorrect password. Please try again." };
    }

    this.saveSession({ name: user.name, email: user.email });
    return { success: true, user: user };
  }

  logout() {
    this.saveSession(null);
    window.location.href = "login.html";
  }

  requireAuth() {
    if (!this.getCurrentUser()) {
      window.location.href = "login.html";
    }
  }
}

window.Auth = new AuthManager();
