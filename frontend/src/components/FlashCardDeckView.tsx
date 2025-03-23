import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { retrieveToken } from '../tokenStorage';

interface FlashCard {
    CardId: number;
    DeckId: number;
    Question: string;
    Answer: string;
}

const FlashCardDeckView: React.FC = () => {
    const { deckId } = useParams<{ deckId: string }>();
    const [flashcards, setFlashcards] = useState<FlashCard[]>([]);
    const [newQuestion, setNewQuestion] = useState('');
    const [newAnswer, setNewAnswer] = useState('');

    // Get current user information
    let _ud: any = localStorage.getItem('user_data');
    let ud = JSON.parse(_ud);
    let userId: string = ud.id;

    useEffect(() => {
        fetchAllCards();
    }, [deckId]);

    // Function to search decks based on the query
    async function fetchAllCards(): Promise<void> {
        let obj = { userId: userId, search: "", jwtToken: retrieveToken() };
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

    // const handleDelete = async (cardId: number) => {
    //     try {
    //         await axios.delete(`/api/flashcards/${cardId}`);
    //         fetchFlashcards();
    //     } catch (error) {
    //         console.error('Error deleting flashcard:', error);
    //     }
    // };

    // const handleEdit = (cardId: number) => {
    //     history.push(`/edit-flashcard/${cardId}`);
    // };

    // const handleAddFlashcard = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     try {
    //         // await axios.post('/api/flashcards', {
    //         //     DeckId: parseInt(deckId),
    //         //     Question: newQuestion,
    //         //     Answer: newAnswer
    //         // });
    //         // setNewQuestion('');
    //         // setNewAnswer('');
    //         // fetchFlashcards();
    //     } catch (error) {
    //         console.error('Error adding flashcard:', error);
    //     }
    // };

    return (
        <div style={{ padding: '20px' }}>
            <button
                style={{ backgroundColor: 'green', color: 'white', padding: '10px 20px', marginBottom: '20px' }}
                onClick={() => console.log("pressed play") }
            >
                Play
            </button>

            <div>
                {flashcards.map((card) => (
                    <div key={card.CardId} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #D3D3D3', borderRadius: '5px' }}>
                        <h3>{card.Question}</h3>
                        <p>{card.Answer}</p>
                        <button onClick={() => console.log("pressed edit")} style={{ marginRight: '10px' }}>Edit</button>
                        <button onClick={() => console.log("pressed delete")}>Delete</button>
                    </div>
                ))}
            </div>

            <form onSubmit={() => {}} style={{ marginTop: '20px' }}>
                <input
                    type="text"
                    placeholder="Question"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    required
                    style={{ marginRight: '10px', padding: '5px' }}
                />
                <input
                    type="text"
                    placeholder="Answer"
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    required
                    style={{ marginRight: '10px', padding: '5px' }}
                />
                <button type="submit" style={{ padding: '5px 10px' }}>Add Flashcard</button>
            </form>
        </div>
    );
};

export default FlashCardDeckView;