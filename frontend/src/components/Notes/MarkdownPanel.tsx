interface MarkdownPanelProps {
    textAreaId: string;
	noteBody: string;
}

export function MarkdownPanel({textAreaId, noteBody} : MarkdownPanelProps)
{
	const buttonId : string = "sendNoteButton";
	const messageAreaId : string = "messageAreaId";
	const distJsFileName : string = "insert-markdown-panel.js";
	
	// // all
	// function loadAll(): void {
		// document.body.onload = function() {
			// loadCSS();
		// };
	// }
	
	// stylesheet
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
	
	// javascript
	function loadEasyMDE() : void {
		let script = document.createElement('script');
		script.src = "https://cdn.jsdelivr.net/npm/easymde@2.20.0/dist/easymde.min.js";
		document.head.append(script);
		
		script.onload = function() {
			loadEasyMDEInstance();
		};
	}
	
	// actual panel
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
	
	loadAll();
	
	const icons = Array.from(document.getElementsByClassName("editor-toolbar")[0].children);
	
	icons.forEach(icon => {
		icon.style.color= "green";
	});
	
	// function sendNoteToServer() : void {
		
	// }
	
    return(
        <div>
			<textarea id={textAreaId}>{noteBody}</textarea>
			<button id={buttonId}>Send note to server</button>
			<span id={messageAreaId}></span>
        </div>
    );
};

export default MarkdownPanel;