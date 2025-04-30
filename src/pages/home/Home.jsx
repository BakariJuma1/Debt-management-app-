import React from "react";
import "../home/home.css";

function Home() {
  return (
    <>
      <div className="heroSection">
        <div className="heroContent">
          <h1>
            Track your Debts today <br />
            <strong>Ready to take the next step?</strong>
          </h1>
          <button className="btn">Sign up</button>
        </div>
      </div>
      <section className="featuresSection">
        <h2>What Our App Helps You Do</h2>
        <div className="cardContainer">
          <div className="card">
            <div className="cardIcon">📊</div>
            <h3>Track Debts</h3>
            <p>Easily record and monitor your debts in one place.</p>
          </div>
          <div className="card">
            <div className="cardIcon">⏰</div>
            <h3>Reminders</h3>
            <p>Get notified when repayments are due.</p>
          </div>
          <div className="card">
            <div className="cardIcon">📈</div>
            <h3>Insightful Reports</h3>
            <p>View summaries of your financial obligations.</p>
          </div>
        </div>
        <section className="aboutSection">
          <h2>Why Use a Debt Management App?</h2>
          <p>
            Managing debt manually can lead to missed deadlines, confusion, and
            stress. Our app helps you stay organized, make informed financial
            decisions, and work toward a debt-free life with confidence and
            clarity.
          </p>
        </section>
      </section>
    </>
  );
}

export default Home;
