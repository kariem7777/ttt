import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './App.css';
import Navbar from './Components/Navbar';
import './global.css';
import Homepage from './Components/HomePage/Homepage';
import SignUpPage from './Components/SignUpPage';
import SignInPage from './Components/SignInPage';
import ChatRoom from './Components/ChatRoom'; // Chat Room component


function App() {

  const [Authenticated, setAuth] = useState(null);




  return (
    <Router>
      <Navbar Authenticated={Authenticated} setAuth={setAuth} />
      <Routes>
        <Route path="/" element={<Homepage Authenticated={Authenticated} />} />
        <Route path="/chat/:channelName" element={<ChatRoom />} />
        <Route path="/SignUp" element={<SignUpPage />} />
        <Route path="/SignIn" element={<SignInPage />} />

      </Routes>
    </Router>
  );
}

export default App;
