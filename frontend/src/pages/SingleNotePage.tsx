import PageTitle from '../components/PageTitle';
import LoggedInName from '../components/LoggedInName';
import SingleNoteView from '../components/TEMP_SingleNoteView';

const CardPage = () =>
{
    return(
        <div>
        <PageTitle />
        <LoggedInName />
        <SingleNoteView/>
        </div>
    );
}

export default CardPage;