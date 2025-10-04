import React, { useEffect, useState, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import style from "./ChatContainer.module.css";

const ChatContainer = () => {
  const { messages, getMessages, isMessagesLoading, selectedUser, sendMessage, setMessage,uploading } =
    useChatStore();
  const { authUser,socket } = useAuthStore();
  const myId = authUser?._id;

  const [newMessage, setNewMessage] = useState("");
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedUser) await getMessages(selectedUser);
    };
    fetchMessages();
   if (!socket) return;
  
  socket.on("receive", (mes) => {
    if(mes.senderId===selectedUser)
    setMessage(mes);
  });

  // ✅ Cleanup to prevent duplicate listeners
  return () => {
    socket.off("receive");
  };
  }, [selectedUser,socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleImageUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setImage(URL.createObjectURL(selectedFile));
    setNewMessage("");
  };

  const send = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !file) return;

    let base64Image = "";

    try {
      if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        await new Promise((resolve, reject) => {
          reader.onloadend = () => {
            base64Image = reader.result;
            resolve();
          };
          reader.onerror = reject;
        });

        setFile(null);
        setImage(null);
      }

      await sendMessage(selectedUser, base64Image, newMessage,socket,authUser,selectedUser);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className={style.container}>
      {selectedUser ? (
        <>
          <div className={style.chatHeader}>
            <h3>{authUser?.fullName || "User"}</h3>
          </div>

          <div className={style.messageContainer}>
            {isMessagesLoading ? (
              <div className={style.loading}>Loading messages...</div>
            ) : messages.length > 0 ? (
              messages.map((mes, index) => {
                const isMyMessage = mes.senderId === myId;
                return (
                  <div
                    className={`${style.messageBubble} ${
                      isMyMessage ? style.sender : style.receiver
                    }`}
                    key={mes._id || index}
                  >
                    {mes.image && (
                      <img
                        className={style.messageImage}
                        src={mes.image}
                        alt="sent media"
                      />
                    )}
                    {mes.text && <p>{mes.text}</p>}
                  </div>
                );
              })
            ) : (
              <div className={style.noMessages}>Start a conversation!</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {uploading && (
            <div className={style.uploading}>Uploading your image...</div>
          )}

          <form className={style.inputContainer} onSubmit={send}>
            <label htmlFor="imageUpload" className={style.imageUploadLabel}>
              {image ? (
                <img
                  className={style.previewImage}
                  src={image}
                  alt="preview"
                />
              ) : (
                <span>🖼️</span>
              )}
            </label>

            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />

            <input
              type="text"
              placeholder={image ? "Add a caption..." : "Type a message..."}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(e)}
            />

            <button type="submit" disabled={!newMessage.trim() && !file}>
              ➤
            </button>
          </form>
        </>
      ) : (
        <div className={style.noChatSelected}>
          <h2>Welcome 👋</h2>
          <p>Select a chat to start messaging</p>
        </div>
      )}
    </div>
  );
};

export default ChatContainer;
