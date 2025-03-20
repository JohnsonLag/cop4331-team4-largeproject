import React, { useState } from 'react';

import './page-styles.css';
import { buildPath } from "./Path.tsx";

function ResetPassword() {
    const [message,setMessage] = useState('');
    const [resetEmail,setResetEmail] = React.useState('');
    const [resetPassword,setPassword] = React.useState('');

    function handleSetResetEmail( e: any ) : void
    {
        setResetEmail( e.target.value );
    }

    function handleSetPassword( e: any ) : void
    {
        setPassword( e.target.value );
    }

    async function doReset(event:any) : Promise<void>
    {
        event.preventDefault();
        var obj = {email:resetEmail,password:resetPassword};
        var js = JSON.stringify(obj);
        try
        {
            const response = await fetch(buildPath('api/resetpassword'),
                {method:'POST',body:js,headers:{'Content-Type':
                'application/json'}});
            var res = JSON.parse(await response.text());
            if( res.id <= 0 )
            {
                setMessage('Could not do reset, or error: ' + res.error);
            }
            else
            {
                setMessage('Reset successful. Go back to the login page to login.');
            }
        }
        catch(error:any)
        {
            alert(error.toString());
            return;
        }
    };

    function goToLoginPage() : void
    {
        window.location.href = '/';
    };

    return (
        <div className="inputAndButtonsDiv" id="resetDiv">
            <span id="inner-title">PLEASE SIGN UP</span><br></br>
            <input type="text" id="resetEmail" placeholder="Email" onChange={handleSetResetEmail} />
            <input type="password" id="resetPassword" placeholder="New Password" onChange={handleSetPassword} />
			<br />
            <input type="submit" id="resetButton" className="buttons" value = "Reset password" onClick={doReset} />
            <input type="submit" id="loginButton" className="buttons" value = "Go to login page" onClick={goToLoginPage} />
            <span id="resetResult">{message}</span>
        </div>
    );
};

export default ResetPassword;