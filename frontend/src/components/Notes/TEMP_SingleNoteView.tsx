import { Token, storeToken, retrieveToken } from "../../tokenStorage.tsx";
import { useEffect, useState } from 'react';

import { buildPath } from '../Path.tsx';
import MarkdownPanel from '../../components/Notes/MarkdownPanel.tsx';
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { useParams } from "react-router-dom";

interface SingleNoteResponse {
    userId: number;
    noteId: number;
    title: string;
    body: string[];
    error: string;
    jwtToken: Token;
}

function SingleNoteView() {
    // Get the note ID from the URL
    const { id } = useParams<{ id: string }>() as { id: string };

    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
    const [note, setNote] = useState<SingleNoteResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [generatingFlashcards, setGeneratingFlashcards] = useState<boolean>(false);
    const passedTextAreaId = "textAreaId";

    // Get current user information
    let _ud: any = localStorage.getItem('user_data');
    let ud = JSON.parse(_ud);
    let userId: string = ud.id;

    function createNoteBody(body: string[]): string {
        let returnedText: string = "";

        let i: number = 0;
        let len: number = body.length;

        // Concatenate.
        for (i = 0; i < len; i++) {
            returnedText += body.at(i);
        }

        return returnedText;
    }

    async function fetchNote(): Promise<void> {
        let obj = { userId: userId, noteId: id, jwtToken: retrieveToken() };
        let js = JSON.stringify(obj);

        var _url = `api/note/${id}`;

        // Set Axios request configuration
        const config: AxiosRequestConfig = {
            method: 'post',
            url: buildPath(_url),
            headers: {
                'Content-Type': 'application/json'
            },
            data: js
        };

        // Send axios request
        axios(config)
            .then(function (response: AxiosResponse<SingleNoteResponse>) {
                try {
                    const res = response.data;

                    // Check if a note was returned...
                    if (res.userId == null || res.error != "") {
                        setMessageType("error");
                        setMessage("Note doesn't exist");
                    }
                    else {
                        setLoading(false);
                        setNote(res);
                        storeToken(res.jwtToken);
                    }
                }
                catch (e) {
                    if (axios.isAxiosError(e)) {
                        setMessageType("error");
                        setMessage(e.response?.data?.message || 'Error fetching note');
                    } else {
                        setMessageType("error");
                        setMessage('An unexpected error occurred');
                    }
                }
                finally {
                    setLoading(false);
                }
            })
            .catch(function (error) {
                alert(error.toString());
                setMessageType("error");
                setMessage(error.toString());
                return;
            });
    };

    async function generateFlashCards(): Promise<void> {
        setGeneratingFlashcards(true);
        setMessage('');
        setMessageType(null);

        let obj = { noteId: id, jwtToken: retrieveToken() };
        let js = JSON.stringify(obj);

        var _url = `api/flashcards/generate_from_note`;

        // Set Axios request configuration
        const config: AxiosRequestConfig = {
            method: 'post',
            url: buildPath(_url),
            headers: {
                'Content-Type': 'application/json'
            },
            data: js
        };

        // Send axios request
        axios(config)
            .then(function (response: AxiosResponse<SingleNoteResponse>) {
                try {
                    const res = response.data;

                    console.log(res);

                    if (res.error) {
                        setMessageType("error");
                        setMessage("Error generating flashcards: " + res.error);
                        console.log("Error retrieving flashcards! ", res.error);
                    }
                    else {
                        setMessageType("success");
                        setMessage("Successfully generated flashcards!");
                        console.log(res.title);
                    }
                }
                catch (e) {
                    if (axios.isAxiosError(e)) {
                        setMessageType("error");
                        setMessage(e.response?.data?.message || 'Error generating flashcards');
                    } else {
                        setMessageType("error");
                        setMessage('An unexpected error occurred');
                    }
                }
                finally {
                    setGeneratingFlashcards(false);
                }
            })
            .catch(function (error) {
                setMessageType("error");
                setMessage(error.toString());
                setGeneratingFlashcards(false);
                return;
            });
    };

    // Fetch the note
    useEffect(() => {
        fetchNote();
    }, [id]);

    if (loading)
        return <p>Loading...</p>;
    if (!note)
        return <p>Note not found</p>;
    else {
        const returnedNoteBody = createNoteBody(note.body);

        return (
            <div className="d-flex flex-column min-vh-100">
                <div className="container mt-5">
                    {/* Title */}
                    <h1 className="text-center mb-3" style={{ color: '#4A4A4A' }}>{note.title}</h1>

                    {/* Generate Flashcards Button */}
                    <div className="text-center mb-4">
                        <button
                            className="btn text-white"
                            style={{
                                backgroundColor: generatingFlashcards ? '#9b59b6' : '#7E24B9',
                                padding: '0.5rem 1rem',
                                fontWeight: '500',
                                transition: 'background-color 0.2s ease-in-out',
                                position: 'relative'
                            }}
                            onClick={generateFlashCards}
                            disabled={generatingFlashcards}
                        >
                            {generatingFlashcards ? (
                                <>
                                    <span className="me-2">Generating...</span>
                                    <div className="spinner-border spinner-border-sm" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </>
                            ) : (
                                'Generate flashcards'
                            )}
                        </button>
                    </div>
                    {message && (
                        <div
                            className={`alert mt-4 ${messageType === 'success' ? 'alert-success' : 'alert-danger'}`}
                            role="alert"
                        >
                            {message}
                        </div>
                    )}
                    <div>
                        <MarkdownPanel noteId={id} textAreaId={passedTextAreaId} note={note} noteBody={returnedNoteBody} />
                    </div>
                    <span id="noteViewResult"></span>
                </div>
            </div>
        );
    }
}

export default SingleNoteView;