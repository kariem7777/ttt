import { NavLink } from 'react-router-dom'
import './signUpPage.css'
import React, { useEffect, useRef, useState } from "react";
import { auth, provider } from "../config/firebase"
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth"
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import googleIcon from "../a.jpg"
const SingPage = () => {
  const [email, setMail] = useState("");
  const [password, setPassword] = useState("");
  const EmailRef = useRef(null);
  const PasswordRef = useRef(null);
  const EmailErrorMsg = useRef(null);
  const PasswordErrorMsg = useRef(null)
  const navigate = useNavigate();

  const showToastErrorMessage = () => {
    toast.error("Invalid Email or Password, Please try again");
  };

  useEffect(() => {
    EmailErrorMsg.current.style.display = 'none';
    PasswordErrorMsg.current.style.display = 'none';
  }, [])
  useEffect(() => {
    if (email != "") {
      EmailRef.current.style.border = '1px solid black'
      EmailErrorMsg.current.style.display = 'none';
    } if (password != "") {
      PasswordRef.current.style.border = '1px solid black'
      PasswordErrorMsg.current.style.display = 'none';
    }
  }, [email, password])
  const signInGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  }
  const signIn = async () => {
    if (email == "") {
      EmailRef.current.style.border = "1px solid red";
      EmailErrorMsg.current.style.display = 'block';

      console.log("no Way");
      return;
    }
    if (password == "") {
      PasswordRef.current.style.border = "1px solid red";
      PasswordErrorMsg.current.style.display = 'block';
      return;
    }
    try {
      const re = await signInWithEmailAndPassword(auth, email, password);
      localStorage.clear();
      navigate('/');
    } catch (err) {
      showToastErrorMessage();
    }
  }



  return (
    <div className={`container-fluid DP pl-0  DPWhite `}>
      <section className={`row d-flex flex-column justify-content-center align-items-center `}>
        <div className='row p-5 pt-2 mt-5'>
          <ToastContainer position='bottom-center' />
          <h3>Login </h3>
        </div>
        <div className='row mb-2 d-flex flex-column '>
          <input ref={EmailRef} className={`iinput `} placeholder='Email ' onChange={(e) => { setMail(e.target.value) }} required minLength="7"></input>
          <p ref={EmailErrorMsg} className=' text-right redText'> Enter Email </p>
        </div>
        <div className='row mb-5 d-flex flex-column '>
          <input ref={PasswordRef} type='password' className='iinput' placeholder='Password' onChange={(e) => { setPassword(e.target.value) }} required></input>
          <p ref={PasswordErrorMsg} className='  text-right redText'> enter password </p>
        </div>
        <div className='row '>
          <button onClick={signIn} className={`btn bttn  mb-2 `}>Login </button>
        </div>
        <div className='row '>
          <button onClick={signInGoogle} className={`btn bttn mb-2`}> log in <img className='GoogleImg' src={googleIcon} /></button>
        </div>

        <div className='row '>
          <p className=' mb-2 mt-3'>Don't have an Account
            <NavLink to={'/SignUp'} >    Register  </NavLink>
          </p>
        </div>
      </section>
      <div className='DPLeftImage2'></div>
    </div>
  )
}





export default SingPage