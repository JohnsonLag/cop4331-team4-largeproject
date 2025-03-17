import { useJwt } from "react-jwt";
import { jwtDecode, JwtPayload } from 'jwt-decode';
import React, { useState } from 'react';
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

import './page-styles.css';
import { buildPath } from './Path.tsx';
import { retrieveToken, storeToken, Token } from "../tokenStorage.tsx";

function Login() {
    const [message,setMessage] = useState('');
    const [loginName,setLoginName] = React.useState('');
    const [loginPassword,setPassword] = React.useState('');

    interface LoginResponse {
        error: string;
        token: Token;
    }

    interface UserPayload extends JwtPayload {
        userId: string;
        firstName: string;
        lastName: string;
    }

    interface User {
        firstName: string;
        lastName: string;
        id: string;
    }

    function handleSetLoginName( e: any ) : void
    {
        setLoginName( e.target.value );
    }
    
    function handleSetPassword( e: any ) : void
    {
        setPassword( e.target.value );
    }

    async function doLogin(event:any) : Promise<void>
    {
        event.preventDefault();
		
		if (loginName === "" || loginPassword === "")
		{
			setMessage("All fields must be filled out.");
			return;
		}
		
        var obj = {login:loginName,password:loginPassword};
        var js = JSON.stringify(obj);

        // Set Axios request configuration
        const config: AxiosRequestConfig = {
            method: 'post',
            url: buildPath('api/login'),
            headers: {
                'Content-Type': 'application/json'
            },
            data: js
        };
        
        // Send axios request
        axios(config)
        .then(function (response: AxiosResponse<LoginResponse>) {
            const res = response.data;
            console.log(res);

            if (res.error) {
                console.log(res.error);
                setMessage('User/Password combination incorrect');
            } else {
                storeToken(res.token);
                const decodedUserData = jwtDecode(res.token.accessToken) as UserPayload;

                const userId = decodedUserData.userId;
                const firstName = decodedUserData.firstName;
                const lastName = decodedUserData.lastName;
    
                const user: User = { firstName: firstName, lastName: lastName, id: userId };
                localStorage.setItem('user_data', JSON.stringify(user));
                window.location.href = '/cards';
            }
        })
        .catch(function (error) {
            console.log(error);
        });
    };

    function goToSignupPage() : void
    {
        window.location.href = '/signup';
    };
	
    function goToResetPasswordPage() : void
    {
        window.location.href = '/reset-password';
    };

    return (
        <div className="inputAndButtonsDiv" id="loginDiv">
            <span id="inner-title">PLEASE LOG IN</span><br></br>
            <input type="text" id="loginName" placeholder="Username" onChange={handleSetLoginName} />
            <input type="password" id="loginPassword" placeholder="Password" onChange={handleSetPassword} />
			<br />
            <input type="submit" id="loginButton" className="buttons" value = "Login"
            onClick={doLogin} />
            <input type="submit" id="signupButton" className="buttons" value = "Signup"
            onClick={goToSignupPage} />
            <input type="submit" id="resetPasswordButton" className="buttons" value = "Reset password"
            onClick={goToResetPasswordPage} />
            <span id="loginResult">{message}</span>
        </div>
    );
};

export default Login;