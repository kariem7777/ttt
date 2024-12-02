// src/components/ChatRoom.js

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // To extract the channel name from the URL
import { collection, deleteDoc, setDoc, getDocs, updateDoc, doc, arrayUnion, arrayRemove, addDoc } from "firebase/firestore";
import { auth, db, realtimeDb } from '../config/firebase'; // Import auth and db from your config
import { useNavigate } from 'react-router-dom'; // Assuming you're using react-router for navigation
import { getDatabase, ref, set, push, get, onChildAdded } from "firebase/database";  // Make sure this import is included

const ChatRoom = () => {
    const { channelName } = useParams(); // Get the channel name from the URL
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [userId, setUserId] = useState("");

    // Fetch messages for the channel
    const fetchMessages = async () => {
        const messagesRef = ref(realtimeDb, `channels/${channelName}/messages`);

        // Listen for changes in the messages (Realtime updates)
        const snapshot = await get(messagesRef);
        if (snapshot.exists()) {
            const fetchedMessages = [];
            snapshot.forEach((childSnapshot) => {
                fetchedMessages.push(childSnapshot.val()); // Push each message into the array
            });
            setMessages(fetchedMessages);

        }
    };

    // Send a new message
    const sendMessage = async () => {
        const user = auth.currentUser;
        if (user && newMessage.trim() !== "") {
            const senderName = user.displayName || "Anonymous"; // Get sender's name from auth

            // Reference to the 'messages' list of the channel in Realtime Database
            const messagesRef = ref(realtimeDb, `channels/${channelName}/messages`);

            // Push the new message (sender name and text) to the 'messages' list
            await push(messagesRef, {
                senderName: senderName,
                text: newMessage,
                senderId: user.uid
            });

            // Clear the message input after sending
            setNewMessage("");
        }
    };
    const listenForNewMessages = () => {
        const messagesRef = ref(realtimeDb, `channels/${channelName}/messages`);

        // Set up listener for new messages being added to the channel
        onChildAdded(messagesRef, (snapshot) => {
            const newMessage = snapshot.val(); // Get the new message


            setMessages((prevMessages) => [...prevMessages, newMessage]);


        });

    };
    useEffect(() => {
        const user = auth.currentUser;

        setUserId(user.uid);
        const fetchInitialMessages = async () => {
            // Fetch existing messages when the component mounts
            await fetchMessages();
        };

        // Fetch initial messages
        fetchInitialMessages();

        // Listen for new messages
        listenForNewMessages();
    }, [channelName]); // Re-run when the channel changes
    // Re-fetch messages when the channel changes
    useEffect(() => {
        const user = auth.currentUser;
        setUserId(user.uid);
    });
    return (
        // <div>
        //     <h1>assad</h1>
        //     <h2>Chat Room: {channelName}</h2>
        //     <div>
        //         {
        //             messages.map((msg, index) => (
        //                 <div key={index}>
        //                     <strong>{msg.senderName}:</strong> {msg.text}
        //                 </div>

        //             ))
        //         }
        //     </div>
        //     <textarea
        //         value={newMessage}
        //         onChange={(e) => setNewMessage(e.target.value)}
        //         placeholder="Type your message"
        //     />
        //     <button onClick={sendMessage}>Send</button>
        // </div>
        <div className="container my-4">
            <h1 className="text-center">Chat Room</h1>
            <h2 className="text-center mb-4">{channelName}</h2>

            <div className="message-list" style={{ maxHeight: "400px", overflowY: "scroll" }}>
                {messages.map((msg, index) => (
                    <div key={index} className={`message-item mb-2 p-2 border rounded ${msg.senderId === userId ? 'bg-info text-white text-right' : ''}`}>
                        <strong>{msg.senderName}: </strong> <span>{msg.text}</span>
                    </div>
                ))}
            </div>

            <div className="d-flex mt-3">
                <textarea
                    className="form-control me-2"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message"
                    rows="3"
                />
                <button className="btn btn-primary" onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
};

export default ChatRoom;
