import React, { useState } from 'react';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';
import { buildPath } from '../Path';

interface ForgotPasswordResponse {
    message: string;
}

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    async function submitForm(event:any) : Promise<void>
    {
        event.preventDefault();
		
        var obj = { email: email };
        var js = JSON.stringify(obj);

        // Set Axios request configuration
        const config: AxiosRequestConfig = {
            method: 'post',
            url: buildPath('api/forgot_password'),
            headers: {
                'Content-Type': 'application/json'
            },
            data: js
        };
        
        // Send axios request
        axios(config)
        .then(function (response: AxiosResponse<ForgotPasswordResponse>) {
            const res = response.data;
            console.log(res);

            setMessage(res.message);
            setTimeout(() => navigate('/login'), 3000);
        })
        .catch(function (error) {
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || 'Error sending reset email');
            } else {
            setError('An unexpected error occurred');
            }
        });
    };

    return (
    <div>
        <h2>Forgot Password</h2>
        {message && (
        <div>
            {message}
        </div>
        )}
        {error && (
        <div>
            {error}
        </div>
        )}
        <form onSubmit={submitForm}>
        <div>
            <label htmlFor="email">
            Email Address
            </label>
            <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            />
        </div>
        <button
            type="submit"
            disabled={isLoading}
        >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
        </button>
        </form>
    </div>
    );
};

export default ForgotPassword;