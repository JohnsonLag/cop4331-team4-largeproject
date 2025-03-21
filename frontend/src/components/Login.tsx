import { useState } from 'react';
import { storeToken, Token } from '../tokenStorage';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { buildPath } from './Path';
import { jwtDecode, JwtPayload } from 'jwt-decode';

function Login() 
{
    // const navigate = useNavigate();

    // State for form inputs
    const [message,setMessage] = useState('');
    const [login, setLogin] = useState<string>('');
    const [password, setPassword] = useState<string>('');

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

    async function submitForm(event:any) : Promise<void>
    {
        event.preventDefault();
		
		if (login === "" || password === "")
		{
			setMessage("All fields must be filled out.");
			return;
		}
		
        var obj = { login: login, password: password };
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

    return (
    <div className="card shadow-md" style={
        { backgroundColor: '#F5F5F5', border: 'none', width: '100%', maxWidth: '400px' }}>
        <div className="card-body p-4">
        <h3 className="card-title text-center mb-3" style={{ color: '#4A4A4A' }}>
            Login
        </h3>
        <form onSubmit={submitForm}>
            {/* Login Input */}
            <div className="mb-3">
            <label className="form-label" style={{ color: '#4A4A4A' }}>
                Username
            </label>
            <input
                type="text"
                className="form-control"
                id="login"
                placeholder="Enter your username"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
                style={{ backgroundColor: '#FFFFFF', borderColor: '#D3D3D3' }}
            />
            </div>

            {/* Password Input */}
            <div className="mb-3">
            <label htmlFor="password" className="form-label" style={{ color: '#4A4A4A' }}>
                Password
            </label>
            <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                Login
            </button>
            <span id="loginResult">{message}</span>
            </div>

            {/* Sign Up Link */}
            <div className="text-center mt-3">
            <p className="mb-0" style={{ color: '#4A4A4A' }}>
                Don't have an account?{' '}
                <a href="/signup" className="text-decoration-none" style={{ color: '#7E24B9' }}>
                Sign up
                </a>
            </p>
            </div>
        </form>
        </div>
    </div>
    );
};

export default Login;