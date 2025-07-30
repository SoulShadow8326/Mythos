import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import StoryPage from './pages/StoryBuilder';
import './styles/global.css';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <NavBar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/story" element={<StoryPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
