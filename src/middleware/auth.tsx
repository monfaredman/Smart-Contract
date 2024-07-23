// AuthProvider interface
interface AuthProvider {
  isAuthenticated: boolean;
  username: null | string;
  signin(username: string): Promise<void>;
  signout(): Promise<void>;
}

// Fake authentication provider
export const fakeAuthProvider: AuthProvider = {
  isAuthenticated: false,
  username: null,

  // Initialize state from local storage
  async init() {
    const storedUsername = localStorage.getItem("username");
    const storedIsAuthenticated =
      localStorage.getItem("isAuthenticated") === "true";

    if (storedIsAuthenticated && storedUsername) {
      this.isAuthenticated = true;
      this.username = storedUsername;
    }
  },

  async signin(username: string) {
    await new Promise((r) => setTimeout(r, 500)); // fake delay
    this.isAuthenticated = true;
    this.username = username;

    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("username", username);
  },

  async signout() {
    await new Promise((r) => setTimeout(r, 500)); // fake delay
    this.isAuthenticated = false;
    this.username = null;

    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("username");
  },
};
