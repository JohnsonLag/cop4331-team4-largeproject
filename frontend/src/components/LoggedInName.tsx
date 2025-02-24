function LoggedInName()
{
    var _ud = localStorage.getItem('user_data');
    // Null check for _ud
    if (!_ud) {
        // throw new Error("User data in localStorage is NULL");
        console.log("Error: UserData in localStorage is NULL");
        window.location.href = '/login';
        return null;
    }

    var ud = JSON.parse(_ud);
    var userId = ud.id;
    var firstName = ud.firstName;
    var lastName = ud.lastName;

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