import React, { useState } from 'react';

import '../page-styles.css';
import { buildPath } from "../Path.tsx"
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

function Signup() {
    const [message,setMessage] = useState('');
    const [signupEmail,setSignupEmail] = React.useState('');
    const [signupName,setSignupName] = React.useState('');
    const [signupFirstName,setSignupFirstName] = React.useState('');
    const [signupLastName,setSignupLastName] = React.useState('');
    const [signupPassword,setPassword] = React.useState('');

    interface SignUpResponse {
        userId: number;
        firstName: string;
        lastName: string;
        error: string;
    }


    function handleSetSignupEmail( e: any ) : void
    {
        setSignupEmail( e.target.value );
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

	async function doSignup(event:any) : Promise<void>
    {
        event.preventDefault();
		
		if (signupName === "" || signupPassword === "" || signupFirstName === "" || signupLastName === "" || signupEmail === "")
		{
			setMessage("All fields must be filled out.");
			return;
		}
		
        var obj = { 
            login:signupName, 
            password:signupPassword, 
            firstName:signupFirstName, 
            lastName:signupLastName, 
            email:signupEmail
        };
        var js = JSON.stringify(obj);

        // Set Axios request configuration
        const config: AxiosRequestConfig = {
            method: 'post',
            url: buildPath('api/signup'),
            headers: {
                'Content-Type': 'application/json'
            },
            data: js
        };
        
        // Send axios request
        axios(config)
        .then(function (response: AxiosResponse<SignUpResponse>) {
            const res = response.data;
            if (res.userId <= 0 || res.error != '') {
                setMessage('Unable to register new user. ' + res.error);
            } else {
                setMessage('Sign up successful. Please go back to the login page to login')
            }
        })
        .catch(function (error) {
            alert(error.toString());
            return;
        });
    };

    function goToLoginPage() : void
    {
        window.location.href = '/';
    };

    return (
        <div className="inputAndButtonsDiv" id="signupDiv">
            <span id="inner-title">PLEASE SIGN UP</span><br></br>
            <input type="text" id="signupEmail" placeholder="Email" onChange={handleSetSignupEmail} />
            <input type="text" id="signupName" placeholder="Username" onChange={handleSetSignupName} />
            <input type="text" id="signupFirstName" placeholder="First Name" onChange={handleSetSignupFirstName} />
            <input type="text" id="signupLastName" placeholder="Last Name" onChange={handleSetSignupLastName} />
            <input type="password" id="signupPassword" placeholder="Password" onChange={handleSetPassword} />
			<br />
            <input type="submit" id="signupButton" className="buttons" value = "Signup" onClick={doSignup} />
            <input type="submit" id="loginButton" className="buttons" value = "Go to login page" onClick={goToLoginPage} />
            <span id="signupResult">{message}</span>
        </div>
    );
};

export default Signup;