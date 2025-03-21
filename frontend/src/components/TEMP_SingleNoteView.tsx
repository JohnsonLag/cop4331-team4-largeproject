import { Token, storeToken, retrieveToken } from "../tokenStorage.tsx";
import { useEffect, useState } from 'react';

import { buildPath } from './Path.tsx';
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { useParams } from "react-router-dom";
import { MarkdownPanel } from './MarkdownPanel.tsx';

interface SingleNoteResponse {
    userId: number;
    noteId: number;
    title: string;
    body: string[];
    error: string;
    jwtToken: Token;
}

function SingleNoteView()
{
    // Get the note ID from the URL
    const { id } = useParams<{ id: string }>();

    const [message,setMessage] = useState('');
    const [note, setNote] = useState<SingleNoteResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Get current user information
    let _ud : any = localStorage.getItem('user_data');
    let ud = JSON.parse( _ud );
    let userId : string = ud.id;

    // Fetch the note
    useEffect(() => {
        const fetchNote = async () => {
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
                try 
                {
                    const res = response.data;

                    // Check if a note was returned...
                    if (res.userId == null || res.error != "")
                    {
                        setMessage("Note doesn't exist");
                    }
                    else
                    {
                        setMessage("Note successfully retrieved")
                        setLoading(false);
                        setNote(res);
                        storeToken( res.jwtToken );
                    }
                }
                catch (e)
                {
                    if (axios.isAxiosError(e)) {
                        setMessage(e.response?.data?.message || 'Error fetching note');
                    } else {
                        setMessage('An unexpected error occurred');
                    }
                }
                finally
                {
                    setLoading(false);
                }
            })
            .catch(function (error) {
                alert(error.toString());
                setMessage(error.toString());
                return;
            });
        };
    
        fetchNote();
      }, [id]);

    if (loading) 
        return <p>Loading...</p>;
    if (!note) 
        return <p>Note not found</p>;
    else
    {
        return(
            <div id="singleNoteUIDiv">
            <br />
            <h1>{note.title}</h1>
            <div>
                {note.body.map((paragraph, index) => (
					<MarkdownPanel text={paragraph} id={index} />
                ))}
            </div>
            <span id="noteSearchResult">{message}</span>
    
        </div>
        );
    }
}

export default SingleNoteView;