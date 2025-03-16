import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Unauthorized! Please login first.");
      navigate("/login");
      return;
    }

    axios
      .get("http://localhost:8081/dashboard", {
        headers: { Authorization: token }, // Ensure "Bearer <token>" is sent
      })
      .then((res) => {
        setMessage(res.data.message);
      })
      .catch((err) => {
        console.error("Error fetching dashboard:", err);
        alert("Session expired or unauthorized access!");
        localStorage.removeItem("token"); // Remove invalid token
        navigate("/login");
      });
  }, [navigate]);

  return (
    <div>
      <h2>{message || "Loading..."}</h2>
    </div>
  );
}

export default Dashboard;
