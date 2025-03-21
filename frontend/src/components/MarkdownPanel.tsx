var SimpleMDE = require("../../simplemde/simplemde.js");
require("../../simplemde/simplemde.css");

function MarkdownPanel({text, id}) {
    var simplemde = new SimpleMDE();
	simplemde.value({text});
	panelId = "markdown-panel-" + id;
	
	return (
        <p id={panelId}>
			{simplemde}
		</p>
    );
};

export default MarkdownPanel;