import React, { useState } from 'react';
import './page-styles.css';

function ResetPassword() {
    const app_name = 'coolestappever.xyz';
    function buildPath(route:string) : string
    {
        if (process.env.NODE_ENV != 'development')
        {
            return 'http://' + app_name + ':5000/' + route;
        }
        else
        {
            return 'http://localhost:5000/' + route;
        }
    }

    const [message,setMessage] = useState('');
    const [resetEmail,setResetEmail] = React.useState('');
    const [resetVerificationCode,setResetVerificationCode] = React.useState('');
    const [resetPassword,setPassword] = React.useState('');

    function handleSetResetEmail( e: any ) : void
    {
        setResetEmail( e.target.value );
    }

    function handleSetResetVerificationCode( e: any ) : void
    {
        setResetVerificationCode( e.target.value );
    }
       
    function handleSetPassword( e: any ) : void
    {
        setPassword( e.target.value );
    }

    async function doSubmitEmail(event:any) : Promise<void>
    {
        event.preventDefault();
        var obj = {email:resetEmail};
        var js = JSON.stringify(obj);
        try
        {
            const response = await fetch(buildPath('api/sendemail'),
                {method:'POST',body:js,headers:{'Content-Type':
                'application/json'}});
            var res = JSON.parse(await response.text());
            if( res.id <= 0 )
            {
                setMessage('Could not send email.');
            }
            else
            {
                setMessage('Please check your email for the verification code and enter it in the next box.');
            }
        }
        catch(error:any)
        {
            alert(error.toString());
            return;
        }
    };

    async function doSubmitVerificationCode(event:any) : Promise<void>
    {
        event.preventDefault();
        var obj = {email:resetEmail,verificationCode:resetVerificationCode};
        var js = JSON.stringify(obj);
        try
        {
            const response = await fetch(buildPath('api/checkverificationcode'),
                {method:'POST',body:js,headers:{'Content-Type':
                'application/json'}});
            var res = JSON.parse(await response.text());
            if( res.id <= 0 )
            {
                setMessage('Could not verify code.');
            }
            else
            {
                setMessage('Verification code matched. Please put the rest of your information below.');
            }
        }
        catch(error:any)
        {
            alert(error.toString());
            return;
        }
    };

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
                setMessage('Could not do reset.');
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
            <input type="text" id="resetVerificationCode" placeholder="VerificationCode" onChange={handleSetResetVerificationCode} />
            <input type="password" id="resetPassword" placeholder="Password" onChange={handleSetPassword} />
            <input type="submit" id="resetEmail" className="buttons" value = "Submit email" onClick={doSubmitEmail} disabled />
            <input type="submit" id="resetVerificationCode" className="buttons" value = "Submit verification code" onClick={doSubmitVerificationCode} disabled />
            <input type="submit" id="resetButton" className="buttons" value = "Reset password" onClick={doReset} disabled />
            <input type="submit" id="loginButton" className="buttons" value = "Go to login page" onClick={goToLoginPage} />
            <span id="resetResult">{message}</span>
        </div>
    );
};

export default ResetPassword;