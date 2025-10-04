import { useAuthStore } from "../store/useAuthStore";
import { useState } from "react";
import styles from "./ProfilePage.module.css";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);

  const handleImageUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setImage(URL.createObjectURL(selectedFile));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onloadend = async () => {
        try {
          await updateProfile(reader.result);
          console.log("Profile updated successfully!");
        } catch (err) {
          console.error("Error updating profile:", err);
        }
      };
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.formCard} onSubmit={submitHandler}>
        <label htmlFor="image" className={styles.imageLabel}>
          {image ? (
            <img src={image} alt="preview" />
          ) : (
            <img src={authUser.profilePic}/>
          )}
        </label>

        <input
          type="file"
          id="image"
          accept="image/*"
          onChange={handleImageUpload}
          className={styles.fileInput}
        />

        <button
          type="submit"

          className={styles.button}
          disabled={isUpdatingProfile}
        >
          {isUpdatingProfile ? "Updating..." : "Submit"}
        </button>

        <input
          type="text"
          value={authUser?.fullName || ""}
          readOnly
          className={styles.nameInput}
        />
         <input
          type="text"
          value={authUser?.email || ""}
          readOnly
          className={styles.nameInput}
        />
        
      </form>
    </div>
  );
};

export default ProfilePage;
