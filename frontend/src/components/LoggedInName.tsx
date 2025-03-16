import { storeToken, retrieveToken, getUserIdFromToken, getFirstNameFromToken, getLastNameFromToken } from "../tokenStorage.tsx";

function LoggedInName()
{
    // var _ud = localStorage.getItem('user_data');
    // // Null check for _ud
    // if (!_ud) {
    //     // throw new Error("User data in localStorage is NULL");
    //     console.log("Error: UserData in localStorage is NULL");
    //     window.location.href = '/login';
    //     return null;
    // }

    // var ud = JSON.parse(_ud);
    // var firstName = ud.firstName;
    // var lastName = ud.lastName;

    // Grab current token and user information
    let currentToken = retrieveToken();
    let userId : number = -1;
    let firstName : string = '';
    let lastName : string = '';
    if (currentToken)
    {
        userId = getUserIdFromToken(currentToken);
        firstName = getFirstNameFromToken(currentToken);
        lastName = getLastNameFromToken(currentToken);
    }
    else
    {
        console.log("NO VALID TOKEN FOUND. USERID CAN NOT BE DETERMINED")
        // TODO: redirect back to login if no token found
    }

    // Logout handler
    const doLogout = (event: React.MouseEvent<HTMLButtonElement>): void => {
        event.preventDefault();
        localStorage.removeItem("user_data");
        window.location.href = '/';
    };

    return(
        <div id="loggedInDiv">
            <span id="userName">Logged In As {firstName} {lastName}</span><br />
            <button type="button" id="logoutButton" className="buttons" onClick={doLogout}> Log Out </button>
        </div>
    );
};

export default LoggedInName;