/**
 * This component handles user registration using a form with React Hook Form and Yup validation.
 *
 * Main Features:
 * - Validates name, email, and password fields.
 * - Calls register API via authService.
 * - Displays a loading spinner while registering.
 * - Shows success or error notifications with React Toastify.
 * - Navigates to home page upon successful registration.
 * - Provides link to login page for existing users.
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import authService from "../services/authService";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners"; // Spinner for loading state

// Yup validation schema for the registration form
const registerSchema = yup.object().shape({
    name: yup.string().min(2, "Name must be at least 2 characters").required("Name is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

/**
 * Register Component
 *
 * Renders the user registration form with validation and submission logic.
 *
 * @returns {JSX.Element} Registration form UI
 */
function Register() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(registerSchema),
    });

    /**
     * onSubmit
     *
     * Handles form submission:
     * - Sends user data to register API.
     * - Saves user info to localStorage.
     * - Shows success or error notification.
     * - Redirects to the home page upon successful registration.
     *
     * @param {Object} data - Form data (name, email, password)
     */
    const onSubmit = async (data) => {
        try {
            setLoading(true);
            const response = await authService.register(data);

            localStorage.setItem("user", JSON.stringify(response));
            toast.success("Account created successfully!");
            navigate("/");
        } catch (error) {
            console.error(error);
            toast.error("Registration failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            {loading ? (
                <ClipLoader color="#00b894" size={50} />
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} style={styles.card}>
                    <h2 style={styles.title}>Create Account ✨</h2>

                    {/* Name Input */}
                    <input
                        type="text"
                        placeholder="Name"
                        {...register("name")}
                        style={styles.input}
                    />
                    {errors.name && (
                        <p style={styles.error}>{errors.name.message}</p>
                    )}

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
                        Register
                    </button>

                    {/* Link to Login Page */}
                    <p style={styles.switch}>
                        Already have an account?{" "}
                        <Link to="/login" style={styles.link}>
                            Login
                        </Link>
                    </p>
                </form>
            )}
        </div>
    );
}

/**
 * Inline styles for the Register component
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
        backgroundColor: "#00b894",
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
        color: "#00b894",
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

export default Register;
