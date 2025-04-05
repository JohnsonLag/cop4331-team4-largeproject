const app_name = 'coolestappever.xyz';

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

module.exports = generatePath