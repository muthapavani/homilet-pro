import React from "react";
import { Routes, Route } from "react-router-dom"; 
import Login from "../loginsignup/login";
import Signup from "../loginsignup/signup";
import PrivateRoute from "../loginsignup/private";
import Dashboard from "../dash";
import ForgotPassword from "../loginsignup/forgotpass";
import ResetPassword from "../loginsignup/resetpass";

const Signuplogin = () => {
    return (
       
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
            </Routes>
    );
};

export default Signuplogin;
