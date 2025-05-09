const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.createToken = function ( fn, ln, id )
{
    return _createToken( fn, ln, id );
}

_createToken = function ( fn, ln, id )
{
    try
    {
        const expiration = new Date();
        const user = { userId:id, firstName:fn, lastName:ln };

        const accessToken = jwt.sign( user, process.env.ACCESS_TOKEN_SECRET);

        // In order to exoire with a value other than the default, use the
        // following
        /*
        const accessToken= jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '30m'} );
        '24h'
        '365d'
        */

        var return_val = { accessToken:accessToken };
    }
    catch (e)
    {
        var return_val = { error: e.message };

    }
    return return_val;
}

exports.createVerificationToken = function ( id )
{
    return _createVerificationToken(id);
}

_createVerificationToken = function ( id)
{
    try
    {
        tok = jwt.sign({ userId: id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        return { accessToken: tok };
    }
    catch (e) 
    {
        var return_val = { error: e.message };
        return return_val;
    }
}


exports.isExpired = function( token )
{
    var isError = jwt.verify( token, process.env.ACCESS_TOKEN_SECRET,
    (err, verifiedJwt) =>
    {
        if( err )
        {
            return true;
        }
        else
        {
            return false;
        }
    });
    return isError;
}

exports.refresh = function( token )
{
    var ud = jwt.decode(token,{complete:true});
    var userId = ud.payload.userId;
    var firstName = ud.payload.firstName;
    var lastName = ud.payload.lastName;
    return _createToken( firstName, lastName, userId );
}