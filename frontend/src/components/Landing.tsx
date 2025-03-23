import Login from "./User/Login";

function Landing()
{
    // Grab current user information
    let _ud : any = localStorage.getItem('user_data');
    let ud = JSON.parse( _ud );
  
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        

        {/* Left Section: Login section, uses login component */}
        {/* ( Only displays if ud != null ) */}
        {/* { firstName && ( */}
        <div
          style={{
            flex: 45,
            backgroundColor: '#FFFFF', // Background : White
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}
        >
            { !ud && (
              < Login />
            )}
        </div>

        {/* Right Section: Soft Lavender Background with Diagonal Slant */}
        {/* Holds Logo, Title, and Description */}
        <div
          style={{
            flex: 55,
            backgroundColor: '#E6E1F5', // Soft Lavender
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            // Diagonal slant to the left on the left side of the bg
            clipPath: 'polygon(5% 0, 100% 0, 100% 100%, 0% 100%)',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              height: '500px',
            }}
          >
            <img
              src="images/clarity-logo.png" // Logo
              alt="Clarity Logo"
              style={{
                height: '175px', // Adjust size as needed
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
              Welcome to Clarity
            </h1>
            <p
              style={{
                color: '#4A4A4A', // Dark Grey
                fontSize: '1.2rem',
                maxWidth: '400px',
                lineHeight: '1.5',
                padding: "30px 0px 0px 0px"
              }}
            >
              Your go-to app for organizing notes and flashcards with built-in LLM integration.
            </p>
            <br />
            <p
              style={{
                color: '#4A4A4A', // Dark Grey
                fontSize: '2rem',
                maxWidth: '400px',
                lineHeight: '1.5',
              }}
            >
              Stay focused, stay clear.
            </p>
          </div>
        </div>
      </div>
    );
};

export default Landing;