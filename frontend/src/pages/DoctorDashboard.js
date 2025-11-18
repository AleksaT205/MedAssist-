import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { Modal, Button, Form, Card, Badge } from "react-bootstrap";

const DoctorDashboard = () => {
  const { user, token, logout } = useContext(AuthContext);

  // Pregledi doktora
  const [appointments, setAppointments] = useState([]);

  // Kartoni pacijenata (može biti niz ili jedan obj.)
  const [records, setRecords] = useState([]);

  // Modal za terapiju
  const [showTherapyModal, setShowTherapyModal] = useState(false);
  const [therapyAppointment, setTherapyAppointment] = useState(null);
  const [therapyDescription, setTherapyDescription] = useState("");
  const [therapySchedule, setTherapySchedule] = useState("");
  const [therapyStartDate, setTherapyStartDate] = useState("");
  const [therapyEndDate, setTherapyEndDate] = useState("");
  const [therapyDose, setTherapyDose] = useState("");

  // Modal za poruku pacijentu
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [noteText, setNoteText] = useState("");

  // FETCH FUNKCIJE
  const fetchAppointments = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/appointments/doctor",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAppointments(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecords = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/medical/records", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecords(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchAppointments();
    fetchRecords();
  }, [token]);

  // LOGIKA ZA TERAPIJU IZ TERMINA
  const openTherapyModal = (appt) => {
    setTherapyAppointment(appt);
    setTherapyDescription("");
    setTherapySchedule("");
    setTherapyStartDate("");
    setTherapyEndDate("");
    setShowTherapyModal(true);
  };

  const createTherapy = async () => {
    if (!therapyAppointment) return;
    if (!therapyDescription) return alert("Naziv leka je obavezan");
    if (!therapyStartDate || !therapyEndDate)
      return alert("Unesite početak i kraj terapije!");

    try {
      await axios.post(
        "http://localhost:5000/api/medical/therapy-from-appointment",
        {
          appointmentId: therapyAppointment._id,

          medications: [
            {
              name: therapyDescription,
              dose: therapyDose || "",
              schedule: therapySchedule
                ? therapySchedule.split(",").map((s) => s.trim())
                : [],
              startDate: therapyStartDate,
              endDate: therapyEndDate,
            }
          ],

          notes: ""
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Terapija uspešno dodata!");
      setShowTherapyModal(false);
      fetchRecords();
      fetchAppointments();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Greška pri dodavanju terapije");
    }
  };



  // PORUKA PACIJENTU
  const openNoteModal = (appt) => {
    setCurrentAppointment(appt);
    setNoteText(appt.doctorMessage || "");
    setShowNoteModal(true);
  };

  const saveNote = async () => {
    if (!currentAppointment) return;
    try {
      await axios.put(
        `http://localhost:5000/api/appointments/${currentAppointment._id}/status`,
        { doctorMessage: noteText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowNoteModal(false);
      fetchAppointments();
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `http://localhost:5000/api/appointments/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAppointments();
    } catch (err) {
      console.error(err);
    }
  };

  // HELPER za prikaz kartona – podržava i niz i jedan objekat sa entries
  const renderRecords = () => {
    if (!records) return <p>Nema kartona.</p>;

    // UVEK napravimo niz
    const arr = Array.isArray(records) ? records : [records];

    if (arr.length === 0) return <p>Nema kartona.</p>;

    return arr.map((r, i) => (
      <Card className="mb-3" key={r._id || i}>
        <Card.Body>
          <Card.Title>{r.patient?.name || "Pacijent"}</Card.Title>

          {/* MODEL 1: entries postoji */}
          {r.entries && r.entries.length > 0 ? (
            r.entries.map((entry, idx) => (
              <div
                key={idx}
                className="p-3 mb-3 border rounded"
                style={{ background: "#f8f9fa" }}
              >
                <h6 className="mb-1">
                  📅 {entry.date ? new Date(entry.date).toLocaleDateString() : "-"}
                </h6>

                <p className="mb-1">
                  <b>Dijagnoza:</b> {entry.diagnosis || "N/A"}
                </p>

                <p className="mb-2">
                  <b>Napomena:</b> {entry.notes || "-"}
                </p>

                {/* Terapije */}
                {entry.therapy?.medications?.length > 0 && (
                  <>
                    <b>Terapija:</b>
                    <ul>
                      {entry.therapy.medications.map((m, j) => (
                        <li key={j}>
                          <b>{m.name}</b> {m.dose && `(${m.dose})`}
                          <br />
                          🕒 {m.schedule?.length ? m.schedule.join(", ") : "Nema rasporeda"}
                          <br />
                          📅 {m.startDate ? new Date(m.startDate).toLocaleDateString() : "?"} –{" "}
                          {m.endDate ? new Date(m.endDate).toLocaleDateString() : "?"}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            ))
          ) : (
            /* MODEL 2: stari karton (diagnosis + notes direktno) */
            <div className="card-text">
              <p className="mb-1">
                <b>Dijagnoza:</b> {r.diagnosis || "N/A"}
              </p>
              <p className="mb-0">
                <b>Napomena:</b> {r.notes || "-"}
              </p>
            </div>
          )}
        </Card.Body>
      </Card>
    ));
  };


  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2>Doktor Dashboard</h2>
          <p className="mb-0">Dobrodošli, {user.name}</p>
        </div>
        <Button variant="danger" onClick={logout}>
          Logout
        </Button>
      </div>

      {/* PREGLEDI */}
      <h3>Zakazani pregledi</h3>
      {appointments.length === 0 ? (
        <p className="text-muted">Nema zakazanih pregleda.</p>
      ) : (
        <div className="row">
          {appointments.map((a) => (
            <div className="col-md-6" key={a._id}>
              <Card className="mb-3">
                <Card.Body>
                  <Card.Title>{new Date(a.date).toLocaleString()}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    Pacijent: {a.patient?.name || a.patient?.email || "—"}
                  </Card.Subtitle>

                  <div className="card-text">
                    <p className="mb-1">
                      <b>Poruka pacijenta:</b> {a.patientMessage || "-"}
                    </p>
                    <p className="mb-1">
                      <b>Poruka doktora:</b> {a.doctorMessage || "-"}
                    </p>
                    <p className="mb-2">
                      <b>Status:</b>{" "}
                      <Badge
                        bg={
                          a.status === "pending"
                            ? "warning"
                            : a.status === "confirmed"
                            ? "primary"
                            : a.status === "completed"
                            ? "success"
                            : "secondary"
                        }
                      >
                        {a.status}
                      </Badge>
                    </p>
                    {a.proposedDate && (
                      <div className="text-muted">
                        Predložen novi termin:{" "}
                        {new Date(a.proposedDate).toLocaleString()}
                      </div>
                    )}
                    {a.emergency && (
                      <div className="text-danger fw-bold mt-1">
                        🚨 HITNO — pacijent je poslao alarm
                      </div>
                    )}
                  </div>

                  <div className="d-flex flex-wrap gap-2 mt-2">
                    <Button
                      variant="outline-primary"
                      onClick={() => openNoteModal(a)}
                    >
                      Poruka pacijentu
                    </Button>
                    <Button
                      variant="outline-success"
                      onClick={() => updateStatus(a._id, "confirmed")}
                    >
                      Potvrdi
                    </Button>
                    <Button
                      variant="outline-danger"
                      onClick={() => updateStatus(a._id, "rejected")}
                    >
                      Odbij
                    </Button>
                    <Button
                      variant="outline-warning"
                      onClick={() => updateStatus(a._id, "completed")}
                    >
                      Završi
                    </Button>
                  </div>

                  <Button
                    className="mt-3 w-100"
                    variant="outline-info"
                    onClick={() => openTherapyModal(a)}
                  >
                    ➕ Dodaj terapiju za ovaj pregled
                  </Button>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* KARTONI PACIJENATA */}
      <h3 className="mt-4">Kartoni pacijenata</h3>
      {renderRecords()}

      {/* MODAL – TERAPIJA */}
      <Modal
        show={showTherapyModal}
        onHide={() => setShowTherapyModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Dodaj terapiju za pregled</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {therapyAppointment && (
            <p>
              Pacijent:{" "}
              <b>
                {therapyAppointment.patient?.name ||
                  therapyAppointment.patient?.email}
              </b>
            </p>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Opis terapije</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={therapyDescription}
              onChange={(e) => setTherapyDescription(e.target.value)}
              placeholder="npr. Ospamox 500mg, Defrinol..."
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Doza (opciono)</Form.Label>
            <Form.Control
              type="text"
              value={therapyDose}
              onChange={(e) => setTherapyDose(e.target.value)}
              placeholder="npr. 500mg, 1 tableta, 3x dnevno"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Raspored (vremena, razdvojena zarezom)</Form.Label>
            <Form.Control
              type="text"
              value={therapySchedule}
              onChange={(e) => setTherapySchedule(e.target.value)}
              placeholder="08:00, 16:00, 00:00"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Početak terapije</Form.Label>
            <Form.Control
              type="date"
              value={therapyStartDate}
              onChange={(e) => setTherapyStartDate(e.target.value)}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Kraj terapije</Form.Label>
            <Form.Control
              type="date"
              value={therapyEndDate}
              onChange={(e) => setTherapyEndDate(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTherapyModal(false)}>
            Zatvori
          </Button>
          <Button variant="primary" onClick={createTherapy}>
            Sačuvaj terapiju
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL – PORUKA PACIJENTU */}
      <Modal show={showNoteModal} onHide={() => setShowNoteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Poruka za pacijenta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            as="textarea"
            rows={4}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNoteModal(false)}>
            Zatvori
          </Button>
          <Button variant="primary" onClick={saveNote}>
            Sačuvaj</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DoctorDashboard;




