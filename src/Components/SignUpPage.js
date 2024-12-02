import './signUpPage.css';
import { NavLink } from 'react-router-dom';
import React, { useEffect, useRef, useState } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { doc, setDoc, collection } from "firebase/firestore";
import { auth, provider, db } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SingPage = () => {
  const [email, setMail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmationPassword, setConfirmationPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const EmailRef = useRef(null);
  const PasswordRef = useRef(null);
  const ConfirmationPasswordRef = useRef(null);
  const DisRef = useRef(null);



  const navigate = useNavigate();

  useEffect(() => {
    [EmailRef, PasswordRef, ConfirmationPasswordRef, DisRef].forEach((ref) => {
      if (ref.current && ref.current.value !== '') {
        ref.current.classList.remove('MissingInput');
      }
    });
  }, [email, password, confirmationPassword, DisRef]);

  const showToastErrorMessage = (message) => {
    toast.error(message);
  };

  const validateAndSignUp = async () => {
    const fields = [
      { ref: EmailRef, value: email, message: 'Email Address is Missing' },
      { ref: PasswordRef, value: password, message: 'Password is missing' },
      { ref: ConfirmationPasswordRef, value: confirmationPassword, message: 'Confimration Password is missing' },
      { ref: DisRef, value: displayName, message: 'Display Name is missing' },
    ];
    fields.forEach(({ ref, value, message }) => {
      if (value === '') {
        ref.current.classList.add('MissingInput');
        showToastErrorMessage(message);
      }
    }
    );

    if (email !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToastErrorMessage('Invalid email format');
      return;
    }

    if (password !== confirmationPassword) {
      showToastErrorMessage('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      showToastErrorMessage('Password must be at least 6 characters');
      return;
    }

    try {
      let credintial = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credintial.user, { displayName });
      await setDoc(doc(db, "Users", credintial.user.uid), {

        Email: email,

      });
      navigate('/');
    } catch (e) {
      console.error(e);
    }
  };

  const signInGoogle = async () => {
    try {
      let credintial = await signInWithPopup(auth, provider);
      await setDoc(doc(db, "Users", credintial.user.uid), {
        channels: [],
        Email: email,

      });
      navigate('/');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={`container-fluid DP pl-0 DPWhite`}>
      <section className={`row d-flex flex-column justify-content-center align-items-center `}>
        <div className='row p-5 pt-2'>
          <ToastContainer position='bottom-center' />
          <h3>انشاء حساب</h3>
        </div>
        <div className='row mb-2'>
          <input
            ref={DisRef}
            className={`iinput `}
            placeholder="Display Name"
            onChange={(e) => setDisplayName(e.target.value)}
          ></input>
        </div>
        <div className='row mb-2'>
          <input
            ref={EmailRef}
            className={`iinput `}
            placeholder='* البريد الالكتروني'
            onChange={(e) => setMail(e.target.value)}
          ></input>
        </div>
        <div className='row mb-2'>
          <input
            ref={PasswordRef}
            type='password'
            className='iinput'
            placeholder='* كملة السر'
            onChange={(e) => setPassword(e.target.value)}
          ></input>
        </div>
        <div className='row mb-5'>
          <input
            ref={ConfirmationPasswordRef}
            className='iinput'
            type='password'
            placeholder='* تأكيد كملة السر'
            onChange={(e) => setConfirmationPassword(e.target.value)}
          ></input>
        </div>
        <div className='row'>
          <button
            onClick={validateAndSignUp}
            className={`btn bttn  mb-2`}
          >
            انشاء حساب جديد
          </button>
        </div>
        <div className='row'>
          <button
            onClick={signInGoogle}
            className={`btn bttn mb-2`}
          >
            تسجيل الدخول <img className='GoogleImg' alt="Google Icon" />
          </button>
        </div>
        <div className='row'>
          <p className='mb-2 mt-3'>
            هل لديك حساب ؟
            <NavLink to={'/SignIn'} >
              تسجيل الدخول{' '}
            </NavLink>
          </p>
        </div>
      </section>
      <div className='DPLeftImage2'></div>
    </div>
  );
};

export default SingPage;
