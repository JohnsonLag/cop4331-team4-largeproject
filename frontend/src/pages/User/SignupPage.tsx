import PageTitle from '../../components/PageTitle.tsx';
import MenuBar from '../../components/MenuBar.tsx';
import Signup from '../../components/User/Signup.tsx';

const SignupPage = () =>
{
    return(
        <div>
        <MenuBar />
        <PageTitle />
        <Signup />
        </div>
    );
};

export default SignupPage;