import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="home-container">
      <div className="home-hero-card">
        <div className="home-badges">
          <span className="home-badge">Zakazivanje pregleda</span>
          <span className="home-badge">Digitalni kartoni</span>
          <span className="home-badge">Terapije & podsetnici</span>
        </div>
        <h1 className="home-title">MedAssist – Vaša digitalna ordinacija</h1>
        <p className="home-sub">
          Jednostavno zakazivanje, pregled kartona i terapija – sve na jednom mestu,
          za doktore i pacijente.
        </p>
        <div className="home-buttons">
          <Link to="/login" className="btn-primary-rounded">
            Prijavi se
          </Link>
          <Link to="/register" className="btn-secondary-rounded">
            Kreiraj nalog
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
