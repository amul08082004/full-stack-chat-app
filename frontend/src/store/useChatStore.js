import { create } from "zustand";
import axios from "axios";

// ------------------- Base URL -------------------
// Use environment variable if set, fallback to localhost
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export const useChatStore = create((set, get) => ({
  users: [],
  messages: [],
  selectedUser: null, // will store user object, not just id
  isUsersLoading: false,
  isMessagesLoading: false,
  error: null,
  uploading: false,

  setMessage: (mes) => {
    set((state) => ({ messages: [...state.messages, mes] }));
  },

  getUsers: async () => {
    set({ isUsersLoading: true, error: null });
    try {
      const res = await axios.get(`${BASE_URL}/api/messages/users`, {
        withCredentials: true,
      });
      set({ users: res.data });
    } catch (err) {
      console.error("Error fetching users:", err);
      set({ error: "Failed to fetch users" });
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true, error: null });
    try {
      const res = await axios.get(`${BASE_URL}/api/messages/${userId}`, {
        withCredentials: true,
      });
      set({ messages: res.data });
    } catch (err) {
      console.error("Error fetching messages:", err);
      set({ error: "Failed to fetch messages" });
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (userId, base64Image, message, socket, authUser, selectedUser) => {
    if (base64Image) set({ uploading: true });
    try {
      const res = await axios.post(
        `${BASE_URL}/api/messages/send/${userId}`,
        { text: message, image: base64Image },
        { withCredentials: true }
      );

      const savedMessage = res.data.newMessage;

      set((state) => ({
        messages: [...state.messages, savedMessage],
      }));

      if (socket) socket.emit("send", {
        senderId: authUser._id,
        receiverId: userId,
        text: message,
        image: base64Image
      });
    } catch (err) {
      console.error("Error sending message:", err);
      set({ error: "Failed to send message" });
    } finally {
      if (base64Image) set({ uploading: false });
    }
  },

  setSelectedUser: (user) => {
    set({ selectedUser: user });
  },
}));
