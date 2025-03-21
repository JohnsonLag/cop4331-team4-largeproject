import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() 
{
    const navigate = useNavigate();

    // State for form inputs
    const [login, setLogin] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    // Handle form submission
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        // Add your login logic here (e.g., API call, validation)
        console.log('Username:', login);
        console.log('Password:', password);

        // Redirect to the dashboard or home page after login
        navigate('/dashboard');
    };

    return (
    <div className="card shadow-md" style={
        { backgroundColor: '#F5F5F5', border: 'none', width: '100%', maxWidth: '400px' }}>
        <div className="card-body p-4">
        <h3 className="card-title text-center mb-3" style={{ color: '#4A4A4A' }}>
            Login
        </h3>
        <form onSubmit={handleSubmit}>
            {/* Login Input */}
            <div className="mb-3">
            <label className="form-label" style={{ color: '#4A4A4A' }}>
                Username
            </label>
            <input
                type="login"
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