import React, { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { Card, Button, Form, Badge, Modal } from "react-bootstrap";
import AIChat from "./AIChat";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";

const PatientDashboard = () => {
  const { user, token, logout } = useContext(AuthContext);

  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDoctorType, setSelectedDoctorType] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [time, setTime] = useState("");
  const [patientMessage, setPatientMessage] = useState("");

  const [therapies, setTherapies] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  const doctorSpecializations = [
    "Opšta praksa","Kardiolog","Dermatolog","Neurolog","Ortoped","Kožni lekar",
    "Internista","Radiolog","Anesteziolog","Psiholog","Psihijatar","Endokrinolog",
    "Nutricionista","Ginekolog","Zubar","Oftalmolog","Pediatar","Fizioterapeut",
    "Urolog","Pulmolog","Infektolog","Reumatolog","Onkolog","Sportski lekar"
  ];

  // INIT
  useEffect(() => {
    if (!token) return;
    fetchDoctors();
    fetchAppointments();
    fetchTherapies();
    fetchCalendar();
  }, [token]);

  const fetchDoctors = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/doctors");
      setDoctors(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/appointments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTherapies = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/medical/my-therapies", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTherapies(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCalendar = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/appointments/calendar", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCalendarEvents(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // SLOTOVI 08–20 / 30 min (sa backend /api/slots)
  useEffect(() => {
    const loadSlots = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/slots", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSlots(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    if (selectedDoctor && date) {
      loadSlots();
    } else {
      setSlots([]);
      setTime("");
    }
  }, [selectedDoctor, date, token]);

  const createAppointment = async () => {
    if (!selectedDoctor || !date || !time) {
      return alert("Izaberite doktora, datum i termin!");
    }

    try {
      const dateTime = new Date(`${date}T${time}:00`);
      await axios.post(
        "http://localhost:5000/api/appointments",
        {
          doctorId: selectedDoctor,
          date: dateTime.toISOString(),
          patientMessage,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSelectedDoctor("");
      setSelectedDoctorType("");
      setDate("");
      setTime("");
      setPatientMessage("");
      setSlots([]);

      fetchAppointments();
      alert("Pregled zakazan! Čeka potvrdu doktora.");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Greška pri zakazivanju");
    }
  };

  const sendEmergency = async (appointmentId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/appointments/${appointmentId}/emergency`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Hitni alarm poslat doktoru!");
      fetchAppointments();
    } catch (err) {
      console.error(err);
      alert("Greška pri slanju alarma");
    }
  };

  // DANAŠNJI LEKOVI
  const todayMedications = useMemo(() => {
    const today = new Date();
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const list = [];

    therapies.forEach((th) => {
      th.medications?.forEach((m) => {
        if (!m.startDate || !m.endDate) return;
        const s = new Date(m.startDate);
        const e = new Date(m.endDate);
        const s0 = new Date(s.getFullYear(), s.getMonth(), s.getDate());
        const e0 = new Date(e.getFullYear(), e.getMonth(), e.getDate());
        if (t >= s0 && t <= e0) {
          list.push(m);
        }
      });
    });

    return list;
  }, [therapies]);

  // KALENDAR EVENTI (sa vremenom)
  const formattedEvents = useMemo(() => {
    const events = [];

    calendarEvents.forEach((ev) => {
      // očekujemo: { medicationName, schedule: ["08:00",...], startDate, endDate }
      const { medicationName, schedule, startDate, endDate } = ev;
      if (!schedule || !startDate || !endDate) return;

      const start = new Date(startDate);
      const end = new Date(endDate);

      schedule.forEach((timeStr) => {
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split("T")[0];
          events.push({
            title: `${medicationName} (${timeStr})`,
            start: `${dateStr}T${timeStr}:00`,
            end: `${dateStr}T${timeStr}:00`,
          });
        }
      });
    });

    return events;
  }, [calendarEvents]);

  return (
    <div className="container mt-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2>Patient Dashboard</h2>
          <p className="mb-0">Dobrodošli, {user.name}</p>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <Button
            variant="outline-primary"
            onClick={() => setShowCalendarModal(true)}
          >
            📅 Kalendar terapija
          </Button>
          <Button variant="danger" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>

      {/* DANAŠNJI LEKOVI */}
      <div className="mt-2 mb-3">
        <h5>🔔 Današnji lekovi</h5>
        {todayMedications.length === 0 ? (
          <p className="text-muted mb-0">Nema propisanih lekova za danas.</p>
        ) : (
          <ul className="mb-0">
            {todayMedications.map((m, idx) => (
              <li key={idx}>
                <b>{m.name}</b> {m.dose && `(${m.dose})`} – vremena:{" "}
                {m.schedule?.length ? m.schedule.join(", ") : "nije definisano"}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* AI CHAT ZA ODABIR TIP DOKTORA */}
      <AIChat onSelectDoctorType={(type) => setSelectedDoctorType(type)} />

      {/* PREPORUČENI DOKTORI */}
      {doctors.length > 0 && (
        <>
          <h3 className="mt-4">Naši doktori</h3>
          <div className="doctor-grid">
            {doctors.slice(0, 4).map((d) => (
              <div className="doctor-card" key={d._id}>
                <div className="doctor-avatar">
                  {d.user?.name?.[0]?.toUpperCase() || "D"}
                </div>
                <div>
                  <div className="doctor-info-main">
                    {d.user?.name || "Doktor"}
                  </div>
                  <div className="doctor-spec">
                    {d.specialization || "Specijalista"}
                  </div>
                  {d.experience && (
                    <div className="doctor-exp">
                      {d.experience} god. iskustva
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ZAKAZIVANJE PREGLEDA */}
      <h3 className="mt-4">Zakazivanje pregleda</h3>
      <Form className="mb-4">
        <Form.Group className="mb-2">
          <Form.Label>Tip doktora</Form.Label>
          <Form.Select
            value={selectedDoctorType}
            onChange={(e) => {
              setSelectedDoctorType(e.target.value);
              setSelectedDoctor("");
            }}
          >
            <option value="">-- Izaberite tip doktora --</option>
            {doctorSpecializations.map((s, i) => (
              <option key={i} value={s}>
                {s}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Izaberite doktora</Form.Label>
          <Form.Select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
          >
            <option value="">-- Izaberite doktora --</option>
            {doctors
              .filter((d) =>
                selectedDoctorType
                  ? d.specialization === selectedDoctorType
                  : true
              )
              .map((d) => (
                <option
                  key={d._id || d.user._id}
                  value={d.user?._id || d.user}
                >
                  {d.user?.name || d.user} - {d.specialization} (
                  {d.experience || 0} god)
                </option>
              ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Poruka za doktora (opciono)</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            value={patientMessage}
            onChange={(e) => setPatientMessage(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Datum pregleda</Form.Label>
          <Form.Control
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Vreme pregleda</Form.Label>
          <Form.Select
            value={time}
            onChange={(e) => setTime(e.target.value)}
          >
            <option value="">-- Izaberite termin --</option>
            {slots.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Form.Select>
          <small className="text-muted">Slotovi: 08:00 – 20:00 (30 min)</small>
        </Form.Group>

        <Button variant="primary" onClick={createAppointment}>
          Zakaži pregled
        </Button>
      </Form>

      {/* PREGLEDI */}
      <h3>Vaši pregledi</h3>
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
                    Doktor: {a.doctor?.name || a.doctor?.email || "—"}
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
                            : "secondary"
                        }
                      >
                        {a.status}
                      </Badge>
                    </p>
                    {a.proposedDate && (
                      <div className="text-muted">
                        Predloženi termin:{" "}
                        {new Date(a.proposedDate).toLocaleString()}
                      </div>
                    )}
                    {a.emergency && (
                      <div className="text-danger fw-bold">
                        🚨 Hitni alarm aktivan
                      </div>
                    )}
                  </div>

                  <div className="d-flex gap-2 mt-2">
                    <Button
                      variant="outline-danger"
                      onClick={() => sendEmergency(a._id)}
                    >
                      Pošalji hitni alarm
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* VAŠE TERAPIJE */}
      <h3 className="mt-4">Vaše terapije</h3>
      {therapies.length === 0 ? (
        <p className="text-muted">Nema aktivnih terapija.</p>
      ) : (
        therapies.map((t) => (
          <Card className="mb-3" key={t._id}>
            <Card.Body>
              <Card.Title>
                Doktor: {t.doctor?.name || t.doctor?.email || "—"}
              </Card.Title>
              {t.medications && t.medications.length > 0 ? (
                <ul className="mb-0">
                  {t.medications.map((m, idx) => (
                    <li key={idx}>
                      <b>{m.name}</b> {m.dose && `(${m.dose})`}
                      <br />
                      Vremena:{" "}
                      {m.schedule && m.schedule.length > 0
                        ? m.schedule.join(", ")
                        : "nije definisano"}
                      <br />
                      Period:{" "}
                      {m.startDate
                        ? new Date(m.startDate).toLocaleDateString()
                        : "?"}{" "}
                      –{" "}
                      {m.endDate
                        ? new Date(m.endDate).toLocaleDateString()
                        : "?"}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mb-0 text-muted">
                  Nema definisanih lekova u terapiji.
                </p>
              )}
            </Card.Body>
          </Card>
        ))
      )}

      {/* MODAL – KALENDAR TERAPIJA */}
      <Modal
        show={showCalendarModal}
        onHide={() => setShowCalendarModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>📅 Kalendar terapija</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formattedEvents.length === 0 ? (
            <p>Nema terapija u kalendaru.</p>
          ) : (
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              allDaySlot={false}
              slotMinTime="06:00:00"
              slotMaxTime="23:00:00"
              events={formattedEvents}
              height="650px"
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowCalendarModal(false)}
          >
            Zatvori
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PatientDashboard;


