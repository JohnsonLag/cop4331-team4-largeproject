import { useEffect, useRef, useState } from 'react';
import EasyMDE from 'easymde';
import 'easymde/dist/easymde.min.css';
import { deleteToken, retrieveToken, Token } from "../../tokenStorage.tsx";
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { buildPath } from '../Path.tsx';

interface SingleNoteResponse {
	userId: number;
	noteId: number;
	title: string;
	body: string[];
	error: string;
	jwtToken: Token;
}

interface MarkdownPanelProps {
	noteId: string,
    textAreaId: string;
	note: SingleNoteResponse;
	noteBody: string;
}

interface UpdateNoteResponse {
	error: string;
	jwtToken: Token;
}

function MarkdownPanel({ noteId, textAreaId, note, noteBody }: MarkdownPanelProps) {
	const [message, setMessage] = useState('');
	const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
    const buttonId = "sendNoteButton";
    const noteViewResultId = "noteViewResult";
    const tempLocationId = "tempLocationId";
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const easyMdeRef = useRef<EasyMDE | null>(null);

    // Get current user information
    let _ud: any = localStorage.getItem('user_data');
    let ud = JSON.parse(_ud);
    let userId: string = ud.id;
	
    useEffect(() => {
        if (!textareaRef.current) return;

        // Initialize EasyMDE
        easyMdeRef.current = new EasyMDE({
            element: textareaRef.current,
            initialValue: noteBody,
			autoDownloadFontAwesome: true, // Automatically download font package for icons
            toolbar: [
                'bold', 'italic', 'heading', '|',
                'quote', 'unordered-list', 'ordered-list', '|',
                'link', 'image', '|',
                'side-by-side', 'preview', 'fullscreen', '|',
            ]
        });

        return () => {
            // Cleanup on unmount
            if (easyMdeRef.current) {
                easyMdeRef.current.toTextArea();
                easyMdeRef.current = null;
            }
        };
    }, [noteBody]);

	async function updateNote( noteTitle: string, noteBody : string ): Promise<void> {
		let obj = { userId: userId, noteId: noteId, title: noteTitle, body: noteBody, jwtToken: retrieveToken() };
		let js  = JSON.stringify(obj);

		// Set Axios request configuration
		const config: AxiosRequestConfig = {
			method: 'post',
			url: buildPath('api/update_note'),
			headers: {
				'Content-Type': 'application/json'
			},
			data: js
		};

        axios(config)
            .then(function (response: AxiosResponse<UpdateNoteResponse>) {
                const res = response.data;

                console.log(res);

                if (res.jwtToken == null) {
                    setMessage("JWT Token no longer valid... Unable to refresh token " + res.error);
                    setMessageType("error"); // Set the message to error
                    deleteToken();
                    localStorage.removeItem("user_data");
                    window.location.href = "/";
                }
                else if (res.error) {
                    setMessage("The deck is empty... Add some cards to begin");
                    setMessageType("error");
                }
            })
            .catch(function (error) {
                alert(error.toString());
            })
	}

    async function sendNoteToServer(): Promise<void> {
        const noteViewResult = document.getElementById(noteViewResultId);
        const requestNoteBody = document.getElementById(tempLocationId);

        if (noteViewResult) {
            setMessage("Sending note...");
			setMessageType("success");
        }

        if (requestNoteBody && easyMdeRef.current) {
            const requestNoteBodyText = easyMdeRef.current.value();

            await updateNote( note.title, requestNoteBodyText );;
            
            if (noteViewResult) {
                setMessage("Note updated!");
				setMessageType("success");
            }
        } else {
            const errorMsg = "Note title and/or note body is null. Could not send note.";
            if (noteViewResult) {
                noteViewResult.textContent = errorMsg;
            }
        }
    }
	
	function addStyling() : void {
		// Change the icon colors.
		const icons = document.getElementsByClassName("editor-toolbar")[0].children;
		
		for (let i = 0; i < icons.length; i++){
			icons[i].setAttribute("style", "color:blue;");
		}
		
		// Text alignment.
		document.getElementsByClassName("CodeMirror")[0].setAttribute("style", "text-align:left;");
		document.getElementsByClassName("editor-preview-side")[0].setAttribute("style", "text-align:left;");
	}
	
	return (
		<div className="container" onLoad={addStyling}>
			<div className="row justify-content-center">
				<div className="col-md-10 col-lg-8">
					{/* Textarea with proper spacing */}
					<div className="mb-3">
						<textarea 
							id={textAreaId} 
							ref={textareaRef} 
							defaultValue={noteBody}
							className="form-control"
							style={{ minHeight: '300px' }}
						/>
					</div>
	
					{/* Centered button */}
					<div className="d-grid mb-4">
						<button 
							id={buttonId}
							onClick={sendNoteToServer}
							className="btn text-white"
							style={{
								backgroundColor: '#7E24B9',
								padding: '0.5rem 1rem',
								fontWeight: '500',
								transition: 'background-color 0.2s ease-in-out',
							}}
							onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#6a1d9f'}
							onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#7E24B9'}
						>
							Send note to server
						</button>
					</div>
	
					{/* Hidden div - remains unchanged */}
					<div id={tempLocationId} style={{ display: "none" }} />
	
					{/* Message alert - now using Bootstrap classes */}
					{message && (
						<div 
							className={`alert mt-4 ${messageType === 'success' ? 'alert-success' : 'alert-danger'}`}
							role="alert"
						>
							{message}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default MarkdownPanel;