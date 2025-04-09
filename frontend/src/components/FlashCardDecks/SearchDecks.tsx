import { Token, storeToken, retrieveToken, deleteToken } from "../../tokenStorage.tsx";
import { useState, useEffect } from 'react';
import { buildPath } from '../Path.tsx';
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";

function SearchDecks() {
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
    const [deckList, setDeckList] = useState<Array<[number, number, string, number]>>([]);
    const [search, setSearchValue] = useState('');
    const [loading, setLoading] = useState(false); // Loading state
    
    const navigate = useNavigate();

    // Get current user information
    let _ud: any = localStorage.getItem('user_data');
    let ud = JSON.parse(_ud);
    let userId: string = ud.id;

    interface SearchDecksResponse {
        results: Array<[number, number, string, number]>;
        error: string;
        jwtToken: Token;
    }

    interface CreateDeckResponse {
        error: string;
        jwtToken: Token;
    }

    interface DeleteDeckResponse {
        error: string;
        jwtToken: Token;
    }

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

                console.log(res)

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
                    setMessageType("error"); // Set the message to error
                    deleteToken();
                    localStorage.removeItem("user_data");
                    window.location.href = "/";
                } else {
                    // Update the message
                    setMessage("");

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

    // Function to add new deck
    async function addDeck( title: string ): Promise<void> {
        setLoading(true); // Start loading
        let obj = { userId: userId, title: title, jwtToken: retrieveToken() };
        let js = JSON.stringify(obj);

        const config: AxiosRequestConfig = {
            method: 'post',
            url: buildPath('api/create_flashcard_deck'),
            headers: {
                'Content-Type': 'application/json'
            },
            data: js
        };

        axios(config)
            .then(function (response: AxiosResponse<CreateDeckResponse>) {
                const res = response.data;

                if (res.jwtToken == null) {
                    setMessage("JWT Token no longer valid... Unable to refresh token " + res.error);
                    deleteToken();
                    localStorage.removeItem("user_data");
                    window.location.href = "/";
                }
                else if (res.error != "") {
                    setMessage("Unable to create deck " + res.error);
                }
                else {
                    // Deck added successfully, update the deck list
                    fetchAllDecks();
                    setSearchValue("");
                    setMessage("Deck added successfully.");
                    setMessageType('success'); // Set message type to success
                }
            })
            .catch(function (error) {
                alert(error.toString());
            })
            .finally(() => {
                setLoading(false); // Stop loading
            });
    }

    // Function to delete deck
    async function deleteDeck( deckId: number ): Promise<void> {
        setLoading(true); // Start loading
        let obj = { userId: userId, deckId: deckId, jwtToken: retrieveToken() };
        let js = JSON.stringify(obj);

        const config: AxiosRequestConfig = {
            method: 'post',
            url: buildPath('api/delete_flashcard_deck'),
            headers: {
                'Content-Type': 'application/json'
            },
            data: js
        };

        axios(config)
            .then(function (response: AxiosResponse<DeleteDeckResponse>) {
                const res = response.data;

                if (res.jwtToken == null) {
                    setMessage("JWT Token no longer valid... Unable to refresh token " + res.error);
                    deleteToken();
                    localStorage.removeItem("user_data");
                    window.location.href = "/";
                }
                else if (res.error != "") {
                    setMessage("Unable to delete deck " + res.error);
                }
                else {
                    // Deck deleted successfully, update the deck list
                    setDeckList(prevDeckList => prevDeckList.filter(deck => deck[1] !== deckId)); // Remove the deleted deck
                    setMessage("Deck deleted successfully.");
                    setMessageType('error');
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
        <div className="d-flex flex-column min-vh-100">
        <div className="container mt-5">
            {/* Title */}
            <h1 className="text-center mb-4" style={{ color: '#4A4A4A' }}>Decks</h1>

            {/* Search Bar and Add New Deck Button */}
            <div className="d-flex align-items-center mb-4 gap-3">
                {/* Search Bar */}
                <input
                    type="text"
                    className="form-control shadow-sm flex-grow-1"
                    placeholder="Search or add deck title"
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
                        if (search != "") {
                            addDeck(search);
                        }
                    }}
                >
                    <i className="bi bi-plus-lg me-2"></i> {/* Plus icon */}
                    Add New Deck
                </button>
            </div>

            {/* No Results Message */}
            {!loading && deckList.length === 0 && (
                <p className="text-center mt-4" style={{ color: '#4A4A4A' }}>No decks found... You can add it with the "Add deck" button</p>
            )}

            {/* Deck Cards */}
            <div className="row" style={{
                marginBottom: '50px'
            }}>
                {deckList.map((deck, index) => (
                    <div key={index} className="col-md-4 d-flex" style={{ height: "200px", marginTop: "25px" }}>
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
                                navigate(`/decks/${deck[1]}?title=${encodeURIComponent(deck[2])}`);
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
                                <h5 className="card-title" style={{
                                    color: '#7E24B9',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    width: '100%',
                                    maxWidth: '100%',
                                    padding: '0 10px' // Add some padding if needed
                                    }}
                                >
                                    {deck[2]}
                                </h5>
                                <p className="card-text">{deck[3]} cards</p>
                            </div>

                            {/* Card Footer */}
                            <div
                                className="card-footer d-flex justify-content-end"
                                style={{
                                    backgroundColor: '#E6E1F5',
                                    borderTop: '1px solid #D3D3D3',
                                }}
                            >
                                {/* Edit & Delete Buttons */}
                                <div className="d-flex">
                                    <button
                                        className="btn btn-sm"
                                        style={{
                                            backgroundColor: '#DE6464',
                                            color: '#FFFFFF',
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent card click event from firing
                                            // Show confirmation dialog
                                            const isConfirmed = window.confirm("Are you sure you want to delete this deck?");

                                            if (isConfirmed) {
                                                // User confirmed, proceed with deletion
                                                deleteDeck(deck[1]);
                                                // Add your deletion logic here, e.g., calling an API or updating state
                                            } else {
                                                // User canceled, do nothing
                                                console.log("Deletion canceled.");
                                            }
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

            {/* Message */}
            {message && (
                <div
                    className="alert mt-4"
                    role="alert"
                    style={{
                        backgroundColor: messageType === 'success' ? '#D4EDDA' : '#F8D7DA', // Green for success, red for error
                        color: messageType === 'success' ? '#155724' : '#721C24', // Dark green for success, dark red for error
                        borderColor: messageType === 'success' ? '#C3E6CB' : '#F5C6CB', // Light green for success, light red for error
                    }}
                >
                    {message}
                </div>
            )}
        </div>
        </div>
    );
}

export default SearchDecks;