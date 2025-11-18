import React, { useState } from "react";
import axios from "axios";
import { Form, Button, Container, Alert, Card } from "react-bootstrap";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient",
    specialization: "", // dodato polje za doktore
  });

  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success");

  // Lista svih specijalizacija doktora
  const doctorSpecializations = [
    "Opšta praksa",
    "Kardiolog",
    "Dermatolog",
    "Neurolog",
    "Ortoped",
    "Kožni lekar",
    "Internista",
    "Radiolog",
    "Anesteziolog",
    "Psiholog",
    "Psihijatar",
    "Endokrinolog",
    "Nutricionista",
    "Ginekolog",
    "Zubar",
    "Oftalmolog",
    "Pediatar",
    "Fizioterapeut",
    "Urolog",
    "Pulmolog",
    "Neonatolog",
    "Infektolog",
    "Reumatolog",
    "Psihoterapeut",
    "Hematolog",
    "Gastroenterolog",
    "Onkolog",
    "Logoped",
    "Logopedski terapeut",
    "Kiropraktičar",
    "Oralni hirurg",
    "Sportski lekar",
    "Laboratorijski tehničar"
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", formData);
      setVariant("success");
      setMessage("✅ Registracija uspešna! Dobrodošli " + res.data.user.name);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "patient",
        specialization: "",
      });
    } catch (err) {
      setVariant("danger");
      setMessage(err.response?.data?.message || "❌ Greška prilikom registracije!");
    }
  };

  return (
    <Container style={{ maxWidth: "500px", marginTop: "50px" }}>
      <Card>
        <Card.Body>
          <Card.Title className="mb-4">Registracija</Card.Title>
          {message && <Alert variant={variant}>{message}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Ime</Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="Unesite ime"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Unesite email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Lozinka</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Unesite lozinku"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Uloga</Form.Label>
              <Form.Select name="role" value={formData.role} onChange={handleChange}>
                <option value="patient">Pacijent</option>
                <option value="doctor">Doktor</option>
              </Form.Select>
            </Form.Group>

            {/* Dropdown za specijalizaciju prikazan samo za doktore sa scroll-om */}
            {formData.role === "doctor" && (
            <Form.Group className="mb-3">
                <Form.Label>Specijalizacija</Form.Label>
                <Form.Select
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                required
                style={{
                    maxHeight: "150px", // maksimalna visina dropdown-a
                    overflowY: "auto",
                }}
                size={doctorSpecializations.length > 10 ? 10 : doctorSpecializations.length} // prikazuje 10 opcija + scroll
                >
                <option value="">-- Izaberite specijalizaciju --</option>
                {doctorSpecializations.map((spec, i) => (
                    <option key={i} value={spec}>
                    {spec}
                    </option>
                ))}
                </Form.Select>
            </Form.Group>
            )}


            <Button variant="primary" type="submit" className="w-100">
              Registruj se
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default RegisterForm;


