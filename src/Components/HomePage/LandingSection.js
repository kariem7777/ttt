import React, { useEffect, useState } from 'react';
import { collection, deleteDoc, setDoc, getDocs, updateDoc, doc, arrayUnion, arrayRemove, addDoc } from "firebase/firestore";
import { auth, db, realtimeDb, messaging } from '../../config/firebase'; // Import auth and db from your config
import { useNavigate } from 'react-router-dom'; // Assuming you're using react-router for navigation
import './landingSection.css';
import { getDatabase, ref, set } from "firebase/database";  // Make sure this import is included
import { getToken, onMessage } from 'firebase/messaging';

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
      const token = localStorage.getItem('fcmToken');
      if (isUserSubscribed(subscribers)) {
        // Unsubscribe user if already subscribed
        await updateDoc(channelRef, {
          subscribers: arrayRemove(userData)
        });

        const token = localStorage.getItem('fcmToken');
        if (token) {
          fetch('https://asdas-rust.vercel.app/unsubscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token, topic: ChannelName }),
          })
            .then((response) => response.json())
            .then((data) => {
              console.log('Unsubscribed from topic:', ChannelName);
            })
            .catch((error) => console.error('Error unsubscribing from topic:', error));
        }

      } else {
        // Subscribe user if not already subscribed
        await updateDoc(channelRef, {
          subscribers: arrayUnion(userData)
        });
        if (token) {
          fetch('https://asdas-rust.vercel.app/subscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token, topic: ChannelName }),
          })
            .then((response) => response.json())
            .then((data) => {
              console.log('Subscribed to topic:', ChannelName);

            })
            .catch((error) => console.error('Error subscribing to topic:', error));
        }
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
        const requestPermission = async () => {
          try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
              const token = await getToken(messaging, { vapidKey: 'BF6xqONa9eWPAP4JHGn5XhdJnTszRR5Rm92wIvWfOPscizHj-2Ub2qgtOHetFNkcgUBsLiDpqa5kqJliQUgeSCA' });
              console.log('FCM Token:', token);
              // Save the token to your backend/database here
              localStorage.setItem('fcmToken', token);
            } else {
              console.log('Permission denied');
            }
          } catch (error) {
            console.error('Error getting permission:', error);
          }
        };

        requestPermission();

        onMessage(messaging, (payload) => {
          console.log('Message received. ', payload);

          // Show notification when the app is in the foreground
          const notificationTitle = 'Foreground Title';
          const notificationOptions = {
            body: payload.notification.body,
            icon: payload.notification.icon || '/default-icon.png',
          };

          // Ensure Notification is supported
          if (Notification.permission === 'granted') {
            new Notification(notificationTitle, notificationOptions);
          }
        });
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
    // <div className="container-fluid" style={{ marginTop: "49px" }}>
    //   <h1>Channels</h1>
    //   <div id="channels">
    //     {channels.map((channel, index) => (
    //       <div key={index}>
    //         <h3>{channel.Name}</h3>

    //         {/* Show Subscribe/Unsubscribe button */}
    //         {isUserSubscribed(channel.subscribers) ? (
    //           <button onClick={() => handleSubscribe(channel.Name, channel.subscribers)}>
    //             Unsubscribe from {channel.Name}
    //           </button>
    //         ) : (
    //           <button onClick={() => handleSubscribe(channel.Name, channel.subscribers)}>
    //             Subscribe to {channel.Name}
    //           </button>
    //         )}

    //         {/* Show Go to Chat button if user is subscribed */}
    //         {isUserSubscribed(channel.subscribers) && (
    //           <button onClick={() => handleNavigate(channel.Name)}>
    //             Go to {channel.Name} chat
    //           </button>
    //         )}

    //         {/* Show Remove button if the user is the creator of the channel */}
    //         {channel.Owner === userId && (
    //           <button onClick={() => handleRemoveChannel(channel.Name)}>
    //             Remove {channel.Name}
    //           </button>
    //         )}
    //       </div>
    //     ))}
    //   </div>

    //   {/* Button to show the form to add a new channel */}
    //   <button onClick={() => setShowAddChannelForm(!showAddChannelForm)}>
    //     {showAddChannelForm ? "Cancel" : "Add New Channel"}
    //   </button>

    //   {/* Form to add a new channel */}
    //   {showAddChannelForm && (
    //     <div>
    //       <input
    //         type="text"
    //         value={newChannelName}
    //         onChange={(e) => setNewChannelName(e.target.value)}
    //         placeholder="Enter new channel name"
    //       />
    //       <button onClick={handleAddChannel}>Create Channel</button>
    //     </div>
    //   )}
    // </div>
    <div className="container-fluid mt-4">
      <h4>sd</h4>
      <h1 className="text-center mb-4 ">Channels</h1>
      <div id="channels">
        {channels.map((channel, index) => (
          <div key={index} className="card mb-3 shadow-sm">
            <div className="card-body">
              <h3 className="card-title">{channel.Name}</h3>

              {/* Show Subscribe/Unsubscribe button */}
              <div className="d-flex justify-content-start mb-3">
                {isUserSubscribed(channel.subscribers) ? (
                  <button className="btn btn-danger me-2 m-2" onClick={() => handleSubscribe(channel.Name, channel.subscribers)}>
                    Unsubscribe from {channel.Name}
                  </button>
                ) : (
                  <button className="btn btn-primary me-2 m-2" onClick={() => handleSubscribe(channel.Name, channel.subscribers)}>
                    subscribe to {channel.Name}
                  </button>
                )}

                {/* Show Go to Chat button if user is subscribed */}
                {isUserSubscribed(channel.subscribers) && (
                  <button
                    className="btn btn-success"
                    onClick={() => handleNavigate(channel.Name)}
                  >
                    Go to {channel.Name} chat
                  </button>
                )}
              </div>

              {/* Show Remove button if the user is the creator of the channel */}
              {channel.Owner === userId && (
                <button
                  className="btn btn-outline-danger"
                  onClick={() => handleRemoveChannel(channel.Name)}
                >
                  Remove {channel.Name}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Button to show the form to add a new channel */}
      <div className="text-center mt-4">
        <button
          className={`btn ${showAddChannelForm ? 'btn-secondary' : 'btn-primary'}`}
          onClick={() => setShowAddChannelForm(!showAddChannelForm)}
        >
          {showAddChannelForm ? "Cancel" : "Add New Channel"}
        </button>
      </div>

      {/* Form to add a new channel */}
      {showAddChannelForm && (
        <div className="mt-4 d-flex justify-content-center">
          <div className="w-50">
            <input
              type="text"
              className="form-control mb-2"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              placeholder="Enter new channel name"
            />
            <button
              className="btn btn-success w-100"
              onClick={handleAddChannel}
            >
              Create Channel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingSection;
