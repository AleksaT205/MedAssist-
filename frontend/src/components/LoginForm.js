import React, { useState, useContext } from "react";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");
  const navigate = useNavigate(); // za redirekciju

  const handleChange = e => setForm({...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", form);
      login(res.data);

      setMsg("Uspesan login. Dobrodosli " + res.data.user.name);

      // Redirekcija na dashboard prema role
      if (res.data.user.role === "patient") {
        navigate("/patient");
      } else if (res.data.user.role === "doctor") {
        navigate("/doctor");
      } else {
        navigate("/"); // fallback
      }
    } catch (err) {
      setMsg(err.response?.data?.message || "Greška pri logovanju");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h3>Login</h3>
      <form onSubmit={handleSubmit}>
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          type="email"
          className="form-control my-2"
          required
        />
        <input
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Lozinka"
          type="password"
          className="form-control my-2"
          required
        />
        <button type="submit" className="btn btn-primary w-100">Prijavi se</button>
      </form>
      {msg && <p className="mt-2 text-danger">{msg}</p>}
    </div>
  );
}
