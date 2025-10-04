import { useState } from "react"
import { useAuthStore } from "../store/useAuthStore"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

import styles from "./LoginPage.module.css"

const LoginPage = () => {
  const { login, logout, authUser, isLoggingIn } = useAuthStore()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(email, password)
       toast.success("Login successful!")
      navigate("/") // redirect after login
    } catch (err) {
      alert(err.response?.data?.message || "Login failed")
    }
  }

  const handleLogout = () => {
    logout()
  }

  if (authUser) {
    return (
      <div className={styles.loggedInWrapper}>
        <div className={styles.loggedInCard}>
          <h2 className={styles.loggedInText}>
            You are already logged in
          </h2>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Login</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.inputField}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.inputField}
          />
          <button
            type="submit"
            disabled={isLoggingIn}
            className={styles.submitBtn}
          >
            {isLoggingIn ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
      <div className={styles.bg}></div>
    </div>
  )
}

export default LoginPage
