import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axios, { AxiosRequestConfig } from 'axios';
import { deleteToken, retrieveToken, storeToken, Token } from '../../tokenStorage';
import { buildPath } from '../Path';

interface FlashCard {
    CardId: number;
    DeckId: number;
    Question: string;
    Answer: string;
    isEditing?: boolean;
    editQuestion?: string;
    editAnswer?: string;
}

interface FetchFlashCardsResponse {
    results: FlashCard[];
    error: string;
    jwtToken: Token;
}

interface AddFlashCardResponse {
    cardId: number;
    error: string;
    jwtToken: Token;
}

interface DeleteFlashCardResponse {
    error: string;
    jwtToken: Token;
}

interface UpdateFlashCardResponse {
    cardId: number;
    error: string;
    jwtToken: Token;
}

function FlashCardDeckView() {
    const [message, setMessage] = useState<string>('');
    const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
    const { deckId } = useParams<{ deckId: string }>();
    const [searchParams] = useSearchParams();
    const [flashcards, setFlashcards] = useState<FlashCard[]>([]);
    const [newQuestion, setNewQuestion] = useState<string>('');
    const [newAnswer, setNewAnswer] = useState<string>('');

    const deckTitle = searchParams.get("title");
    const navigate = useNavigate();

    // Get current user information
    const userData = localStorage.getItem('user_data');
    const userId = userData ? JSON.parse(userData).id : '';

    useEffect(() => {
        if (deckId && userId) {
            fetchAllCards();
        }
    }, [deckId, userId]);

    async function fetchAllCards(): Promise<void> {
        const obj = {
            userId,
            deckId,
            search: "",
            jwtToken: retrieveToken()
        };
        const config: AxiosRequestConfig = {
            method: 'post',
            url: buildPath('api/search_flash_cards'),
            headers: { 'Content-Type': 'application/json' },
            data: JSON.stringify(obj)
        };

        try {
            const response = await axios(config);
            const res: FetchFlashCardsResponse = response.data;

            if (res.jwtToken === null) {
                handleInvalidToken(res.error);
            } else {
                setFlashcards(res.results);
                storeToken(res.jwtToken);
            }
        } catch (error) {
            console.error('Error fetching cards:', error);
            setMessage('Failed to fetch cards');
            setMessageType('error');
        }
    }

    async function addFlashCard(question: string, answer: string): Promise<void> {
        if (!question.trim() || !answer.trim()) return;

        const obj = {
            userId,
            deckId,
            question,
            answer,
            jwtToken: retrieveToken()
        };

        const config: AxiosRequestConfig = {
            method: 'post',
            url: buildPath('api/add_flash_card'),
            headers: { 'Content-Type': 'application/json' },
            data: JSON.stringify(obj)
        };

        try {
            const response = await axios(config);
            const res: AddFlashCardResponse = response.data;

            if (res.jwtToken === null) {
                handleInvalidToken(res.error);
            } else if (res.error) {
                setMessage(`Unable to create flashcard: ${res.error}`);
                setMessageType('error');
            } else {
                await fetchAllCards();
                setMessage('Card added successfully');
                setMessageType('success');
                setNewQuestion('');
                setNewAnswer('');
            }
        } catch (error) {
            console.error('Error adding card:', error);
            setMessage('Failed to add card');
            setMessageType('error');
        }
    }

    async function deleteCard(cardId: number): Promise<void> {
        const obj = {
            userId,
            deckId,
            cardId,
            jwtToken: retrieveToken()
        };

        const config: AxiosRequestConfig = {
            method: 'post',
            url: buildPath('api/delete_flash_card'),
            headers: { 'Content-Type': 'application/json' },
            data: JSON.stringify(obj)
        };

        try {
            const response = await axios(config);
            const res: DeleteFlashCardResponse = response.data;

            if (res.jwtToken === null) {
                handleInvalidToken(res.error);
            } else if (res.error) {
                setMessage(`Unable to delete card: ${res.error}`);
                setMessageType('error');
            } else {
                setFlashcards(prev => prev.filter(card => card.CardId !== cardId));
                setMessage('Card deleted successfully');
                setMessageType('success');
            }
        } catch (error) {
            console.error('Error deleting card:', error);
            setMessage('Failed to delete card');
            setMessageType('error');
        }
    }

    async function updateCard(card: FlashCard): Promise<void> {
        const obj = {
            userId,
            cardId: card.CardId,
            question: card.Question,
            answer: card.Answer,
            jwtToken: retrieveToken()
        };

        const config: AxiosRequestConfig = {
            method: 'post',
            url: buildPath('api/update_flashcard'),
            headers: { 'Content-Type': 'application/json' },
            data: JSON.stringify(obj)
        };

        try {
            const response = await axios(config);
            const res: UpdateFlashCardResponse = response.data;

            if (res.jwtToken === null) {
                handleInvalidToken(res.error);
            } else if (res.error) {
                setMessage(`Unable to update card: ${res.error}`);
                setMessageType('error');
            } else {
                setMessage('Card updated successfully');
                setMessageType('success');
            }
        } catch (error) {
            console.error('Error updating card:', error);
            setMessage('Failed to update card');
            setMessageType('error');
        }
    }

    function handleInvalidToken(error: string): void {
        setMessage(`JWT Token no longer valid: ${error}`);
        setMessageType('error');
        deleteToken();
        localStorage.removeItem('user_data');
        window.location.href = '/';
    }

    function handleEditClick(cardId: number): void {
        setFlashcards(prev => prev.map(card =>
            card.CardId === cardId
                ? {
                    ...card,
                    isEditing: true,
                    editQuestion: card.Question,
                    editAnswer: card.Answer
                }
                : card
        ));
    }

    function handleCancelEdit(cardId: number): void {
        setFlashcards(prev => prev.map(card =>
            card.CardId === cardId
                ? { ...card, isEditing: false }
                : card
        ));
    }

    function handleUpdateClick(card: FlashCard): void {
        if (!card.editQuestion?.trim() || !card.editAnswer?.trim()) {
            setMessage('Question and answer cannot be empty');
            setMessageType('error');
            return;
        }

        const updatedCard = {
            ...card,
            Question: card.editQuestion,
            Answer: card.editAnswer
        };

        updateCard(updatedCard);
        setFlashcards(prev => prev.map(c =>
            c.CardId === card.CardId
                ? { ...updatedCard, isEditing: false }
                : c
        ));
    }

    function handleEditChange(
        cardId: number,
        field: 'editQuestion' | 'editAnswer',
        value: string
    ): void {
        setFlashcards(prev => prev.map(card =>
            card.CardId === cardId
                ? { ...card, [field]: value }
                : card
        ));
    }

    return (
        <div className="d-flex flex-column min-vh-100">
            <div className="container mt-5">
                <h1 className="text-center mb-4" style={{ color: '#4A4A4A' }}>{deckTitle}</h1>

                <button
                    className="btn btn-success mb-4"
                    onClick={() => navigate(`/decks/${deckId}/review`)}
                    style={{
                        backgroundColor: '#7E24B9',
                        color: 'white',
                        padding: '10px 20px',
                        marginBottom: '20px',
                        width: '40%',
                    }}
                >
                    Review
                </button>

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
                                type="button"
                                className="btn w-100"
                                style={{ backgroundColor: '#7E24B9', color: 'white' }}
                                onClick={() => addFlashCard(newQuestion, newAnswer)}
                                disabled={!newQuestion.trim() || !newAnswer.trim()}
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        maxHeight: 'calc(100vh - 400px)',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        paddingRight: '10px',
                        marginTop: '20px',
                        paddingBottom: '50px'
                    }}
                >
                    <div className="row">
                        {flashcards.map((card) => (
                            <div key={card.CardId} className="col-md-4 d-flex" style={{ height: "200px", marginTop: "25px" }}>
                                <div className="card shadow-sm h-100 d-flex flex-column"
                                    style={{
                                        backgroundColor: '#FFFF',
                                        borderColor: '#D3D3D3',
                                        color: '#4A4A4A',
                                        flex: '1',
                                        padding: '0',
                                        cursor: 'pointer', // Change cursor to pointer on hover
                                        transition: 'transform 0.2s ease, box-shadow 0.2s ease', // Smooth transition for hover effects
                                    }}>
                                    <div className="card-body d-flex flex-column justify-content-center align-items-center text-center">
                                        {card.isEditing ? (
                                            <>
                                                <input
                                                    type="text"
                                                    className="form-control mb-2"
                                                    value={card.editQuestion || ''}
                                                    onChange={(e) => handleEditChange(card.CardId, 'editQuestion', e.target.value)}
                                                />
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={card.editAnswer || ''}
                                                    onChange={(e) => handleEditChange(card.CardId, 'editAnswer', e.target.value)}
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <h5 className="card-title"
                                                    style={{
                                                        color: '#7E24B9',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        width: '100%',
                                                        maxWidth: '100%',
                                                        padding: '0 10px' // Add some padding if needed
                                                    }}>{card.Question}</h5>
                                                <p
                                                    className="card-text"
                                                    style=
                                                    {{
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        width: '100%',
                                                        maxWidth: '100%',
                                                        padding: '0 10px' // Add some padding if needed
                                                    }}
                                                >{card.Answer}</p>
                                            </>
                                        )}
                                    </div>
                                    <div
                                        className="card-footer d-flex justify-content-end"
                                        style={{
                                            backgroundColor: '#E6E1F5',
                                            borderTop: '1px solid #D3D3D3',
                                        }}
                                    >
                                        <div className="d-flex">
                                            {card.isEditing ? (
                                                <>
                                                    <button
                                                        className="btn btn-sm me-2"
                                                        style={{ backgroundColor: '#9B59B6', color: '#FFFFFF' }}
                                                        onClick={() => handleUpdateClick(card)}
                                                    >
                                                        Update
                                                    </button>
                                                    <button
                                                        className="btn btn-sm"
                                                        style={{ backgroundColor: '#D3D3D3', color: '#353839' }}
                                                        onClick={() => handleCancelEdit(card.CardId)}
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        className="btn btn-sm me-2"
                                                        style={{ backgroundColor: '#D3D3D3', color: '#353839' }}
                                                        onClick={() => handleEditClick(card.CardId)}
                                                    >
                                                        <i className="bi bi-pen"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm"
                                                        style={{ backgroundColor: '#DE6464', color: '#FFFFFF' }}
                                                        onClick={() => {
                                                            const isConfirmed = window.confirm("Are you sure you want to delete this card?");
                                                            if (isConfirmed) deleteCard(card.CardId);
                                                        }}
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {message && (
                    <div
                        className="alert mt-4"
                        role="alert"
                        style={{
                            backgroundColor: messageType === 'success' ? '#D4EDDA' : '#F8D7DA',
                            color: messageType === 'success' ? '#155724' : '#721C24',
                            borderColor: messageType === 'success' ? '#C3E6CB' : '#F5C6CB',
                        }}
                    >
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}

export default FlashCardDeckView;