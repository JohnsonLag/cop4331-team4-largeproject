import React, { useState } from 'react';
import './page-styles.css';

function Signup() {
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
    const [signupEmail,setSignupEmail] = React.useState('');
    const [signupVerificationCode,setSignupVerificationCode] = React.useState('');
    const [signupName,setSignupName] = React.useState('');
    const [signupFirstName,setSignupFirstName] = React.useState('');
    const [signupLastName,setSignupLastName] = React.useState('');
    const [signupPassword,setPassword] = React.useState('');


    function handleSetSignupEmail( e: any ) : void
    {
        setSignupEmail( e.target.value );
    }

    function handleSetSignupVerificationCode( e: any ) : void
    {
        setSignupVerificationCode( e.target.value );
    }
    
	function handleSetSignupName( e: any ) : void
    {
        setSignupName( e.target.value );
    }

	function handleSetSignupFirstName( e: any ) : void
    {
        setSignupFirstName( e.target.value );
    }
    
	function handleSetSignupLastName( e: any ) : void
    {
        setSignupLastName( e.target.value );
    }
     
    function handleSetPassword( e: any ) : void
    {
        setPassword( e.target.value );
    }

    async function doSubmitEmail(event:any) : Promise<void>
    {
        event.preventDefault();		
        var obj = {email:signupEmail};
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
        var obj = {email:signupEmail,verificationCode:signupVerificationCode};
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

    async function doSignup(event:any) : Promise<void>
    {
        event.preventDefault();
		
		if (signupName === "" || signupPassword === "" || signupFirstName === "" || signupLastName === "" || signupEmail === "")
		{
			setMessage("All fields must be filled out.");
			return;
		}
		
        var obj = {login:signupName,password:signupPassword,firstName:signupFirstName,lastName:signupLastName,email:signupEmail};
        var js = JSON.stringify(obj);
        try
        {
            const response = await fetch(buildPath('api/signup'),
                {method:'POST',body:js,headers:{'Content-Type':
                'application/json'}});
            var res = JSON.parse(await response.text());
            if( res.id <= 0 )
            {
                setMessage('Could not do signup, error: ' + res.error);
            }
            else
            {
                setMessage('Signup successful. Go back to the login page to login.');
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
        <div className="inputAndButtonsDiv" id="signupDiv">
            <span id="inner-title">PLEASE SIGN UP</span><br></br>
            <input type="text" id="signupEmail" placeholder="Email" onChange={handleSetSignupEmail} />
            <input type="text" id="signupVerificationCode" placeholder="VerificationCode" onChange={handleSetSignupVerificationCode} />
            <input type="text" id="signupName" placeholder="Username" onChange={handleSetSignupName} />
            <input type="text" id="signupFirstName" placeholder="First Name" onChange={handleSetSignupFirstName} />
            <input type="text" id="signupLastName" placeholder="Last Name" onChange={handleSetSignupLastName} />
            <input type="password" id="signupPassword" placeholder="Password" onChange={handleSetPassword} />
			<br />
            <input type="submit" id="signupEmail" className="buttons" value = "Submit email" onClick={doSubmitEmail} disabled />
            <input type="submit" id="signupVerificationCode" className="buttons" value = "Submit verification code" onClick={doSubmitVerificationCode} disabled />
            <input type="submit" id="signupButton" className="buttons" value = "Signup" onClick={doSignup} />
            <input type="submit" id="loginButton" className="buttons" value = "Go to login page" onClick={goToLoginPage} />
            <span id="signupResult">{message}</span>
        </div>
    );
};

export default Signup;