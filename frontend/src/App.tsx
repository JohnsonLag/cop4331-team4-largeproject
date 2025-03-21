import { BrowserRouter as Router, Route, Navigate, Routes } from 'react-router-dom';
import './App.css';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import CardPage from './pages/CardPage';
import NotePage from './pages/NotePage';
import SingleNotePage from './pages/SingleNotePage';
import FlashCardDecksPage from './pages/FlashCardDecksPage';

function App() {
  return (
      <Router>
          <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/cards" element={<CardPage />} />
              <Route path="/notes" element={<NotePage/>} />
              <Route path="/notes/:id" element={<SingleNotePage />} />
              <Route path="/decks" element={<FlashCardDecksPage />} />
              {/* Default redirect if no route matches */}
              <Route path="*" element={<Navigate replace to="/" />} />
          </Routes>
      </Router>
  );
}

export default App;