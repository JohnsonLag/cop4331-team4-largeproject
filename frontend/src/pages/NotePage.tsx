import PageTitle from '../components/PageTitle';
import LoggedInName from '../components/LoggedInName';
import AddNote from '../components/TEMP_AddNote';
import SearchNotes from '../components/TEMP_SearchNotes';

const CardPage = () =>
{
    return(
        <div>
        <PageTitle />
        <LoggedInName />
        <SearchNotes />
        <AddNote/>
        </div>
    );
}

export default CardPage;