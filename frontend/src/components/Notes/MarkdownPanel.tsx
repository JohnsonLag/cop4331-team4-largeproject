import { retrieveToken } from "../../tokenStorage.tsx";

interface MarkdownPanelProps {
    textAreaId: string;
	noteBody: string;
}

export function MarkdownPanel({textAreaId, noteBody} : MarkdownPanelProps)
{
	const buttonId : string = "sendNoteButton";
	const noteSearchResultId : string = "noteSearchResult";
	const tempLocationId : string = "tempLocationId";
	const noteTitleId : string = "noteTitleId";
	const distJsFileName : string = "insert-markdown-panel.js";
	
	// // all
	// function loadAll(): void {
		// document.body.onload = function() {
			// loadCSS();
		// };
	// }
	
	// Panel style sheet.
	// function loadCSS(): void {
	function loadAll(): void {
		let styles = document.createElement('link');
		styles.rel = "stylesheet";
		styles.href = "https://cdn.jsdelivr.net/npm/easymde@2.20.0/dist/easymde.min.css";
		// styles.crossOrigin = "anonymous";
		document.head.append(styles);
		
		styles.onload = function() {
			loadEasyMDE();
		};
	}
	
	// Panel source code.
	function loadEasyMDE() : void {
		let script = document.createElement('script');
		script.src = "https://cdn.jsdelivr.net/npm/easymde@2.20.0/dist/easymde.min.js";
		document.head.append(script);
		
		script.onload = function() {
			loadEasyMDEInstance();
		};
	}
	
	// The script that will insert the panel.
	function loadEasyMDEInstance() : void {
        let script = document.createElement('script');
		script.type = "module";
		script.crossOrigin = "anonymous";
		script.src = "/assets/" + distJsFileName;
		document.head.append(script);
		
		script.onerror = function() {
		console.log("Error loading " + this.src);
		};
    }
	
	
	function sendNoteToServer() : void {
		let noteSearchResult = document.getElementById(noteSearchResultId);
		noteSearchResult === null ? console.log("Sending note...") : noteSearchResult.textContent = "Sending note...";
		
		let requestNoteTitle : HTMLElement | null = document.getElementById(noteTitleId);
		let requestNoteBody : HTMLElement | null  = document.getElementById(tempLocationId);
		
		let requestNoteTitleText : string | null = "";
		let requestNoteBodyText : string | null = "";
		
		if (requestNoteTitle !== null && requestNoteBody !== null)
		{
			requestNoteTitleText = requestNoteTitle.textContent;
			requestNoteBodyText = requestNoteBody.textContent;
			
			let obj = { requestNoteTitleText: requestNoteTitleText, requestNoteBodyText: requestNoteBodyText, jwtToken: retrieveToken() };
			
			console.log(obj); // Delete later.
			
			// Send Axios config.
			// ...
			// ...
			// ...
			
			noteSearchResult === null ? console.log("Note sent!") : noteSearchResult.textContent = "Note sent!";
		}
		
		else {
			noteSearchResult === null ? console.log("Note title and/or note body is null. Could not send note.") : noteSearchResult.textContent = "Note title and/or note body is null. Could not send note.";
			return;
		}
	}
	
	loadAll();

    return(
        <div>
			<textarea id={textAreaId}>{noteBody}</textarea>
			<button id={buttonId} onClick={sendNoteToServer}>Send note to server</button>
			<div id={tempLocationId} style={{
				display: "none",
				}}></div>
        </div>
    );
};

export default MarkdownPanel;