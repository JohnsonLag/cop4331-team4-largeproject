import { useNavigate } from 'react-router-dom';
import { deleteToken } from "../tokenStorage.tsx";

function MenuBar()
{
    // Grab current user information
    let _ud : any = localStorage.getItem('user_data');
    let ud = JSON.parse( _ud );
    let firstName = "";
    if (ud)
    {
        firstName = ud.firstName;
    }

    // Logout handler
    const doLogout = (event: React.MouseEvent<HTMLButtonElement>): void => {
        event.preventDefault();
        deleteToken();
        localStorage.removeItem("user_data");
        window.location.href = '/';
    };
    

    const navigate = useNavigate();

    // Handle navigation
    const handleLogoClick = () => navigate('/');
    const handleNotesClick = () => navigate('/notes');
    const handleFlashcardsClick = () => navigate('/cards');

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
        {/* Left section */}
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px', // Space between logo, title, and buttons
            }}
        >
            {/* Logo */}
            <div
            style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
            }}
            onClick={handleLogoClick}
            >
            <img
                src="/src/assets/clarity-logo.png"
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

            {/* Pages */}
            {ud && ( // ONLY RENDER IF USER IS LOGGED IN
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
            )}
        </div>

        {/* Right section */}
        { ud && (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px', // Space between logo, title, and buttons
                }}
            >
                {/* User Info / Logout Button */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                    }}>
                    <span
                        style={{
                        color: '#FFFFFF', // White text
                        fontSize: '1rem',
                        }}>
                        Welcome {firstName}
                    </span>
                </div>
                <button type="button" id="logoutButton" className="buttons" onClick={doLogout}> Log Out </button>
            </div>
        )}
    </div>
    );
};

export default MenuBar;