const textAreaId = "textAreaId";
const tempLocationId = "tempLocationId";
const buttonId = "sendNoteButton";
const button = document.getElementById(buttonId);

// Create Markdown panel.
const mdp = new EasyMDE({
	element: document.getElementById(textAreaId),
	lineNumbers: true,
	lineWrapping: true,
	hideIcons: ["image", "upload-image"],
});

// Insert the text into the panel.
const mytext = document.getElementById(textAreaId).innerText;
mdp.value(mytext);

// Store value in a temporary location that will later be used.
function sendToTempLocation() {
	console.log(mdp.value());
	
	document.getElementById(tempLocationId).textContent = mdp.value();
	
}

button.addEventListener('click', sendToTempLocation);

// Change the icon colors.
const icons = Array.from(document.getElementsByClassName("editor-toolbar")[0].children);
	
icons.forEach(icon => {
	icon.style.color= "blue";
});

// Text alignment.
document.getElementsByClassName("CodeMirror")[0].style.textAlign="left";
document.getElementsByClassName("editor-preview-side")[0].style.textAlign="left";