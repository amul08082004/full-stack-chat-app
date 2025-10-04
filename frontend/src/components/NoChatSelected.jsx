// NoChatSelected.jsx (FINAL - Using CSS Classes)
import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import styles from "./NoChatSelected.module.css"; 
// NOTE: Assuming the parent (HomePage) passes setSidebarOpen for consistency
const NoChatSelected = ({ setSidebarOpen }) => { 
  const { authUser } = useAuthStore();

  return (
    <div className={styles.container}>
      <h2 className={styles.welcomeText}>
        Welcome, {authUser?.fullName || "User"} 👋
      </h2>
      <p className={styles.subText}>
        Select a chat from the sidebar to start messaging.
      </p>
      <div className={styles.visuals}>
        <span role="img" aria-label="chat" className={styles.chatIcon}>
          💬
        </span>
        {authUser?.profilePic && (
          <img 
            src={authUser.profilePic} 
            alt="Profile" 
            className={styles.profilePic}
          />
        )}
      </div>
    </div>
  );
};

export default NoChatSelected;