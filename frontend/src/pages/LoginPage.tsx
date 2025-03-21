import PageTitle from '../components/PageTitle.tsx';
import Login from '../components/OLD_Login.tsx';
import MenuBar from '../components/MenuBar.tsx';

const LoginPage = () =>
{
    return(
        <div>
        <MenuBar />
        <PageTitle />
        <Login />
        </div>
    );
};

export default LoginPage;