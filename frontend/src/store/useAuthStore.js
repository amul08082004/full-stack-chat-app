import { create } from "zustand";
import axios from "axios";
import { io } from "socket.io-client";

// ------------------- Base URL -------------------
// Use environment variable if set, fallback to localhost
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export const useAuthStore = create((set, get) => ({
  socket: null,
  authUser: null,
  isSigningUp: false,
  onlineUsers: [],
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,

  // ------------------- Check auth status -------------------
  checkAuth: async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/auth/check`, {
        withCredentials: true,
      });

      set({ authUser: res.data, isCheckingAuth: false });

      if (res.data && !get().socket) {
        const newSocket = io(BASE_URL, {
          withCredentials: true,
          query: { userId: res.data._id },
        });

        newSocket.on("onlineusers", (users) => set({ onlineUsers: users }));
        newSocket.emit("join", { userId: res.data._id });
        set({ socket: newSocket });
      }
    } catch (err) {
      set({ authUser: null, isCheckingAuth: false });
      console.error("Auth check failed", err);
    }
  },

  // ------------------- Login -------------------
  login: async (email, password) => {
    set({ isLoggingIn: true });
    try {
      const res = await axios.post(
        `${BASE_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      set({ authUser: res.data, isLoggingIn: false });

      if (!get().socket) {
        const newSocket = io(BASE_URL, {
          withCredentials: true,
          query: { userId: res.data._id },
        });

        newSocket.on("onlineusers", (users) => set({ onlineUsers: users }));
        newSocket.emit("join", { userId: res.data._id });
        set({ socket: newSocket });
      }
    } catch (err) {
      set({ isLoggingIn: false });
      throw err;
    }
  },

  // ------------------- Signup -------------------
  signup: async (fullName, email, password) => {
    set({ isSigningUp: true });
    try {
      const res = await axios.post(
        `${BASE_URL}/api/auth/signup`,
        { fullName, email, password },
        { withCredentials: true }
      );

      set({ authUser: res.data, isSigningUp: false });

      if (!get().socket) {
        const newSocket = io(BASE_URL, {
          withCredentials: true,
          query: { userId: res.data._id },
        });

        newSocket.on("onlineusers", (users) => set({ onlineUsers: users }));
        newSocket.emit("join", { userId: res.data._id });
        set({ socket: newSocket });
      }

      return res.data;
    } catch (err) {
      set({ isSigningUp: false });
      throw err;
    }
  },

  // ------------------- Logout -------------------
  logout: async () => {
    try {
      await axios.post(`${BASE_URL}/api/auth/logout`, {}, { withCredentials: true });

      set({ authUser: null });

      if (get().socket) {
        get().socket.disconnect();
        set({ socket: null });
      }
    } catch (err) {
      console.error("Logout failed", err);
    }
  },

  // ------------------- Update Profile -------------------
  updateProfile: async (base64Image) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axios.put(
        `${BASE_URL}/api/auth/update-profile`,
        { profilePic: base64Image },
        { withCredentials: true }
      );

      set({ authUser: res.data });
      alert("Profile updated!");
    } catch (err) {
      console.error(err);
      alert("Update failed");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
}));
