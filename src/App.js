import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import TwistPage from './pages/TwistGenerator';
import PlotPage from './pages/PlotVisualizer';
import CharacterPage from './pages/CharacterCreator';
import StoryPage from './pages/StoryBuilder';
import AuthPage from './pages/AuthPage';
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
            <Route path="/character" element={<CharacterPage />} />
            <Route path="/plot" element={<PlotPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/twist" element={<TwistPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;