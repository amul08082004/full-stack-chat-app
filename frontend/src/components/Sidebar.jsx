// Sidebar.jsx (Modified)
import React, { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  if (isUsersLoading) return <div className={styles.loading}>Loading users...</div>;
  if (users.length === 0) return <div className={styles.noUsers}>No users found</div>;

  return (
    <>
      {/* Backdrop/Overlay: Closes sidebar when clicked (Mobile only) */}
      {open && <div className={styles.backdrop} onClick={() => setOpen(false)}></div>}

      {/* Hamburger Menu (visible only on mobile) */}
      <button
        className={`${styles.hamburger} ${open ? styles.hamburgerOpen : ''}`} // Added class for animation
        onClick={() => setOpen(!open)}
        aria-label="Toggle Sidebar"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Sidebar Container */}
      <aside className={`${styles.sidebar} ${open ? styles.open : ""}`}>
        <header className={styles.header}>
          <h2>Chats</h2>
        </header>

        <div className={styles.userList}>
          {users.map((user) => {
            const isOnline = onlineUsers.some((u) => u.userId === user._id);

            return (
              <div
                key={user._id}
                className={`${styles.userCard} ${
                  selectedUser === user._id ? styles.selected : ""
                }`}
                onClick={() => {
                  setSelectedUser(user._id);
                  setOpen(false); // Close sidebar after selecting a user
                }}
              >
                <div className={styles.avatarWrapper}>
                  <img
                    src={
                      user.profilePic ||
                      `https://ui-avatars.com/api/?name=${user.fullName}&background=random`
                    }
                    alt={user.fullName}
                    className={styles.avatar}
                  />
                  {isOnline && <div className={styles.onlineIndicator}><p>Online</p></div>}
                </div>

                <div className={styles.userDetails}>
                  <span className={styles.userName}>{user.fullName || user.email}</span>
                  <p className={styles.status}>Hey there! 👋</p>
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;