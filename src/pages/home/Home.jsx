import React, { useEffect, useState } from "react";
import {
  BarChart3,
  AlarmClock,
  LineChart,
  ShieldCheck,
  Smartphone,
  Lightbulb,
} from "lucide-react";
import "./home.css";

const Index = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const animateOnScroll = () => {
      const elements = document.querySelectorAll(
        ".feature-card, .stat-item, .value-content"
      );
      elements.forEach((element) => {
        const position = element.getBoundingClientRect().top;
        if (position < window.innerHeight - 100) {
          element.classList.add("animate");
        }
      });
    };
    window.addEventListener("scroll", animateOnScroll);
    animateOnScroll();
    return () => window.removeEventListener("scroll", animateOnScroll);
  }, []);

  const features = [
    {
      icon: <BarChart3 size={32} />,
      title: "Comprehensive Tracking",
      description:
        "Monitor all your debts in one place with real-time updates.",
    },
    {
      icon: <AlarmClock size={32} />,
      title: "Smart Reminders",
      description: "Never miss a payment with flexible alert options.",
    },
    {
      icon: <LineChart size={32} />,
      title: "Visual Analytics",
      description: "Track progress with beautiful interactive graphs.",
    },
    {
      icon: <ShieldCheck size={32} />,
      title: "Secure Storage",
      description: "Your data is encrypted with industry best practices.",
    },
    {
      icon: <Smartphone size={32} />,
      title: "Mobile Friendly",
      description: "Access your financial dashboard from any device.",
    },
    {
      icon: <Lightbulb size={32} />,
      title: "Payoff Strategies",
      description: "AI-powered suggestions for smarter debt payoff.",
    },
  ];

  return (
    <div className="modern-app">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Take Control of <span className="highlight">Your Finances</span>
          </h1>
          <p className="hero-subtitle">
            Track, manage, and conquer your debts with our intuitive platform.
            Transform your financial future with smart tools and insights.
          </p>
          <button className="cta-button">Get Started</button>
        </div>
      </section>

      <section className="features-section">
        <div className="section-header">
          <div className="section-badge">Powerful Features</div>
          <h2 className="section-title">
            Everything you need to <span className="highlight">succeed</span>
          </h2>
          <p className="section-subtitle">
            Our comprehensive suite of tools makes debt management simple and effective.
          </p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="value-section">
        <div className="value-content">
          <div className="section-badge">Why It Matters</div>
          <h2 className="section-title">
            Financial freedom starts with <span className="highlight">awareness</span>
          </h2>
          <p className="value-text">
            Our app provides the tools and insights you need to transform your 
            relationship with debt, reduce stress, and build confidence in your 
            financial future. Take the first step toward freedom today.
          </p>

          <div className="stats-container">
            <div className="stat-item">
              <div className="stat-number">85%</div>
              <div className="stat-label">Reduced debt in 3 months</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">4.9★</div>
              <div className="stat-label">Average rating</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">10k+</div>
              <div className="stat-label">Happy users</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">$2M+</div>
              <div className="stat-label">Debt paid off</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
