import { Token, storeToken, retrieveToken, deleteToken } from "../tokenStorage.tsx";
import { useState, useEffect } from 'react';
import { buildPath } from './Path.tsx';
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

function SearchDecks() {
    const [message, setMessage] = useState('');
    const [deckList, setDeckList] = useState<Array<[string, number]>>([]);
    const [search, setSearchValue] = useState('');
    const [loading, setLoading] = useState(false); // Loading state

    interface SearchDecksResponse {
        results: Array<[string, number]>;
        error: string;
        jwtToken: Token;
    }

    // Get current user information
    let _ud: any = localStorage.getItem('user_data');
    let ud = JSON.parse(_ud);
    let userId: string = ud.id;

    // Fetch all decks when the component first loads
    useEffect(() => {
        fetchAllDecks();
    }, []); // Empty dependency array ensures this runs only once on mount

    // Handle search text change
    function handleSearchTextChange(e: any): void {
        setSearchValue(e.target.value);
    }

    // Auto-search when search value changes
    useEffect(() => {
        if (search.trim() === "") {
            fetchAllDecks(); // Fetch all decks if the search query is empty
        } else {
            searchDecks(); // Perform a search if there's a query
        }
    }, [search]); // Trigger useEffect when `search` changes

    // Function to fetch all decks
    async function fetchAllDecks(): Promise<void> {
        setLoading(true); // Start loading
        let obj = { userId: userId, search: "", jwtToken: retrieveToken() }; // Empty search query to fetch all decks
        let js = JSON.stringify(obj);

        const config: AxiosRequestConfig = {
            method: 'post',
            url: buildPath('api/search_flashcard_decks'),
            headers: {
                'Content-Type': 'application/json'
            },
            data: js
        };

        axios(config)
            .then(function (response: AxiosResponse<SearchDecksResponse>) {
                const res = response.data;

                if (res.jwtToken == null) {
                    setMessage("JWT Token no longer valid... Unable to refresh token " + res.error);
                    deleteToken();
                    localStorage.removeItem("user_data");
                    window.location.href = "/";
                } else {
                    setDeckList(res.results); // Update the deck list with all results
                    storeToken(res.jwtToken);
                }
            })
            .catch(function (error) {
                alert(error.toString());
            })
            .finally(() => {
                setLoading(false); // Stop loading
            });
    }

    // Function to search decks based on the query
    async function searchDecks(): Promise<void> {
        setLoading(true); // Start loading
        let obj = { userId: userId, search: search, jwtToken: retrieveToken() };
        let js = JSON.stringify(obj);

        const config: AxiosRequestConfig = {
            method: 'post',
            url: buildPath('api/search_flashcard_decks'),
            headers: {
                'Content-Type': 'application/json'
            },
            data: js
        };

        axios(config)
            .then(function (response: AxiosResponse<SearchDecksResponse>) {
                const res = response.data;

                if (res.jwtToken == null) {
                    setMessage("JWT Token no longer valid... Unable to refresh token " + res.error);
                    deleteToken();
                    localStorage.removeItem("user_data");
                    window.location.href = "/";
                } else {
                    setDeckList(res.results); // Update the deck list with search results
                    storeToken(res.jwtToken);
                }
            })
            .catch(function (error) {
                alert(error.toString());
            })
            .finally(() => {
                setLoading(false); // Stop loading
            });
    }

    return (
        <div className="container mt-5">
            {/* Title */}
            <h1 className="text-center mb-4" style={{ color: '#4A4A4A' }}>Decks</h1>

            {/* Search Bar and Add New Deck Button */}
            <div className="d-flex align-items-center mb-4 gap-3">
                {/* Search Bar */}
                <input
                    type="text"
                    className="form-control shadow-sm flex-grow-1"
                    placeholder="Search deck titles..."
                    onChange={handleSearchTextChange}
                    value={search}
                    style={{
                        borderColor: '#D3D3D3',
                        backgroundColor: '#FFFFFF',
                        color: '#4A4A4A',
                    }}
                />

                {/* Add New Deck Button */}
                <button
                    className="btn shadow-sm"
                    style={{
                        backgroundColor: '#7E24B9', // Logo Purple
                        color: '#FFFFFF', // White text
                        border: 'none', // Remove default border
                        flexShrink: 0, // Prevent button from shrinking
                    }}
                    onClick={() => {
                        // Handle "Add New Deck" button click
                        console.log("Add New Deck clicked");
                    }}
                >
                    <i className="bi bi-plus-lg me-2"></i> {/* Plus icon */}
                    Add New Deck
                </button>
            </div>

            {/* No Results Message */}
            {!loading && deckList.length === 0 && (
                <p className="text-center mt-4" style={{ color: '#4A4A4A' }}>No decks found.</p>
            )}

            {/* Deck Cards */}
            <div className="row">
                {deckList.map((deck, index) => (
                    <div key={index} className="col-md-4 d-flex" style={{ height: "200px" }}>
                        {/* Clickable Card */}
                        <div
                            className="card shadow-sm h-100 d-flex flex-column"
                            style={{
                                backgroundColor: '#FFFF',
                                borderColor: '#D3D3D3',
                                color: '#4A4A4A',
                                flex: '1',
                                padding: '0',
                                cursor: 'pointer', // Change cursor to pointer on hover
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease', // Smooth transition for hover effects
                            }}
                            onClick={() => {
                                // Handle card click (e.g., navigate to deck details)
                                console.log(`Clicked on deck: ${deck[0]}`);
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)'; // Lift card on hover
                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'; // Add shadow on hover
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)'; // Reset card position
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'; // Reset shadow
                            }}
                        >
                            {/* Card Body */}
                            <div className="card-body d-flex flex-column justify-content-center align-items-center text-center">
                                <h5 className="card-title" style={{ color: '#7E24B9' }}>{deck[0]}</h5>
                                <p className="card-text">{deck[1]} cards</p>
                            </div>

                            {/* Card Footer */}
                            <div
                                className="card-footer d-flex justify-content-end"
                                style={{
                                    backgroundColor: '#E6E1F5',
                                    borderTop: '1px solid #D3D3D3',
                                }}
                            >
                                {/* Right Buttons */}
                                <div className="d-flex">
                                    <button
                                        className="btn btn-sm me-2"
                                        style={{
                                            backgroundColor: '#D3D3D3',
                                            color: '#353839',
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent card click event from firing
                                            console.log(`Edit deck: ${deck[0]}`);
                                        }}
                                    >
                                        <i className="bi bi-pen"></i>
                                    </button>
                                    <button
                                        className="btn btn-sm"
                                        style={{
                                            backgroundColor: '#DE6464',
                                            color: '#FFFFFF',
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent card click event from firing
                                            console.log(`Delete deck: ${deck[0]}`);
                                        }}
                                    >
                                        <i className="bi bi-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Error Message */}
            {message && (
                <div className="alert alert-danger mt-4" role="alert">
                    {message}
                </div>
            )}
        </div>
    );
}

export default SearchDecks;