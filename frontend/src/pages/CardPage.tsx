import PageTitle from '../components/PageTitle';
import LoggedInName from '../components/LoggedInName';
import CardUI from '../components/CardUI';
import MenuBar from '../components/MenuBar';

const CardPage = () =>
{
    return(
        <div>
        <MenuBar />
        <PageTitle />
        <LoggedInName />
        <CardUI />
        </div>
    );
}

export default CardPage;