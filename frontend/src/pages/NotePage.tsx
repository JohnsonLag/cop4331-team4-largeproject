import MenuBar from '../components/MenuBar';
import AddNote from '../components/TEMP_AddNote';
import SearchNotes from '../components/SearchNotes';

const CardPage = () =>
{
    return(
        <div>
        <MenuBar />
        <SearchNotes />
        <AddNote/>
        </div>
    );
}

export default CardPage;