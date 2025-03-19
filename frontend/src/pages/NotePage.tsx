import PageTitle from '../components/PageTitle';
import LoggedInName from '../components/LoggedInName';
import AddNote from '../components/TEMP_AddNote';

const CardPage = () =>
{
    return(
        <div>
        <PageTitle />
        <LoggedInName />
        <AddNote/>
        </div>
    );
}

export default CardPage;