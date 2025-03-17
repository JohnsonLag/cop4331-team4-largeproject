import { storeToken, retrieveToken, deleteToken, getUserIdFromToken, getFirstNameFromToken, getLastNameFromToken } from "../tokenStorage.tsx";

function LoggedInName()
{
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
        window.location.href = '/login';
        return null;
    }

    // Logout handler
    const doLogout = (event: React.MouseEvent<HTMLButtonElement>): void => {
        event.preventDefault();
        deleteToken();
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