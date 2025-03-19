import { Token, storeToken, retrieveToken, deleteToken} from "../tokenStorage.tsx";
import React, { useState } from 'react';

import { buildPath } from './Path.tsx';
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

function SingleNoteView()
{
    const [message,setMessage] = useState('');
    const [searchResults,setResults] = useState('');
    const [cardList,setCardList] = useState('');
    const [search,setSearchValue] = React.useState('');
    const [card,setCardNameValue] = React.useState('');

    interface AddCardResponse {
        error: string;
        jwtToken: Token;
    }

    interface SearchCardsResponse {
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

    function handleCardTextChange( e: any ) : void
    {
        setCardNameValue( e.target.value );
    }

    async function addCard(e:any) : Promise<void>
    {
        e.preventDefault();
        let obj = { userId: userId, card: card, jwtToken: retrieveToken() };

        let js = JSON.stringify(obj);

        // Set Axios request configuration
        const config: AxiosRequestConfig = {
            method: 'post',
            url: buildPath('api/addCard'),
            headers: {
                'Content-Type': 'application/json'
            },
            data: js
        };
        
        // Send axios request
        axios(config)
        .then(function (response: AxiosResponse<AddCardResponse>) {
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
                setMessage("Card has been added");
                storeToken(res.jwtToken);
            }
        })
        .catch(function (error) {
            alert(error.toString());
            return;
        });
    };

    async function searchCard(e:any) : Promise<void>
    {
        e.preventDefault();

        let obj = { userId: userId, search: search, jwtToken: retrieveToken() };

        let js = JSON.stringify(obj);

        // Set Axios request configuration
        const config: AxiosRequestConfig = {
            method: 'post',
            url: buildPath('api/searchcards'),
            headers: {
                'Content-Type': 'application/json'
            },
            data: js
        };
        
        // Send axios request
        axios(config)
        .then(function (response: AxiosResponse<SearchCardsResponse>) {
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
                    resultText += _results[i];
                    if (i < _results.length -1)
                    {
                        resultText += ", ";
                    }
                }
    
                setResults("Cards have been retrieved");
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

export default CardUI;