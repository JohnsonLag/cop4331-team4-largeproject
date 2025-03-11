import React, { useState } from 'react';

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
    const [signupName,setSignupName] = React.useState('');
    const [signupPassword,setPassword] = React.useState('');

    function handleSetSignupName( e: any ) : void
    {
        setSignupName( e.target.value );
    }
    
    function handleSetPassword( e: any ) : void
    {
        setPassword( e.target.value );
    }

    async function doSignup(event:any) : Promise<void>
    {
        event.preventDefault();
        var obj = {signup:signupName,password:signupPassword};
        var js = JSON.stringify(obj);
        try
        {
            const response = await fetch(buildPath('api/signup'),
                {method:'POST',body:js,headers:{'Content-Type':
                'application/json'}});
            var res = JSON.parse(await response.text());
            if( res.id <= 0 )
            {
                setMessage('Could not do signup.');
            }
            else
            {
                // var user = {firstName:res.firstName,lastName:res.lastName,id:res.id}
                // localStorage.setItem('user_data', JSON.stringify(user));
                setMessage('Please check your email for confirmation and go back to the login page.');
                // window.location.href = '/login';
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
        <div id="signupDiv">
            <span id="inner-title">PLEASE SIGN UP</span><br></br>
            <input type="text" id="signupName" placeholder="Username" onChange={handleSetSignupName} />
            <input type="password" id="signupPassword" placeholder="Password" onChange={handleSetPassword} />
            <input type="submit" id="signupButton" className="buttons" value = "Signup"
            onClick={doSignup} />
            <input type="submit" id="loginButton" className="buttons" value = "Login"
            onClick={goToLoginPage} />
            <span id="signupResult">{message}</span>
        </div>
    );
};

export default Signup;