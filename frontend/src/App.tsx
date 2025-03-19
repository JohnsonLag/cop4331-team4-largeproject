import { BrowserRouter as Router, Route, Navigate, Routes } from 'react-router-dom';
import './App.css';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import CardPage from './pages/CardPage';
import NotePage from './pages/NotePage';

function App() {
  return (
      <Router>
          <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/cards" element={<CardPage />} />
              <Route path="/notes" element={<NotePage/>} />
              {/* Default redirect if no route matches */}
              <Route path="*" element={<Navigate replace to="/" />} />
          </Routes>
      </Router>
  );
}

export default App;