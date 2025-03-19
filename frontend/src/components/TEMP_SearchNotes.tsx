import { Token, storeToken, retrieveToken, deleteToken} from "../tokenStorage.tsx";
import React, { useState } from 'react';

import { buildPath } from './Path.tsx';
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

function SearchNotes()
{
    const [message,setMessage] = useState('');
    const [searchResults,setResults] = useState('');
    const [cardList,setCardList] = useState('');
    const [search,setSearchValue] = React.useState('');

    interface SearchNotesResponse {
        results: Array<string>;
        error: string;
        jwtToken: Token;
    }

    // Get current user information
    let _ud : any = localStorage.getItem('user_data');
    let ud = JSON.parse( _ud );
    let userId : string = ud.id;

    function handleSearchTextChange( e: any ) : void
    {
        setSearchValue( e.target.value );
    }

    async function searchNotes(e:any) : Promise<void>
    {
        e.preventDefault();

        let obj = { userId: userId, search: search, jwtToken: retrieveToken() };

        let js = JSON.stringify(obj);

        // Set Axios request configuration
        const config: AxiosRequestConfig = {
            method: 'post',
            url: buildPath('api/search_notes'),
            headers: {
                'Content-Type': 'application/json'
            },
            data: js
        };
        
        // Send axios request
        axios(config)
        .then(function (response: AxiosResponse<SearchNotesResponse>) {
            const res = response.data;

            if (res.jwtToken == null)
            {
                setMessage("JWT Token no longer valid... Unable to refresh token " + res.error);
                deleteToken();
                localStorage.removeItem("user_data");
                window.location.href = "/";
            }
            else
            {
                let _results = res.results;
                let resultText = "";
    
                for (let i = 0; i < _results.length; i++)
                {
                    resultText += `"${_results[i][0]}"`;
                    resultText += ` with ${_results[i][1]} lines`;
                    if (i < _results.length -1)
                    {
                        resultText += ", ";
                    }
                }
    
                setResults("Notes have been retrieved");
                setCardList(resultText);
                storeToken(res.jwtToken);
                return;
            }
        })
        .catch(function (error) {
            alert(error.toString());
            return;
        });
    };

    return(
        <div id="searchNotesUIDiv">
            <br />
            Search: <input type="text" id="searchText" placeholder="Search note titles.."
                onChange={handleSearchTextChange} />
            <button type="button" id="searchCardButton" className="buttons"
                onClick={searchNotes}> Search Notes</button><br />
            <span id="cardSearchResult">{searchResults}</span>
            <p id="notesList">{cardList}</p><br /><br />
            <span id="noteSearchResult">{message}</span>
        </div>
    );
}

export default SearchNotes;