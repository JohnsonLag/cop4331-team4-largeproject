import { useNavigate } from 'react-router-dom';

function MenuBar()
{
  const navigate = useNavigate();

  // Handle navigation
  const handleLogoClick = () => navigate('/');
  const handleNotesClick = () => navigate('/notes');
  const handleFlashcardsClick = () => navigate('/flashcards');
  const handleUserClick = () => {
    // Add logout or user info logic here
    console.log('User icon clicked');
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#4A4A4A', // Dark grey background
        padding: '10px 20px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Logo Section */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
        }}
        onClick={handleLogoClick}
      >
        <img
          src="/src/assets/clarity-logo.png" // Replace with your logo path
          alt="<>"
          style={{
            height: '40px',
            marginRight: '10px',
          }}
        />
        <span style={{
            color: '#FFFFFF', // White text
            fontSize: '1.5rem',
            fontWeight: 'bold',
          }}>
          Clarity
        </span>
      </div>

      {/* Navigation Buttons */}
      <div style={{
          display: 'flex',
          gap: '20px',
        }}>
        <button
          onClick={handleNotesClick}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#FFFFFF', // White text
            fontSize: '1rem',
            cursor: 'pointer',
          }}>
          Notes
        </button>
        <button
          onClick={handleFlashcardsClick}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#FFFFFF', // White text
            fontSize: '1rem',
            cursor: 'pointer',
          }}>
          Flashcards
        </button>
      </div>

      {/* User Info / Logout Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
        }}
        onClick={handleUserClick}
      >
        <img
          src="/path/to/user-icon.png" // Replace with your user icon path
          alt="User"
          style={{
            height: '30px',
            borderRadius: '50%',
            marginRight: '10px',
          }}
        />
        <span
          style={{
            color: '#FFFFFF', // White text
            fontSize: '1rem',
          }}
        >
          John Doe {/* Replace with dynamic user name */}
        </span>
      </div>
    </div>
  );
};

export default MenuBar;