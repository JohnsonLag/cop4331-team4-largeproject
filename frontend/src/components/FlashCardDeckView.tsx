import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { deleteToken, retrieveToken, storeToken, Token } from '../tokenStorage';
import { buildPath } from './Path';


function FlashCardDeckView () {
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
    const { deckId } = useParams();
    const [searchParams] = useSearchParams();
    const [flashcards, setFlashcards] = useState<FlashCard[]>([]);
    const [newQuestion, setNewQuestion] = useState('');
    const [newAnswer, setNewAnswer] = useState('');

    const deckTitle = searchParams.get("title");

    const navigate = useNavigate();
    
    interface FlashCard {
        CardId: number;
        DeckId: number;
        Question: string;
        Answer: string;
    }

    interface FetchFlashCardsResponse {
        results: FlashCard[];
        error: string,
        jwtToken: Token,
    }

    interface AddFlashCardResponse {
        cardId: number,
        error: string,
        jwtToken: Token,
    }

    interface DeleteFlashCardResponse {
        error: string,
        jwtToken: Token
    }

    // Get current user information
    let _ud: any = localStorage.getItem('user_data');
    let ud = JSON.parse(_ud);
    let userId: string = ud.id;

    useEffect(() => {
        fetchAllCards();
    }, [deckId]);

    // Function to search flash cards based on the query
    async function fetchAllCards(): Promise<void> {
        let obj = { userId: userId, deckId, search: "", jwtToken: retrieveToken() };
        let js = JSON.stringify(obj);

        const config: AxiosRequestConfig = {
            method: 'post',
            url: buildPath('api/search_flash_cards'),
            headers: {
                'Content-Type': 'application/json'
            },
            data: js
        };

        axios(config)
            .then(function (response: AxiosResponse<FetchFlashCardsResponse>) {
                const res = response.data;

                console.log(res);

                if (res.jwtToken == null) {
                    setMessage("JWT Token no longer valid... Unable to refresh token " + res.error);
                    setMessageType("error"); // Set the message to error
                    deleteToken();
                    localStorage.removeItem("user_data");
                    window.location.href = "/";
                } else {
                    // Update the cards
                    setFlashcards(res.results); // Update the card list with search results
                    storeToken(res.jwtToken);
                }
            })
            .catch(function (error) {
                alert(error.toString());
            })
    }

    // Function to add new flash card
    async function addFlashCard( question: string, answer: string ): Promise<void> {
        let obj = { 
            userId: userId, 
            deckId: deckId,
            question: question,
            answer: answer, 
            jwtToken: retrieveToken()
        };
        let js = JSON.stringify(obj);

        const config: AxiosRequestConfig = {
            method: 'post',
            url: buildPath('api/add_flash_card'),
            headers: {
                'Content-Type': 'application/json'
            },
            data: js
        };

        axios(config)
            .then(function (response: AxiosResponse<AddFlashCardResponse>) {
                const res = response.data;

                if (res.jwtToken == null) {
                    setMessage("JWT Token no longer valid... Unable to refresh token " + res.error);
                    deleteToken();
                    localStorage.removeItem("user_data");
                    window.location.href = "/";
                }
                else if (res.error != "") {
                    setMessage("Unable to create flashcard " + res.error);
                }
                else {
                    // Deck added successfully, update the deck list
                    fetchAllCards();
                    setMessage("Card added successfully.");
                    setMessageType('success'); // Set message type to success

                    // Refresh / Clear the form fields
                    setNewQuestion('');
                    setNewAnswer('');
                }
            })
            .catch(function (error) {
                alert(error.toString());
            })
    }

    // Function to delete card
    async function deleteCard( cardId: number ): Promise<void> {
        let obj = { userId: userId, deckId: deckId, cardId: cardId, jwtToken: retrieveToken() };
        let js = JSON.stringify(obj);

        const config: AxiosRequestConfig = {
            method: 'post',
            url: buildPath('api/delete_flash_card'),
            headers: {
                'Content-Type': 'application/json'
            },
            data: js
        };

        axios(config)
            .then(function (response: AxiosResponse<DeleteFlashCardResponse>) {
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
                    setFlashcards(prevCardList => prevCardList.filter(card => card.CardId !== cardId)); // Remove the deleted deck
                    setMessage("Card deleted successfully.");
                    setMessageType('error');
                }
            })
            .catch(function (error) {
                alert(error.toString());
            })
    }

    return (
        <div className="d-flex flex-column min-vh-100">
        <div className="container mt-5">
            {/* Title */}
            <h1 className="text-center mb-4" style={{ color: '#4A4A4A' }}>{ deckTitle }</h1>

            {/* Play Button */}
            <button
                className="btn btn-success mb-4"
                onClick={() => navigate(`/practice-deck/${deckId}`)}
                style={{
                    backgroundColor: '#7E24B9',
                    color: 'white',
                    padding: '10px 20px',
                    marginBottom: '20px',
                    width: '40%', // Set width to 60% of the container
                }}
            >
                Practice
            </button>

            {/* Add Flashcard Section */}
            <div className="mt-4">
                <div className="row mb-3 align-items-center">
                    <div className="col-md-5">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Question"
                            value={newQuestion}
                            onChange={(e) => setNewQuestion(e.target.value)}
                            required
                        />
                    </div>
                    <div className="col-md-5">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Answer"
                            value={newAnswer}
                            onChange={(e) => setNewAnswer(e.target.value)}
                            required
                        />
                    </div>
                    <div className="col-md-2">
                        <button
                            type="button" // Change type to "button" to prevent form submission
                            className="btn w-100"
                            style={{ backgroundColor: '#7E24B9', color: 'white' }}
                            onClick={() => {
                                if (newQuestion != "")
                                {
                                    addFlashCard(newQuestion, newAnswer)
                                }
                            }} // Call addFlashCard directly
                        >
                            Add
                        </button>
                    </div>
                </div>
            </div>

            {/* Flashcards List */}
            <div className="row">
                {flashcards.map((card) => (
                    <div key={card.CardId} className="col-md-4 d-flex" style={{ height: "200px", marginTop: "25px" }}>
                        {/* Card */}
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
                        >
                            {/* Card Body */}
                            <div className="card-body d-flex flex-column justify-content-center align-items-center text-center">
                            <h5 className="card-title" style={{ color: '#7E24B9' }}>
                                {card.Question}
                            </h5>
                            <p className="card-text">
                                {card.Answer}
                            </p>
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
                                        className="btn btn-sm me-2"
                                        style={{
                                            backgroundColor: '#D3D3D3',
                                            color: '#353839',
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent card click event from firing
                                            console.log(`Edit deck: ${card.CardId}`);
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
                                            // Show confirmation dialog
                                            const isConfirmed = window.confirm("Are you sure you want to delete this deck?");

                                            if (isConfirmed) {
                                                // User confirmed, proceed with deletion
                                                deleteCard(card.CardId);
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

            {/* <div className="row">
                {flashcards.map((card) => (
                    <div key={card.CardId} className="col-md-6 mb-3">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">{card.Question}</h5>
                                <p className="card-text">{card.Answer}</p>
                                <button
                                    className="btn btn-primary me-2"
                                    onClick={() => {}}
                                >
                                    <i className="bi bi-pen"></i>
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent card click event from firing
                                            // Show confirmation dialog
                                            const isConfirmed = window.confirm("Are you sure you want to delete this flash card?");

                                            if (isConfirmed) {
                                                // User confirmed, proceed with deletion
                                                deleteCard(card.CardId);
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
                ))}
            </div> */}

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
};

export default FlashCardDeckView;