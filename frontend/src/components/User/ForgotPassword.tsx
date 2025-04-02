import React, { useState } from 'react';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';
import { buildPath } from '../Path';

interface ForgotPasswordResponse {
    message: string;
}

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);   
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

            setMessageType("success");
            setMessage(res.message);
            setTimeout(() => navigate('/login'), 3000);
        })
        .catch(function (error) {
            if (axios.isAxiosError(error)) {
                setMessageType("error");
                setMessage(error.response?.data?.message || 'Error sending reset email');
            } else {
                setMessageType("error");
                setMessage('An unexpected error occurred');
            }
        });
    };


    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div className="card shadow-md" style={
                { backgroundColor: '#F5F5F5', border: 'none', width: '100%', maxWidth: '400px' }}
            >
                <div className="card-body p-4">
                    <h3 className="card-title text-center mb-3" style={{ color: '#4A4A4A' }}>
                        Reset your password
                    </h3>

                    {/* Message */}
                    {message && (
                        <div
                            className="alert mt-4"
                            role="alert"
                            style={{
                                backgroundColor: messageType === 'success' ? '#D4EDDA' : '#F8D7DA', // Green for success, red for error
                                color: messageType === 'success' ? '#155724' : '#721C24', // Dark green for success, dark red for error
                                borderColor: messageType === 'success' ? '#C3E6CB' : '#F5C6CB', // Light green for success, light red for error
                            }}
                        >
                            {message}
                        </div>
                    )}
                        
                    <form onSubmit={submitForm}>
                        {/* Forgot password Input */}
                        <div className="mb-3">
                        <label className="form-label" style={{ color: '#4A4A4A' }}>
                            Email
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="login"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                            Submit
                        </button>
                        </div>
            
                    </form>
                </div>
            </div>
        </div>
    );

};

export default ForgotPassword;