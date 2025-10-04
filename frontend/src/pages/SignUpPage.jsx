import { useState } from "react"
import axios from "axios"
import { useAuthStore } from "../store/useAuthStore"
import styles from "./SignUpPage.module.css"
import {io} from "socket.io-client"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  })
  const navigate = useNavigate()
  const { authUser, isSigningUp,signup } = useAuthStore()

  const validateForm = () => {
    if (!formData.fullName.trim()) return alert("Full name required"), false
    if (!formData.email.trim()) return alert("Email required"), false
    if (!/\S+@\S+\.\S+/.test(formData.email)) return alert("Invalid email"), false
    if (!formData.password.trim()) return alert("Password required"), false
    if (formData.password.length < 6) return alert("Password min 6 chars"), false
    return true
  }

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  try {
    await signup(formData.fullName, formData.email, formData.password);
     toast.success("signup successful!")
        navigate("/") // redirect after signup

  } catch (err) {
    alert(err.response?.data?.message || "Signup failed");
  }
};


  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, fullName: e.target.value }))
            }
            className={styles.inputField}
          />
          <input
            type="text"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            className={styles.inputField}
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, password: e.target.value }))
            }
            className={styles.inputField}
          />
          <button
            type="submit"
            disabled={isSigningUp}
            className={styles.submitBtn}
          >
            {isSigningUp ? "Signing up..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default SignUpPage
