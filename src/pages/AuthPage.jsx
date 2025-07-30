import React, { useState, useEffect } from 'react';
import ScrollButton from '../components/ScrollButton';
import './AuthPage.css';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      console.log('Login attempt:', { email: formData.email, password: formData.password });
    } else {
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match!');
        return;
      }
      console.log('Signup attempt:', formData);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
            <p>{isLogin ? 'Sign in to continue your journey' : 'Join Mythos to start creating'}</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className="input"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className="input"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password..."
                required
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="input"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password..."
                  required
                />
              </div>
            )}

            <ScrollButton
              variant="primary"
              type="submit"
              className="auth-submit-btn"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </ScrollButton>
          </form>

          <div className="auth-switch">
            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                className="switch-btn"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({ email: '', password: '', confirmPassword: '' });
                }}
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage; 