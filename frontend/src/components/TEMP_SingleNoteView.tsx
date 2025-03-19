import { Token, storeToken, retrieveToken, deleteToken} from "../tokenStorage.tsx";
import React, { useEffect, useState } from 'react';

import { buildPath } from './Path.tsx';
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { useParams } from "react-router-dom";

interface SingleNoteResponse {
    UserId: number;
    NoteId: number;
    Title: string;
    Body: string[];
}

function SingleNoteView()
{
    const { id } = useParams<{ id: string }>(); // Get the note ID from the URL
    const [note, setNote] = useState<SingleNoteResponse | null>(null);
    const [error, setError] = useState<string>('');

    // Get current user information
    let _ud : any = localStorage.getItem('user_data');
    let ud = JSON.parse( _ud );
    let userId : string = ud.id;

    // Fetch the note
    useEffect(() => {
        const fetchNote = async () => {
            let obj = { userId: userId, noteId: id, jwtToken: retrieveToken() };
            let js = JSON.stringify(obj);

            var _url = `/api/note/${id}`;

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
                const res = response.data;
                console.log(res);
            })
            .catch(function (error) {
                alert(error.toString());
                return;
            });


          try {
            const token = localStorage.getItem('token');
            const res = await axios.get<SingleNoteResponse>(`/api/notes/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setNote(res.data);
          } catch (err) {
            if (axios.isAxiosError(err)) {
              setError(err.response?.data?.message || 'Error fetching note');
            } else {
              setError('An unexpected error occurred');
            }
          } finally {
            setLoading(false);
          }
        };
    
        fetchNote();
      }, [id]);


    return(
        <div id="cardUIDiv">
            <br />
            Search: <input type="text" id="searchText" placeholder="Card To Search For"
            onChange={handleSearchTextChange} />
            <button type="button" id="searchCardButton" className="buttons"
            onClick={searchCard}> Search Card</button><br />
            <span id="cardSearchResult">{searchResults}</span>
            <p id="cardList">{cardList}</p><br /><br />
            Add: <input type="text" id="cardText" placeholder="Card To Add"
            onChange={handleCardTextChange} />
            <button type="button" id="addCardButton" className="buttons"
            onClick={addCard}> Add Card </button><br />
            <span id="cardAddResult">{message}</span>
        </div>
    );
}

export default SingleNoteView;