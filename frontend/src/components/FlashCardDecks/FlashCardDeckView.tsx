import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { deleteToken, retrieveToken, storeToken, Token } from '../../tokenStorage';
import { buildPath } from '../Path';


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
	
	let initialTitleElement: HTMLElement | null;
	let initialTextElement: HTMLElement | null;

    // Get current user information
    let _ud: any = localStorage.getItem('user_data');
    let ud = JSON.parse(_ud);
    let userId: string = ud.id;
    
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

    // interface UpdateFlashCardResponse {
        // cardId: number,
        // error: string,
        // jwtToken: Token,
    // }

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

    // // Function to update card
    // async function updateCard( card: FlashCard ): Promise<void> {
        // let obj = { userId: userId, deckId: card.DeckId, cardId: card.CardId, question: card.Question, answer: card.Answer, jwtToken: retrieveToken() };
        // let js = JSON.stringify(obj);

        // const config: AxiosRequestConfig = {
            // method: 'post',
            // url: buildPath('api/update_flashcard'),
            // headers: {
                // 'Content-Type': 'application/json'
            // },
            // data: js
        // };

        // axios(config)
            // .then(function (response: AxiosResponse<UpdateFlashCardResponse>) {
                // const res = response.data;

                // if (res.jwtToken == null) {
                    // setMessage("JWT Token no longer valid... Unable to refresh token " + res.error);
                    // deleteToken();
                    // localStorage.removeItem("user_data");
                    // window.location.href = "/";
                // }
                // else if (res.error != "") {
                    // setMessage("Unable to update deck " + res.error);
                // }
                // else {
                    // // Deck updated successfully, update the deck list
                    // // setFlashcards(prevCardList => prevCardList.filter(card => card.CardId !== cardId)); // Remove the deleted deck
                    // setMessage("Card updated successfully.");
                    // setMessageType('error');
                // }
            // })
            // .catch(function (error) {
                // alert(error.toString());
            // })
    // }
	
	function showModificationButtons(card: FlashCard) : void {
		let saveButton = document.getElementById("save-button-"+card.CardId);
		let cancelButton = document.getElementById("cancel-button-"+card.CardId);

		if (saveButton && cancelButton){
			saveButton.style.visibility = "visible";
			cancelButton.style.visibility = "visible";
		}
		
		else {
			console.log("Could not show modification buttons.");
		}
	}	
	
	function hideModificationButtons(card: FlashCard) : void {
		let saveButton = document.getElementById("save-button-"+card.CardId);
		let cancelButton = document.getElementById("cancel-button-"+card.CardId);
		
		if (saveButton && cancelButton){
			saveButton.style.visibility = "hidden";
			cancelButton.style.visibility = "hidden";
		}
		
		else {
			console.log("Could not hide modification buttons.");
		}
	}
	
	// Command should either be "disable" or "enable".
	function toggleEditButtons(command: string) : void {
		const editButtons = document.querySelectorAll("edit-buttons");

		let booleanVal: string = "true";
		
		if (command !== null)
		{
			booleanVal = (command === "disable") ? "true" : "false";
		}
		
		if (editButtons != null)
		{
			for (let i = 0; i < editButtons.length; i++)
			{
				editButtons[i].setAttribute("disabled", booleanVal);
			}
			return;
		}
		
		else
		{
			console.log("Could not toggle edit buttons.");
		}
	}
	
	function modifyCardFace(card: FlashCard, command: string) : void {
		
		if (card != null)
		{
			let idQuestion: string = "card-"+card.CardId+"-title";
			let idAnswer: string = "card-"+card.CardId+"-text";
			let idCard: string = "card-"+card.CardId+"-body";
			
			// Current elements.
			let initialQuestion: HTMLElement | null = document.getElementById(idQuestion);
			let initialAnswer: HTMLElement | null = document.getElementById(idAnswer);
			let singleCard: HTMLElement | null = document.getElementById(idCard);
			
			//
			// edit
			// 		change flat text to modifiable (createElement).
			// 		keep original text.
			//
			// cancel
			// 		change modifiable text to flat.
			// 		keep original text.
			//
			// update
			// 		change modifiable text to flat.
			// 		keep updated text.
			//
			if (initialQuestion !== null && initialAnswer !== null && singleCard !== null)
			{
				// Store initial elements.
				if (command === "edit")
				{
					initialTitleElement = initialQuestion;
					initialTextElement = initialAnswer;
				}
				
				if (initialTitleElement !== null && initialTextElement !== null)
				{
					// Use textareas or the original elements.
					let updatedQuestion: HTMLElement | null;
					let updatedAnswer: HTMLElement| null;
					
					let valueQuestion: Text | null;
					let valueAnswer: Text | null;
					
					// Textareas with original text.
					if (command === "edit")
					{
						updatedQuestion = document.createElement("textarea");
						updatedAnswer = document.createElement("textarea");
						
						valueQuestion = document.createTextNode(card.Question);
						valueAnswer = document.createTextNode(card.Answer);
					}
					
					// "Flat" areas with updated text.
					else if (command === "update")
					{
						updatedQuestion = initialTitleElement;
						updatedAnswer = initialTextElement;
						
						valueQuestion = document.createTextNode(initialQuestion.innerText);
						valueAnswer =  document.createTextNode(initialAnswer.innerText);
					}
					
					// "Flat" areas with original text.
					else // (command === "cancel")
					{
						updatedQuestion = initialTitleElement;
						updatedAnswer = initialTextElement;
						
						valueQuestion = document.createTextNode(card.Question);
						valueAnswer =  document.createTextNode(card.Answer);
					}
					
					
					if (updatedQuestion !== null && updatedAnswer !== null)
					{
						// Set attributes for updated elements.
						// Mainly used to give the textareas the same
						// ids as the original elements.
						// if (command === "update")
						// {
							updatedQuestion.id = idQuestion;
							updatedAnswer.id = idAnswer;
						// }
						
						if (valueQuestion !== null && valueAnswer !== null)
						{
							// Add text to updated elements.
							updatedQuestion.appendChild(valueQuestion);
							updatedAnswer.appendChild(valueAnswer);
							
							// Replace.
							singleCard.replaceChild(updatedQuestion, initialQuestion);
							singleCard.replaceChild(updatedAnswer, initialAnswer);
							return;
						}
					}
				}
			
			}
		}
		
		if (command === "cancel"){
			console.log("Could not remove input fields.");
		} else if (command === "edit"){
			console.log("Could not add input fields.");
		} else if (command === "update"){
			console.log("Could not remove input fields and update card.");
		}
		
	}
	
	function doEditActions(card: FlashCard) : void {
		showModificationButtons(card);
		toggleEditButtons("disable");
		modifyCardFace(card, "edit");
	}
	
	function doCancelActions(card: FlashCard) : void {
		hideModificationButtons(card);
		modifyCardFace(card, "cancel");
		toggleEditButtons("disable");
	}
	
	function doUpdateActions(card: FlashCard) : void {
		hideModificationButtons(card);
		modifyCardFace(card, "update");
		// updateCard(card);
		toggleEditButtons("enable");
	}
	
    return (
        <div className="d-flex flex-column min-vh-100">
        <div className="container mt-5">
            {/* Title */}
            <h1 className="text-center mb-4" style={{ color: '#4A4A4A' }}>{ deckTitle }</h1>

            {/* Review Button */}
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
                            type="button" 
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

            <div 
                style={{
                    maxHeight: 'calc(100vh - 400px)',
                    overflowY: 'auto', // Make div scrollable
                    overflowX: 'hidden',
                    paddingRight: '10px', // Space for scrollbar
                    marginTop: '20px',
                    paddingBottom: '50px'
                }}
            >
                {/* Flashcards List */}
                <div className="row">
                    {flashcards.map((card) => (
                        <div key={card.CardId} className="col-md-4 d-flex" style={{ height: "200px", marginTop: "25px" }}>
                            {/* Card */}
                            <div
                                className="card shadow-sm h-100 d-flex flex-column"
								id="card-list"
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
                                <div className="card-body d-flex flex-column justify-content-center align-items-center text-center" id={"card-"+card.CardId+"-body"}>
                                <h5 className="card-title" id={"card-"+card.CardId+"-title"} style=
                                    {{ 
                                        color: '#7E24B9',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        width: '100%',
                                        maxWidth: '100%',
                                        padding: '0 10px' // Add some padding if needed
                                    }}
                                >
                                    {card.Question}
                                </h5>
                                <p className="card-text" id={"card-"+card.CardId+"-text"} style=
                                    {{
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        width: '100%',
                                        maxWidth: '100%',
                                        padding: '0 10px' // Add some padding if needed
                                    }}
                                >
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
                                    {/* Update, Cancel, Edit & Delete Buttons */}
                                    <div className="d-flex">
										<button
											id={"update-button-"+card.CardId}
											className="btn btn-sm update-buttons"
											style={{
												backgroundColor: '#9B59B6',  // Purple color
												color: '#FFFFFF',
												visibility: 'hidden',  // Hidden by default
											}}
											onClick={(e) => {
												e.stopPropagation(); // Prevent card click event from firing
												console.log("Update changes");
												doUpdateActions(card);
											}}
										>
											Update
										</button>
										<button
											id={"cancel-button-"+card.CardId}
											className="btn btn-sm cancel-buttons"
											style={{
												backgroundColor: '#D3D3D3',  // Grey color
												color: '#353839',
												visibility: 'hidden',  // Hidden by default
											}}
											onClick={(e) => {
												e.stopPropagation(); // Prevent card click event from firing
												console.log("Cancel changes");
												doCancelActions(card);
											}}
										>
											Cancel
										</button>
                                        <button
											id={"edit-button-"+card.CardId}
                                            className="btn btn-sm me-2 edit-buttons"
                                            style={{
                                                backgroundColor: '#D3D3D3',
                                                color: '#353839',
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent card click event from firing
                                                console.log(`Edit deck: ${card.CardId}`);
												doEditActions(card);
                                            }}
                                        >
                                            <i className="bi bi-pen"></i>
                                        </button>
                                        <button
                                            className="btn btn-sm delete-buttons"
                                            style={{
                                                backgroundColor: '#DE6464',
                                                color: '#FFFFFF',
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent card click event from firing
                                                // Show confirmation dialog
                                                const isConfirmed = window.confirm("Are you sure you want to delete this card?");

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
};

export default FlashCardDeckView;