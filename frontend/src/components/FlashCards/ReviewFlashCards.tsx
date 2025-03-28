import { useState, useEffect } from 'react';
import './ReviewFlashCards.css'; // We'll create this CSS file next
import { useParams } from 'react-router-dom';
import { deleteToken, retrieveToken, storeToken, Token } from '../../tokenStorage';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { buildPath } from '../Path';

function ReviewFlashCards() 
{
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);    
    const { deckId } = useParams();
    const [cards, setFlashCards] = useState<FlashCard[]>([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Get current user information
    let _ud: any = localStorage.getItem('user_data');
    let ud = JSON.parse(_ud);
    let userId: string = ud.id;

    interface FlashCard {
        CardId: string;
        DeckId: string;
        Question: string;
        Answer: string;
        ConfidenceScore: number;
    }

    interface GetFlashCardsByConfidenceResponse {
        cards: [FlashCard];
        error: string;
        jwtToken: Token;
    }

    interface RateFlashCardResponse {
        error: string, 
        newScore: number, 
        jwtToken: Token;
    }

    // Function to search flash cards based on the query
    async function getFlashCardsByConfidence(): Promise<void> {
        let obj = { userId: userId, deckId: deckId, search: "", jwtToken: retrieveToken() };
        let js = JSON.stringify(obj);

        const config: AxiosRequestConfig = {
            method: 'post',
            url: buildPath('api/get_cards_for_review'),
            headers: {
                'Content-Type': 'application/json'
            },
            data: js
        };

        axios(config)
            .then(function (response: AxiosResponse<GetFlashCardsByConfidenceResponse>) {
                const res = response.data;

                console.log(res);

                if (res.jwtToken == null) {
                    setMessage("JWT Token no longer valid... Unable to refresh token " + res.error);
                    setMessageType("error"); // Set the message to error
                    deleteToken();
                    localStorage.removeItem("user_data");
                    window.location.href = "/";
                }
                else if (!res.cards) {
                    setMessage("The deck is empty... Add some cards to begin");
                    setMessageType("error");
                }
                else {
                    // Update the cards
                    setFlashCards(res.cards); // Update the card list with search results
                    storeToken(res.jwtToken);
                }
            })
            .catch(function (error) {
                alert(error.toString());
            })
            .finally(() => {
                // This will run whether the request succeeds or fails
                setIsLoading(false); // Turn off loading indicator
                console.log("Flash card fetch operation completed");
            });
    }

    // Function to update confidence rating
    async function rateFlashCard( cardId : number, confidence : number ): Promise<void> {
        let obj = { 
            userId: userId, 
            deckId: deckId, 
            cardId: cardId, 
            confidence: confidence,
            jwtToken: retrieveToken() };
        let js = JSON.stringify(obj);

        const config: AxiosRequestConfig = {
            method: 'post',
            url: buildPath('api/rate_flash_card'),
            headers: {
                'Content-Type': 'application/json'
            },
            data: js
        };

        axios(config)
            .then(function (response: AxiosResponse<RateFlashCardResponse>) {
                const res = response.data;

                console.log(res);

                if (res.jwtToken == null) {
                    setMessage("JWT Token no longer valid... Unable to refresh token " + res.error);
                    setMessageType("error"); // Set the message to error
                    deleteToken();
                    localStorage.removeItem("user_data");
                    window.location.href = "/";
                }
                else if (res.error != "") {
                    setMessage("Error updating card confidence : " + res.error);
                    setMessageType("error");
                }
                else {
                    // Update position in the deck
                    if (currentCardIndex < cards.length-1) {
                        setCurrentCardIndex(currentCardIndex + 1);
                    }
                    else {
                        setFlashCards([]);
                        setMessage("Deck completed!");
                        setMessageType("success");
                    }
                    setIsFlipped(false);
                }
            })
            .catch(function (error) {
                alert(error.toString());
            })
    }

    // Fetch cards sorted by confidence (least confident first)
    useEffect(() => {
        getFlashCardsByConfidence();
    }, []);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleSkip = () => {
        if (currentCardIndex < cards.length - 1) {
            setCurrentCardIndex(currentCardIndex + 1);
        } else {
            // Last card - reset or show completion message
            setFlashCards([]);
        }
        setIsFlipped(false);
    };

    if (isLoading) {
        return (
            <div className="flashcard-container loading-container">
            <div className="spinner-border text-purple" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
            <p>Loading your flashcards...</p>
            </div>
        );
    }

    if (cards.length === 0) {
        return (
            <div className="flashcard-container completed-container">
            <h3>Review Complete!</h3>
            <p>You've reviewed all available cards.</p>
            <button 
                className="btn btn-purple"
                onClick={() => window.location.reload()}
            >
                Start Again
            </button>
            </div>
        );
    }

    const currentCard = cards[currentCardIndex];

    return (
        <div className="flashcard-review-container">
            <div className="progress-container">
            <div className="progress">
                <div 
                    className="progress-bar bg-purple" 
                    role="progressbar" 
                    style={{ 
                        width: `${((currentCardIndex + 1) / cards.length) * 100}%`,
                        backgroundColor: '#7E24B9',
                    }}
                    aria-valuenow={currentCardIndex + 1}
                    aria-valuemin={0}
                    aria-valuemax={cards.length}
                >
                {currentCardIndex + 1}/{cards.length}
                </div>
            </div>
            </div>

            <div 
            className={`flashcard ${isFlipped ? 'flipped' : ''}`}
            onClick={handleFlip}
            >
            <div className="flashcard-front">
                <h3>Question</h3>
                <p>{currentCard.Question}</p>
                <div className="hint">Click to reveal answer</div>
            </div>
            <div className="flashcard-back">
                <h3>Answer</h3>
                <p>{currentCard.Answer}</p>
                <div className="hint">Click to hide answer</div>
            </div>
            </div>

            {isFlipped && (
            <div className="confidence-rating-container">
                <h4>How confident are you?</h4>
                <div className="confidence-buttons">
                {[-2, -1, 0, 1, 2].map((confidence) => (
                    <button
                    key={confidence}
                    className={`btn confidence-btn ${confidence < 0 ? 'btn-low' : confidence === 0 ? 'btn-neutral' : 'btn-high'}`}
                    onClick={() => rateFlashCard(
                        Number(currentCard.CardId), 
                        Number(confidence)
                    )}
                    >
                    {getConfidenceLabel(confidence)}
                    </button>
                ))}
                </div>
                <button 
                className="btn btn-skip"
                onClick={handleSkip}
                >
                Skip Card
                </button>
            </div>
            )}

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
    );
};

// Helper function to get confidence level labels
const getConfidenceLabel = (rating: number): string => {
    switch (rating) {
        case -2: return 'Not at all';
        case -1: return 'Somewhat unsure';
        case 0: return 'Neutral';
        case 1: return 'Somewhat confident';
        case 2: return 'Very confident';
        default: return '';
    }
};

export default ReviewFlashCards;