// src/components/ForgotPassword.js
import React, { useState } from "react";
import axios from "axios";
import config from "../config";
import { toast } from "react-toastify";
import {
    Button,
    TextField,
    Typography,
    Container,
    Box,
    CssBaseline,
} from "@mui/material";

function ForgotPassword() {
    const [email, setEmail] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await axios.post(
                `${config.apiUrl}/api/users/forgot-password`,
                { email: email }
            );
            // Handle success (e.g., display success message)
            console.log(response.data);
            toast.success("Password reset email sent!");
        } catch (error) {
            console.error("Error sending password reset email:", error);
            toast.error("Failed to send password reset email.");
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
                sx={{
                    marginTop: 8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <Typography component="h1" variant="h5">
                    Forgot Password
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Send Reset Email
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}

export default ForgotPassword;