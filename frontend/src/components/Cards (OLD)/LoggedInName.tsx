import { deleteToken } from "../../tokenStorage.tsx";

function LoggedInName()
{
    // Grab current user information
    let _ud : any = localStorage.getItem('user_data');
    let ud = JSON.parse( _ud );
    let firstName : string = ud.firstName;
    let lastName : string = ud.lastName;

    // Logout handler
    const doLogout = (event: React.MouseEvent<HTMLButtonElement>): void => {
        event.preventDefault();
        deleteToken();
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