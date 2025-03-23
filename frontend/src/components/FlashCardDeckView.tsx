import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { deleteToken, retrieveToken, storeToken, Token } from '../tokenStorage';
import { buildPath } from './Path';


const FlashCardDeckView: React.FC = () => {
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
    const { _deckId } = useParams<{ _deckId: string }>();
    const [flashcards, setFlashcards] = useState<FlashCard[]>([]);
    const [newQuestion, setNewQuestion] = useState('');
    const [newAnswer, setNewAnswer] = useState('');

    const navigate = useNavigate();

    const deckId = Number(_deckId);
    
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

    // Get current user information
    let _ud: any = localStorage.getItem('user_data');
    let ud = JSON.parse(_ud);
    let userId: string = ud.id;

    useEffect(() => {
        fetchAllCards( deckId );
    }, [deckId]);

    // Function to search decks based on the query
    async function fetchAllCards( deckId : number ): Promise<void> {
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

                if (res.jwtToken == null) {
                    setMessage("JWT Token no longer valid... Unable to refresh token " + res.error);
                    setMessageType("error"); // Set the message to error
                    deleteToken();
                    localStorage.removeItem("user_data");
                    window.location.href = "/";
                } else {
                    // Update the message
                    setMessage("");
                    setFlashcards(res.results); // Update the deck list with search results
                    storeToken(res.jwtToken);
                }
            })
            .catch(function (error) {
                alert(error.toString());
            })
    }

    return (
        <div className="d-flex flex-column min-vh-100">
        <div className="container mt-5">
            {/* Play Button */}
            <button
                className="btn btn-success mb-4"
                onClick={() => navigate(`/practice-deck/${deckId}`)}
                style={{
                    backgroundColor: 'green',
                    color: 'white',
                    padding: '10px 20px',
                    marginBottom: '20px',
                    width: '40%', // Set width to 60% of the container
                }}
            >
                Play
            </button>

            {/* Flashcards List */}
            <div className="row">
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
                                    Edit
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => {}}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Flashcard Form */}
            <form onSubmit={() => {}} className="mt-4">
                <div className="row mb-3 align-items-center"> {/* Added align-items-center */}
                    <div className="col-md-5"> {/* Adjusted column width */}
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Question"
                            value={newQuestion}
                            onChange={(e) => setNewQuestion(e.target.value)}
                            required
                        />
                    </div>
                    <div className="col-md-5"> {/* Adjusted column width */}
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Answer"
                            value={newAnswer}
                            onChange={(e) => setNewAnswer(e.target.value)}
                            required
                        />
                    </div>
                    <div className="col-md-2"> {/* Added column for the button */}
                        <button
                            type="submit"
                            className="btn w-100" // Full width within the column
                            style={{ backgroundColor: '#7E24B9', color: 'white' }} // Logo purple color
                        >
                            Add
                        </button>
                    </div>
                </div>
            </form>
        </div>
        </div>
    );
};

export default FlashCardDeckView;