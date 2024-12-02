import React, { useEffect, useState } from 'react';
import { collection, deleteDoc, setDoc, getDocs, updateDoc, doc, arrayUnion, arrayRemove, addDoc } from "firebase/firestore";
import { auth, db, realtimeDb } from '../../config/firebase'; // Import auth and db from your config
import { useNavigate } from 'react-router-dom'; // Assuming you're using react-router for navigation
import './landingSection.css';
import { getDatabase, ref, set } from "firebase/database";  // Make sure this import is included

const LandingSection = () => {
  const [channels, setChannels] = useState([]);
  const [userId, setUserId] = useState(null); // State to store the user ID
  const [userName, setUserName] = useState(""); // State to store the user name (optional)
  const [newChannelName, setNewChannelName] = useState(""); // State to store the new channel name
  const [showAddChannelForm, setShowAddChannelForm] = useState(false); // State to toggle the channel form visibility
  const navigate = useNavigate();

  // Function to get all documents from a collection
  const getAllDocuments = async (collec) => {
    let docs = [];
    const querySnapshot = await getDocs(collection(db, collec));
    querySnapshot.forEach((doc) => {
      docs.push(doc.data());
    });
    return docs;
  }

  // Function to check if user is subscribed to the channel
  const isUserSubscribed = (subscribers) => {
    if (Array.isArray(subscribers)) {
      return subscribers.some(subscriber => subscriber.ID === userId);
    } else if (typeof subscribers === 'object' && subscribers !== null) {
      return subscribers.ID === userId;
    }
    return false;
  }

  // Function to handle the user subscription to a channel or unsubscribe
  const handleSubscribe = async (ChannelName, subscribers) => {
    const user = auth.currentUser;
    if (user) {
      const userData = { Name: user.displayName || "User", ID: user.uid };

      const channelRef = doc(db, "Channels", ChannelName);

      if (isUserSubscribed(subscribers)) {
        // Unsubscribe user if already subscribed
        await updateDoc(channelRef, {
          subscribers: arrayRemove(userData)
        });
      } else {
        // Subscribe user if not already subscribed
        await updateDoc(channelRef, {
          subscribers: arrayUnion(userData)
        });
      }

      // Fetch the updated channels
      const updatedChannels = await getAllDocuments("Channels");
      setChannels(updatedChannels);
    }
  };

  // Function to add a new channel
  const handleAddChannel = async () => {
    const user = auth.currentUser;
    if (newChannelName.trim() !== "") {
      // Add the new channel to Firestore
      await setDoc(doc(db, "Channels", newChannelName), {
        Name: newChannelName,
        subscribers: [],
        Owner: user.uid
      });

      // Initialize the new channel in Realtime Database
      const channelRef = ref(realtimeDb, `channels/${newChannelName}`);
      await set(channelRef, {
        Name: newChannelName,
        messages: ["s"], // Initialize an empty messages list
      });
      // Reset the form and fetch updated channels
      setNewChannelName("");
      setShowAddChannelForm(false);
      const updatedChannels = await getAllDocuments("Channels");
      setChannels(updatedChannels);
    }
  };

  // useEffect to get the user ID from auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUserId(user.uid);
        setUserName(user.displayName || "User");
      } else {
        setUserId(null);
        setUserName("");
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  // useEffect to fetch documents when the component mounts
  useEffect(() => {
    const fetchDocuments = async () => {
      const fetchedChannels = await getAllDocuments("Channels");
      setChannels(fetchedChannels);
    };

    fetchDocuments();
  }, []);

  // Function to navigate to the chat room
  const handleNavigate = (channelName) => {
    navigate(`/chat/${channelName}`);
  }
  const handleRemoveChannel = async (channelId) => {
    const channelRef = doc(db, "Channels", channelId);

    // Remove the channel document from Firestore
    await deleteDoc(channelRef);

    // Remove the channel from the user's list of created channels
    const userRef = doc(db, "Users", userId);
    await updateDoc(userRef, {
      channels: arrayRemove(channelId)
    });

    // Fetch the updated channels after removal
    const updatedChannels = await getAllDocuments("Channels");
    setChannels(updatedChannels);
  };
  return (
    <div className="container-fluid" style={{ marginTop: "49px" }}>
      <h1>Channels</h1>
      <div id="channels">
        {channels.map((channel, index) => (
          <div key={index}>
            <h3>{channel.Name}</h3>

            {/* Show Subscribe/Unsubscribe button */}
            {isUserSubscribed(channel.subscribers) ? (
              <button onClick={() => handleSubscribe(channel.Name, channel.subscribers)}>
                Unsubscribe from {channel.Name}
              </button>
            ) : (
              <button onClick={() => handleSubscribe(channel.Name, channel.subscribers)}>
                Subscribe to {channel.Name}
              </button>
            )}

            {/* Show Go to Chat button if user is subscribed */}
            {isUserSubscribed(channel.subscribers) && (
              <button onClick={() => handleNavigate(channel.Name)}>
                Go to {channel.Name} chat
              </button>
            )}

            {/* Show Remove button if the user is the creator of the channel */}
            {channel.Owner === userId && (
              <button onClick={() => handleRemoveChannel(channel.Name)}>
                Remove {channel.Name}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Button to show the form to add a new channel */}
      <button onClick={() => setShowAddChannelForm(!showAddChannelForm)}>
        {showAddChannelForm ? "Cancel" : "Add New Channel"}
      </button>

      {/* Form to add a new channel */}
      {showAddChannelForm && (
        <div>
          <input
            type="text"
            value={newChannelName}
            onChange={(e) => setNewChannelName(e.target.value)}
            placeholder="Enter new channel name"
          />
          <button onClick={handleAddChannel}>Create Channel</button>
        </div>
      )}
    </div>
  );
}

export default LandingSection;
