import React, { useEffect, useState } from 'react';

import '../page-styles.css';
import { buildPath } from "../Path.tsx";
import { useSearchParams } from 'react-router-dom';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

interface TokenVerificationResponse {
  error: string;
  valid: boolean;
}

function ResetPassword() {
    const [message,setMessage] = useState('');
    const [error, setError] = useState<string>('');
    const [validToken, setValidToken] = useState<boolean>(false);
    const [resetEmail,setResetEmail] = React.useState('');
    const [resetPassword,setPassword] = React.useState('');

    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    useEffect(() => {
      const verifyToken = async () => {
          var obj = { token: token };
          var js = JSON.stringify(obj);
          
          // Set Axios request configuration
          const config: AxiosRequestConfig = {
              method: 'post',
              url: buildPath('api/verify_reset_token'),
              headers: {
                  'Content-Type': 'application/json'
              },
              data: js
          };

          // Send axios request
          axios(config)
          .then(function (response: AxiosResponse<TokenVerificationResponse>) {
              const res = response.data;

              if (res.valid) {
                  setValidToken(true);
              }
          })
          .catch(function (error) {
              console.log(error);
          });
      };

      if (token) {
          verifyToken();
      } else {
          setError('No token provided');
          setValidToken(false);
      }
    }, [token]);

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
            const response = await fetch(buildPath('api/reset_password'),
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

    if (!validToken) {
        return (
            <div>
            <h2>Reset Password</h2>
            <div>
                {error || 'Invalid reset token'}
            </div>
            </div>
        );
    }

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
              Reset Password
            </h3>
            <form onSubmit={doReset}>
      
              {/* Email */}
              <div className="mb-3">
                <label className="form-label" style={{ color: '#4A4A4A' }}>
                  Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="resetEmail"
                  placeholder="Enter your email"
                  onChange={handleSetResetEmail}
                  required
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#D3D3D3' }}
                />
              </div>
      
              {/* New Password */}
              <div className="mb-3">
                <label className="form-label" style={{ color: '#4A4A4A' }}>
                  New Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="resetPassword"
                  placeholder="Enter new password"
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
                  Reset Password
                </button>
                <span id="resetResult">{message}</span>
              </div>
      
              {/* Back to Login */}
              <div className="text-center mt-3">
                <p className="mb-0" style={{ color: '#4A4A4A' }}>
                  Remembered your password?{' '}
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

export default ResetPassword;
function setValidToken(arg0: boolean) {
  throw new Error('Function not implemented.');
}

