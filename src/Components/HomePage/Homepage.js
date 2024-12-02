import React, { useEffect } from 'react';
import LandingSection from './LandingSection';

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation, useNavigate } from 'react-router-dom';

const Homepage = ({ Authenticated }) => {
  useEffect(() => {
    const HasToBeDisplayed = localStorage.getItem('HasToBeDisplayed')
    if (HasToBeDisplayed === null) {
      setTimeout(() => {
        toast.success('Login Successfully');
      }, 100)
    }
    localStorage.setItem('HasToBeDisplayed', 'false')
  }, []);

  return (
    <>
      <LandingSection ></LandingSection>

    </>
  );
};

export default Homepage;
