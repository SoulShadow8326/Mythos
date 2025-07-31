import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import ScrollButton from '../components/ScrollButton';
import './HomePage.css';
const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [animatedText, setAnimatedText] = useState('');
  const [showContent, setShowContent] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  
  const fullText = "Where imagination meets artificial intelligence. Create characters, weave plots, and watch as your stories unfold in ways you never imagined.";
  
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setAnimatedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
        setTimeout(() => setShowContent(true), 500);
      }
    }, 50);
    
    return () => clearInterval(timer);
  }, [fullText]);
  useEffect(() => {
    let scrollThreshold = 0;
    const handleScroll = () => {
      const heroSection = document.getElementById('hero');
      const quickStartSection = document.getElementById('quick-start');
      const creativeJourneySection = document.getElementById('creative-journey');
      
      if (!heroSection || !quickStartSection || !creativeJourneySection) return;
      
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      
      const heroTop = heroSection.offsetTop;
      const quickStartTop = quickStartSection.offsetTop;
      const creativeJourneyTop = creativeJourneySection.offsetTop;
      
      if (scrollPosition < creativeJourneyTop) {
        setActiveSection('hero');
      } else if (scrollPosition < quickStartTop) {
        setActiveSection('creative-journey');
      } else {
        setActiveSection('quick-start');
      }
    };
    const handleWheel = (e) => {
      e.preventDefault();
      
      
      scrollThreshold += Math.abs(e.deltaY) * 0.25;
      
              if (scrollThreshold < 100) return;
      
              scrollThreshold = 0;
      
      const sections = ['hero', 'creative-journey', 'quick-start'];
      const currentIndex = sections.indexOf(activeSection);
      
      if (e.deltaY > 0 && currentIndex < sections.length - 1) {
        const nextSection = document.getElementById(sections[currentIndex + 1]);
        nextSection?.scrollIntoView({ behavior: 'smooth' });
        setActiveSection(sections[currentIndex + 1]);
      } else if (e.deltaY < 0 && currentIndex > 0) {
        const prevSection = document.getElementById(sections[currentIndex - 1]);
        prevSection?.scrollIntoView({ behavior: 'smooth' });
        setActiveSection(sections[currentIndex - 1]);
      }
    };
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [activeSection]);
  const quickActions = [
    {
      title: "Start Writing",
      description: "Begin crafting your story",
      path: "/story",
      icon: "WRITE"
    },
    {
      title: "Create Characters",
      description: "Design your cast",
      path: "/character",
      icon: "CHAR"
    },
    {
      title: "Browse Library",
      description: "View your stories",
      path: "/library",
      icon: "LIB"
    }
  ];
  return (
    <div className="home-page">
      <div className="home-container">
        <section id="hero" className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="title-main">Mythos</span>
            </h1>
            
            <div className="hero-subtitle">
              <p className="animated-text">{animatedText}</p>
              <span className="cursor">|</span>
            </div>
            
            {showContent && (
              <div className="hero-actions fade-in">
                <ScrollButton 
                  variant="primary"
                  onClick={() => navigate('/story')}
                >
                  Begin Your Tale
                </ScrollButton>
              </div>
            )}
          </div>
          
          <div className="hero-visual">
            <div className="hero-graphic">
              <div className="floating-element" style={{ animationDelay: '0s' }}>STORY</div>
              <div className="floating-element" style={{ animationDelay: '1s' }}>WRITE</div>
              <div className="floating-element" style={{ animationDelay: '2s' }}>CREATE</div>
              <div className="floating-element" style={{ animationDelay: '3s' }}>DREAM</div>
            </div>
          </div>
        </section>
        <div className="section-navigation">
          <button 
            className={`nav-dot ${activeSection === 'hero' ? 'active' : ''}`}
            onClick={() => document.getElementById('hero').scrollIntoView({ behavior: 'smooth' })}
            title="Hero Section"
          ></button>
          <button 
            className={`nav-dot ${activeSection === 'creative-journey' ? 'active' : ''}`}
            onClick={() => document.getElementById('creative-journey').scrollIntoView({ behavior: 'smooth' })}
            title="Your Creative Journey"
          ></button>
          <button 
            className={`nav-dot ${activeSection === 'quick-start' ? 'active' : ''}`}
            onClick={() => document.getElementById('quick-start').scrollIntoView({ behavior: 'smooth' })}
            title="Quick Start"
          ></button>
        </div>
        
        <section id="creative-journey" className="about-section">
          <div className="about-card card">
            <h2>Your Creative Journey</h2>
            <p>
              Mythos is more than just a writing tool—it's your creative companion. 
              Whether you're crafting epic fantasies, mysterious thrillers, or heartfelt 
              romances, our AI-powered platform helps you bring your stories to life 
              with intelligent suggestions, character development tools, and plot 
              visualization features.
            </p>
            <div className="about-stats">
              <div className="stat">
                <span className="stat-number">∞</span>
                <span className="stat-label">Possibilities</span>
              </div>
              <div className="stat">
                <span className="stat-number">AI</span>
                <span className="stat-label">Powered</span>
              </div>
              <div className="stat">
                <span className="stat-number">100%</span>
                <span className="stat-label">Creative</span>
              </div>
            </div>
          </div>
        </section>
        <section id="quick-start" className="quick-actions-section">
          <div className="quick-actions-grid">
            {quickActions.map((action, index) => (
              <div 
                key={index} 
                className="quick-action-card card"
                onClick={() => navigate(action.path)}
              >
                <div className="action-icon">{action.icon}</div>
                <h3 className="action-title">{action.title}</h3>
                <p className="action-description">{action.description}</p>
                <div className="action-arrow">→</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
export default HomePage; 