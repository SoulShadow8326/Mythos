import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import NavBar from './components/NavBar';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import LibraryPage from './pages/StoryLibrary';
import TwistPage from './pages/TwistGenerator';
import PlotPage from './pages/PlotVisualizer';
import CharacterPage from './pages/CharacterCreator';
import StoryPage from './pages/StoryBuilder';
import AuthPage from './pages/AuthPage';
import './styles/global.css';
import './App.css';
function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="App">
          <NavBar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/story" element={
                <ProtectedRoute>
                  <StoryPage />
                </ProtectedRoute>
              } />
              <Route path="/character" element={
                <ProtectedRoute>
                  <CharacterPage />
                </ProtectedRoute>
              } />
              <Route path="/plot" element={
                <ProtectedRoute>
                  <PlotPage />
                </ProtectedRoute>
              } />
              <Route path="/twist" element={
                <ProtectedRoute>
                  <TwistPage />
                </ProtectedRoute>
              } />
              <Route path="/library" element={
                <ProtectedRoute>
                  <LibraryPage />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}
export default App;