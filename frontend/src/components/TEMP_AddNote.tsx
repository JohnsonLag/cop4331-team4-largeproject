import { Token, storeToken, retrieveToken, deleteToken} from "../tokenStorage.tsx";
import React, { useState } from 'react';

import { buildPath } from './Path.tsx';
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

function AddNote()
{
    const [message,setMessage] = useState('');
    const [noteTitleText,setNoteTitle] = React.useState('');
    const [noteBodyText,setNoteBody] = React.useState('');

    interface AddNoteResponse {
        error: string;
        jwtToken: Token;
    }

    // Get current user information
    let _ud : any = localStorage.getItem('user_data');
    let ud = JSON.parse( _ud );
    let userId : string = ud.id;


    function handleNoteTitleChange( e: any ) : void
    {
        setNoteTitle( e.target.value );
    }

    function handleNoteBodyChange ( e: any ) : void
    {
        setNoteBody( e.target.value );
    }

    async function addNote( e : any ) : Promise<void>
    {
        e.preventDefault();

        let obj = { userId: userId, title: noteTitleText, body: noteBodyText, jwtToken: retrieveToken() };
        let js = JSON.stringify(obj);

        // Set Axios request configuration
        const config: AxiosRequestConfig = {
            method: 'post',
            url: buildPath('api/create_note'),
            headers: {
                'Content-Type': 'application/json'
            },
            data: js
        };

        // Send axios request
        axios(config)
        .then(function (response: AxiosResponse<AddNoteResponse>) {
            const res = response.data;
            
            if (res.error && res.error.length > 0)
            {
                setMessage("API Error: " + res.error );
                return;
            }
            else if (res.jwtToken == null)
            {
                setMessage("JWT Token no longer valid... Unable to refresh token " + res.error);
                deleteToken();
                localStorage.removeItem("user_data");
                window.location.href = "/";
                return;
            }
            else
            {
                setMessage("Note has been added");
                storeToken(res.jwtToken);
            }
        })
        .catch(function (error) {
            alert(error.toString());
            return;
        });
    };

    return(
        <div id="addNoteUIDiv">
            <br />
            Title: <input type="text" id="noteTitleText" placeholder="Title"
            onChange={handleNoteTitleChange} />
            Body: <input type="text" id="noteBodyText" placeholder="Title"
            onChange={handleNoteBodyChange} />
            <button type="button" id="addCardButton" className="buttons"
            onClick={addNote}> Add Card </button><br />
            <span id="cardAddResult">{message}</span>
        </div>
    );
}

export default AddNote;