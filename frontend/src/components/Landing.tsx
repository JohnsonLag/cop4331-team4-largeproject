import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  // Handle navigation
  const handleLoginClick = () => navigate('/login');
  const handleSignUpClick = () => navigate('/signup');

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* Left Section: Light Grey Background with Diagonal Slant */}
      <div
        style={{
          flex: 1,
          backgroundColor: '#F5F5F5', // Light Grey
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          clipPath: 'polygon(0 0, 85% 0, 100% 100%, 0% 100%)', // Diagonal slant to the right
        }}
      >
        <div
          style={{
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              color: '#4A4A4A', // Dark Grey
              fontSize: '2.5rem',
              marginBottom: '20px',
            }}
          >
            Welcome to Clarity
          </h1>
          <button
            onClick={handleLoginClick}
            style={{
              backgroundColor: '#7E24B9', // Logo Purple
              color: '#FFFFFF', // White text
              border: 'none',
              padding: '10px 20px',
              fontSize: '1rem',
              cursor: 'pointer',
              borderRadius: '5px',
              margin: '10px',
              transition: 'background-color 0.3s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#5E1D8C')} // Darker Purple on hover
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#7E24B9')}
          >
            Login
          </button>
          <button
            onClick={handleSignUpClick}
            style={{
              backgroundColor: '#7E24B9', // Logo Purple
              color: '#FFFFFF', // White text
              border: 'none',
              padding: '10px 20px',
              fontSize: '1rem',
              cursor: 'pointer',
              borderRadius: '5px',
              margin: '10px',
              transition: 'background-color 0.3s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#5E1D8C')} // Darker Purple on hover
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#7E24B9')}
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Right Section: Soft Lavender Background with Diagonal Slant */}
      <div
        style={{
          flex: 1,
          backgroundColor: '#E6E1F5', // Soft Lavender
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)', // Diagonal slant to the left
        }}
      >
        <div
          style={{
            textAlign: 'center',
          }}
        >
          <img
            src="/path/to/logo.png" // Replace with your logo path
            alt="Clarity Logo"
            style={{
              height: '150px', // Adjust size as needed
              marginBottom: '20px',
            }}
          />
          <h1
            style={{
              color: '#4A4A4A', // Dark Grey
              fontSize: '2.5rem',
              marginBottom: '10px',
            }}
          >
            Clarity
          </h1>
          <p
            style={{
              color: '#4A4A4A', // Dark Grey
              fontSize: '1.2rem',
              maxWidth: '400px',
              lineHeight: '1.5',
            }}
          >
            Your go-to app for organizing notes and flashcards. Stay focused, stay clear.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;