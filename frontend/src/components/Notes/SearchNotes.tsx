import { Token, storeToken, retrieveToken, deleteToken } from "../../tokenStorage.tsx";
import { useState, useEffect } from 'react';
import { buildPath } from '../Path.tsx';
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

function SearchNotes() {
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
    const [notesList, setNotesList] = useState<Array<[number, number, string, number]>>([]);
    const [search, setSearchValue] = useState('');
    const [loading, setLoading] = useState(false); // Loading state

    interface SearchNotesResponse {
        results: Array<[number, number, string, number]>;
        error: string;
        jwtToken: Token;
    }

    interface AddNoteResponse {
        error: string;
        jwtToken: Token;
    }

    interface DeleteNoteResponse {
        error: string;
        jwtToken: Token;
    }

    // Get current user information
    let _ud: any = localStorage.getItem('user_data');
    let ud = JSON.parse(_ud);
    let userId: string = ud.id;

    // Fetch all notes when the component first loads
    useEffect(() => {
        fetchAllNotes();
    }, []); // Empty dependency array ensures this runs only once on mount

    // Handle search text change
    function handleSearchTextChange(e: any): void {
        setSearchValue(e.target.value);
    }

    // Auto-search when search value changes
    useEffect(() => {
        if (search.trim() === "") {
            fetchAllNotes(); // Fetch all notes if the search query is empty
        } else {
            searchNotes(); // Perform a search if there's a query
        }
    }, [search]); // Trigger useEffect when `search` changes

    // Function to fetch all notes
    async function fetchAllNotes(): Promise<void> {
        setLoading(true); // Start loading
        let obj = { userId: userId, search: "", jwtToken: retrieveToken() }; // Empty search query to fetch all notes
        let js = JSON.stringify(obj);

        const config: AxiosRequestConfig = {
            method: 'post',
            url: buildPath('api/search_notes'),
            headers: {
                'Content-Type': 'application/json'
            },
            data: js
        };

        axios(config)
            .then(function (response: AxiosResponse<SearchNotesResponse>) {
                const res = response.data;

                console.log(res)

                if (res.jwtToken == null) {
                    setMessage("JWT Token no longer valid... Unable to refresh token " + res.error);
                    deleteToken();
                    localStorage.removeItem("user_data");
                    window.location.href = "/";
                } else {
                    setNotesList(res.results); // Update the note list with all results
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

    // Function to search notes based on the query
    async function searchNotes(): Promise<void> {
        setLoading(true); // Start loading
        let obj = { userId: userId, search: search, jwtToken: retrieveToken() };
        let js = JSON.stringify(obj);

        const config: AxiosRequestConfig = {
            method: 'post',
            url: buildPath('api/search_notes'),
            headers: {
                'Content-Type': 'application/json'
            },
            data: js
        };

        axios(config)
            .then(function (response: AxiosResponse<SearchNotesResponse>) {
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

                    setNotesList(res.results); // Update the note list with search results
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

    // Function to add new note
    async function addNote( title: string ): Promise<void> {
        setLoading(true); // Start loading
        let obj = { userId: userId, title: title, body: "", jwtToken: retrieveToken() };
        let js = JSON.stringify(obj);

        const config: AxiosRequestConfig = {
            method: 'post',
            url: buildPath('api/create_note'),
            headers: {
                'Content-Type': 'application/json'
            },
            data: js
        };

        axios(config)
            .then(function (response: AxiosResponse<AddNoteResponse>) {
                const res = response.data;

                if (res.jwtToken == null) {
                    setMessage("JWT Token no longer valid... Unable to refresh token " + res.error);
                    deleteToken();
                    localStorage.removeItem("user_data");
                    window.location.href = "/";
                }
                else if (res.error != "") {
                    setMessage("Unable to create note " + res.error);
                }
                else {
                    // Note added successfully, update the note list
                    fetchAllNotes();
                    setSearchValue("");
                    setMessage("Note added successfully.");
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

    // Function to delete note
    async function deleteNote( noteId: number ): Promise<void> {
        setLoading(true); // Start loading
        let obj = { userId: userId, noteId: noteId, jwtToken: retrieveToken() };
        let js = JSON.stringify(obj);

        const config: AxiosRequestConfig = {
            method: 'post',
            url: buildPath('api/delete_note'),
            headers: {
                'Content-Type': 'application/json'
            },
            data: js
        };

        axios(config)
            .then(function (response: AxiosResponse<DeleteNoteResponse>) {
                const res = response.data;

                if (res.jwtToken == null) {
                    setMessage("JWT Token no longer valid... Unable to refresh token " + res.error);
                    deleteToken();
                    localStorage.removeItem("user_data");
                    window.location.href = "/";
                }
                else if (res.error != "") {
                    setMessage("Unable to delete note " + res.error);
                }
                else {
                    // Note deleted successfully, update the note list
                    setNotesList(prevNoteList => prevNoteList.filter(note => note[1] !== noteId)); // Remove the deleted note
                    setMessage("Note deleted successfully.");
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
            <h1 className="text-center mb-4" style={{ color: '#4A4A4A' }}>Notes</h1>

            {/* Search Bar and Add New Note Button */}
            <div className="d-flex align-items-center mb-4 gap-3">
                {/* Search Bar */}
                <input
                    type="text"
                    className="form-control shadow-sm flex-grow-1"
                    placeholder="Search or add note"
                    onChange={handleSearchTextChange}
                    value={search}
                    style={{
                        borderColor: '#D3D3D3',
                        backgroundColor: '#FFFFFF',
                        color: '#4A4A4A',
                    }}
                />

                {/* Add New Note Button */}
                <button
                    className="btn shadow-sm"
                    style={{
                        backgroundColor: '#7E24B9', // Logo Purple
                        color: '#FFFFFF', // White text
                        border: 'none', // Remove default border
                        flexShrink: 0, // Prevent button from shrinking
                    }}
                    onClick={() => {
                        // Handle "Add New Note" button click
                        if (search != "")
                        {
                            addNote(search);
                        }
                    }}
                >
                    <i className="bi bi-plus-lg me-2"></i> {/* Plus icon */}
                    Add New Note
                </button>
            </div>

            {/* No Results Message */}
            {!loading && notesList.length === 0 && (
                <p className="text-center mt-4" style={{ color: '#4A4A4A' }}>No notes found... You can add it with the "Add note" button</p>
            )}

            {/* Note Cards */}
            <div className="row">
                {notesList.map((note, index) => (
                    <div key={index} className="col-md-4 d-flex" style={{ height: "400px", width: "300px", marginTop: "25px" }}>
                        <div
                            className="card shadow-sm h-300 d-flex flex-column"
                            style={{
                                borderColor: '#D3D3D3',
                                color: '#4A4A4A',
                                flex: '1',
                                padding: '0',
                                cursor: 'pointer',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                // Lined paper background
                                backgroundImage: 'linear-gradient(#E7E7E7 1px, transparent 1px)',
                                backgroundSize: '100% 24px', // Line spacing
                                backgroundPosition: '0 40px', // Start lines below header
                                position: 'relative',
                                borderLeft: '40px solid #7E24B9', // Margin area
                                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)', // Inner shadow for depth
                            }}
                            onClick={() => {
                                console.log(`Clicked on note: ${note[1]}`);
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2), inset 0 0 10px rgba(0,0,0,0.1)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1), inset 0 0 10px rgba(0,0,0,0.1)';
                            }}
                        >
                            {/* Margin area decoration */}
                            <div style={{
                                position: 'absolute',
                                left: '-35px',
                                top: '0',
                                height: '100%',
                                width: '30px',
                                backgroundColor: '#7E24B9',
                                backgroundSize: '100% 24px',
                                opacity: '0.6'
                            }}></div>
                            
                            {/* Card Body */}
                            <div className="card-body d-flex flex-column justify-content-center align-items-center text-center" 
                                style={{
                                    padding: '20px',
                                    background: 'linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 100%)'
                                }}>
                                <h5 className="card-title" style={{ 
                                    color: '#7E24B9',
                                    fontSize: '2rem',
                                    marginBottom: '15px'
                                }}>{note[2]}</h5>
                                <p className="card-text" style={{
                                    fontSize: '1.2rem',
                                    marginLeft: '10px'
                                }}>{note[3]} line(s)</p>
                            </div>

                            {/* Card Footer */}
                            <div
                                className="card-footer d-flex justify-content-end"
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
                                            e.stopPropagation();
                                            console.log(`Edit note: ${note[0]}`);
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
                                            e.stopPropagation();
                                            const isConfirmed = window.confirm("Are you sure you want to delete this note?");
                                            if (isConfirmed) {
                                                deleteNote(note[1]);
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

export default SearchNotes;