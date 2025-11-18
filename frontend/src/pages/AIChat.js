import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { Button, Form, Card } from "react-bootstrap";

const AIChat = ({ onSelectDoctorType }) => {
  const { token } = useContext(AuthContext);
  const [symptoms, setSymptoms] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!symptoms.trim()) return alert("Unesite simptome.");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/ai/analyze",
        { symptoms },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResult(res.data);

      if (onSelectDoctorType)
        onSelectDoctorType(res.data.recommendedDoctorType);
    } catch (err) {
      console.error(err);
      alert("Greška pri analizi simptoma.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>AI Analiza simptoma</Card.Title>
        <Form.Group className="mb-2">
          <Form.Label>Unesite simptome</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Opis simptoma..."
          />
        </Form.Group>
        <Button onClick={analyze} disabled={loading}>
          {loading ? "Analiziram..." : "Analiziraj"}
        </Button>

        {result && (
          <div className="mt-3">
            {/* Preporuka */}
            <h6 style={{ fontWeight: "600", marginBottom: "8px" }}>Preporuka:</h6>
            <div
              style={{
                whiteSpace: "pre-wrap",
                lineHeight: "1.5",
                padding: "10px",
                backgroundColor: "#f9f9f9",
                borderRadius: "6px",
                border: "1px solid #e0e0e0",
                marginBottom: "12px",
                fontSize: "14.5px",
              }}
            >
              {result.advice}
            </div>

            {/* Moguća terapija */}
            {result.possibleTherapy?.length > 0 && (
              <div>
                <h6 style={{ fontWeight: "600", marginBottom: "6px" }}>Moguća terapija:</h6>
                <div style={{ paddingLeft: "15px" }}>
                  {result.possibleTherapy.map((t, i) => (
                    <div
                      key={i}
                      style={{
                        marginBottom: "6px",
                        backgroundColor: "#fff",
                        padding: "6px 10px",
                        borderRadius: "4px",
                        border: "1px solid #ddd",
                      }}
                    >
                      {i + 1}. {t.medication}, {t.dose}, {t.frequency}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default AIChat;
