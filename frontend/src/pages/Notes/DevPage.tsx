// Purposes:
//		Creates the note body from the string[] response, which I think TEMP_SingleNoteView.tsx will do.
//		Passes the textAreaId to the components.

import MarkdownPanel from '../../components/Notes/MarkdownPanel.tsx';

const DevPage = () =>
{
	const passedTextAreaId = "textAreaId";
	let body : string[] = ["hello\n", "world\n", "!\n"];
	let returnedText : string = "";
	
	let i : number = 0;
	let len : number = body.length;
	
	// concatenate.
	for (i = 0; i < len; i++){
		returnedText += body.at(i);
	}
			
    return(
        <div>
			<MarkdownPanel textAreaId={passedTextAreaId} noteBody={returnedText}/>
        </div>
    );
}

export default DevPage;