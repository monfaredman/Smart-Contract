// AuthProvider interface
interface AuthProvider {
  isAuthenticated: boolean;
  isAdmin: boolean;
  username: string | null;
  init(): Promise<void>;
  signin(username: string): Promise<void>;
  signout(): Promise<void>;
  loginAdmin(): Promise<void>;
  logoutAdmin(): Promise<void>;
}

// Fake authentication provider
export const fakeAuthProvider: AuthProvider = {
  isAuthenticated: false,
  isAdmin: false,
  username: null,

  // Initialize state from local storage
  async init() {
    const storedUsername = localStorage.getItem("username");
    const storedIsAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    const storedIsAdmin = localStorage.getItem("isAdmin") === "true";

    if (storedIsAuthenticated && storedUsername) {
      this.isAuthenticated = true;
      this.username = storedUsername;
      this.isAdmin = false;
    }

    if (storedIsAdmin) {
      this.isAuthenticated = false;
      this.username = null;
      this.isAdmin = true;
    }
  },

  async signin(username: string) {
    await new Promise((resolve) => setTimeout(resolve, 500)); // fake delay
    this.isAuthenticated = true;
    this.username = username;
    this.isAdmin = false;
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("username", username);
    localStorage.setItem("isAdmin", "false");
  },

  async loginAdmin() {
    await new Promise((resolve) => setTimeout(resolve, 500)); // fake delay
    localStorage.clear();
    this.isAuthenticated = false;
    this.username = null;
    this.isAdmin = true;
    localStorage.setItem("isAdmin", "true");
  },

  async logoutAdmin() {
    await new Promise((resolve) => setTimeout(resolve, 500)); // fake delay
    localStorage.clear();
    this.isAuthenticated = false;
    this.username = null;
    this.isAdmin = false;
  },

  async signout() {
    await new Promise((resolve) => setTimeout(resolve, 500)); // fake delay
    this.isAuthenticated = false;
    this.username = null;
    this.isAdmin = false;
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("username");
    localStorage.removeItem("isAdmin");
  },
};
