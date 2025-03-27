const textAreaId = "textAreaId";
const buttonId = "sendNoteButton";
const button = document.getElementById(buttonId);

const mdp = new EasyMDE({
	element: document.getElementById(textAreaId),
	lineNumbers: true,
	lineWrapping: true,
});

const mytext = document.getElementById(textAreaId).innerText;


function showValue() {
	console.log(mdp.value());
}

mdp.value(mytext);
button.addEventListener('click', showValue);