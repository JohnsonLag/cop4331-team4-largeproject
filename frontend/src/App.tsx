import { BrowserRouter as Router, Route, Navigate, Routes } from 'react-router-dom';
import './App.css';

import LandingPage from './pages/LandingPage';
import SignupPage from './pages/User/SignupPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import CardPage from './pages/Cards/CardPage';
import NotePage from './pages/Notes/NotePage';
import SingleNotePage from './pages/Notes/SingleNotePage';
import FlashCardDecksPage from './pages/FlashCardDecks/FlashCardDecksPage';
import FlashCardDeckPage from './pages/FlashCardDecks/FlashCardDeckPage';

function App() {
  return (
      <Router>
          <Routes>
              <Route path="/" element={<LandingPage />} />
              {/* <Route path="/login" element={<LoginPage />} /> */}
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/cards" element={<CardPage />} />
              <Route path="/notes" element={<NotePage/>} />
              <Route path="/notes/:id" element={<SingleNotePage />} />
              <Route path="/decks" element={<FlashCardDecksPage />} />
              <Route path="/decks/:deckId" element={<FlashCardDeckPage />} />
              {/* Default redirect if no route matches */}
              <Route path="*" element={<Navigate replace to="/" />} />
          </Routes>
      </Router>
  );
}

export default App;