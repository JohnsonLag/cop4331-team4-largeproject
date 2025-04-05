const app_name = 'coolestappever.xyz';

function generateEmailPath(route)
{
    if (process.env.NODE_ENV != 'development')
    {
        return 'http://' + app_name + '/' + route;
    }
    else
    {
        return 'http://localhost:5173/' + route;
    }
}

function generatePath(route)
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

module.exports = { generatePath, generateEmailPath }