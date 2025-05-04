/**
 * This component handles user login using a form built with React Hook Form and Yup validation.
 *
 * Main Features:
 * - Validates email and password fields.
 * - Calls login API via authService.
 * - Displays a loading spinner during authentication.
 * - Shows success or error notifications using React Toastify.
 * - Navigates to the profile page upon successful login.
 *
 * Also includes a link to register for users who don't have an account yet.
 */

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import authService from "../services/authService";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { useState } from "react";

// Yup validation schema for login form
const loginSchema = yup.object().shape({
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup.string().required("Password is required"),
});

/**
 * Login Component
 *
 * Renders a login form with validation and authentication logic.
 *
 * @returns {JSX.Element} Login page UI
 */
function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(loginSchema),
    });

    /**
     * onSubmit
     *
     * Handles form submission:
     * - Authenticates the user via API.
     * - Saves user data to localStorage.
     * - Navigates to profile page upon success.
     * - Shows error toast if authentication fails.
     *
     * @param {Object} data - Form data (email and password)
     */
    const onSubmit = async (data) => {
        try {
            setLoading(true);
            const response = await authService.login(data);

            localStorage.setItem("user", JSON.stringify(response));
            toast.success("Logged in successfully!");
            navigate("/profile");
        } catch (error) {
            console.error(error);
            toast.error("Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            {loading ? (
                <ClipLoader color="#0077ff" size={50} />
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} style={styles.card}>
                    <h2 style={styles.title}>Welcome Back 👋</h2>

                    {/* Email Input */}
                    <input
                        type="email"
                        placeholder="Email"
                        {...register("email")}
                        style={styles.input}
                    />
                    {errors.email && (
                        <p style={styles.error}>{errors.email.message}</p>
                    )}

                    {/* Password Input */}
                    <input
                        type="password"
                        placeholder="Password"
                        {...register("password")}
                        style={styles.input}
                    />
                    {errors.password && (
                        <p style={styles.error}>{errors.password.message}</p>
                    )}

                    {/* Submit Button */}
                    <button type="submit" style={styles.button}>
                        Login
                    </button>

                    {/* Link to Registration Page */}
                    <p style={styles.switch}>
                        Don't have an account?{" "}
                        <Link to="/register" style={styles.link}>
                            Register
                        </Link>
                    </p>
                </form>
            )}
        </div>
    );
}

/**
 * Inline styles for the Login component
 */
const styles = {
    container: {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f7f9fc",
    },
    card: {
        backgroundColor: "#fff",
        padding: "2rem",
        borderRadius: "10px",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: "400px",
        gap: "1rem",
    },
    title: {
        textAlign: "center",
        marginBottom: "1rem",
        color: "#333",
    },
    input: {
        padding: "0.75rem",
        border: "1px solid #ddd",
        borderRadius: "6px",
        fontSize: "1rem",
        outline: "none",
    },
    button: {
        padding: "0.75rem",
        backgroundColor: "#0077ff",
        color: "#fff",
        fontSize: "1rem",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        transition: "background-color 0.3s",
    },
    switch: {
        marginTop: "1rem",
        textAlign: "center",
        fontSize: "0.9rem",
    },
    link: {
        color: "#0077ff",
        textDecoration: "none",
        fontWeight: "bold",
    },
    error: {
        color: "#c70000",
        fontSize: "0.8rem",
        marginTop: "-0.5rem",
        marginBottom: "0.5rem",
        textAlign: "left",
    },
};

export default Login;
