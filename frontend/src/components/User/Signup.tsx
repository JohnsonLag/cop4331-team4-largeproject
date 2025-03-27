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
	  <div className="card shadow-md" style={{
	    backgroundColor: '#F5F5F5',
	    border: 'none',
	    width: '100%',
	    maxWidth: '400px',
	    margin: 'auto',
	  }}>
	    <div className="card-body p-4">
	      <h3 className="card-title text-center mb-3" style={{ color: '#4A4A4A' }}>
	        Sign Up
	      </h3>
	      <form onSubmit={doSignup}>
	
	        {/* Email */}
	        <div className="mb-3">
	          <label className="form-label" style={{ color: '#4A4A4A' }}>
	            Email
	          </label>
	          <input
	            type="email"
	            className="form-control"
	            id="signupEmail"
	            placeholder="Enter your email"
	            onChange={handleSetSignupEmail}
	            required
	            style={{ backgroundColor: '#FFFFFF', borderColor: '#D3D3D3' }}
	          />
	        </div>
	
	        {/* Username */}
	        <div className="mb-3">
	          <label className="form-label" style={{ color: '#4A4A4A' }}>
	            Username
	          </label>
	          <input
	            type="text"
	            className="form-control"
	            id="signupName"
	            placeholder="Choose a username"
	            onChange={handleSetSignupName}
	            required
	            style={{ backgroundColor: '#FFFFFF', borderColor: '#D3D3D3' }}
	          />
	        </div>
	
	        {/* First Name */}
	        <div className="mb-3">
	          <label className="form-label" style={{ color: '#4A4A4A' }}>
	            First Name
	          </label>
	          <input
	            type="text"
	            className="form-control"
	            id="signupFirstName"
	            placeholder="Enter your first name"
	            onChange={handleSetSignupFirstName}
	            required
	            style={{ backgroundColor: '#FFFFFF', borderColor: '#D3D3D3' }}
	          />
	        </div>
	
	        {/* Last Name */}
	        <div className="mb-3">
	          <label className="form-label" style={{ color: '#4A4A4A' }}>
	            Last Name
	          </label>
	          <input
	            type="text"
	            className="form-control"
	            id="signupLastName"
	            placeholder="Enter your last name"
	            onChange={handleSetSignupLastName}
	            required
	            style={{ backgroundColor: '#FFFFFF', borderColor: '#D3D3D3' }}
	          />
	        </div>
	
	        {/* Password */}
	        <div className="mb-3">
	          <label className="form-label" style={{ color: '#4A4A4A' }}>
	            Password
	          </label>
	          <input
	            type="password"
	            className="form-control"
	            id="signupPassword"
	            placeholder="Enter your password"
	            onChange={handleSetPassword}
	            required
	            style={{ backgroundColor: '#FFFFFF', borderColor: '#D3D3D3' }}
	          />
	        </div>
	
	        {/* Submit Button */}
	        <div className="d-grid">
	          <button
	            type="submit"
	            className="btn"
	            style={{
	              backgroundColor: '#7E24B9',
	              color: '#FFFFFF',
	              border: 'none',
	              transition: 'background-color 0.3s',
	            }}
	            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#5E1D8C')}
	            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#7E24B9')}
	          >
	            Signup
	          </button>
	          <span id="signupResult">{message}</span>
	        </div>
	
	        {/* Back to Login */}
	        <div className="text-center mt-3">
	          <p className="mb-0" style={{ color: '#4A4A4A' }}>
	            Already have an account?{' '}
	            <a href="/" className="text-decoration-none" style={{ color: '#7E24B9' }}>
	              Login
	            </a>
	          </p>
	        </div>
	
	      </form>
	    </div>
	  </div>
	);
};

export default Signup;
