import './navbar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMoon, faUserPlus, faBars, faSignOutAlt, faSun } from '@fortawesome/free-solid-svg-icons';

import { NavLink } from 'react-router-dom'
import { auth, authstate } from "../config/firebase"
import { signOut } from 'firebase/auth';
import { useState, useEffect } from 'react';

const Navbar = ({ Authenticated, setAuth }) => {

    useEffect(() => {
        const listener = authstate(auth, (user) => {
            if (user) {
                setAuth(user);

            } else {
                setAuth(null);
            }

        })
        return () => { listener(); }
    }, [])

    const SignOut = async () => {
        try {
            const ers = await signOut(auth);
            console.log(ers);
        } catch (e) {
            console.error(e);
        }
    }

    return (

        <nav className={`fixed-top  navbar navbar-expand-lg navbar-light bg-light `}>
            <NavLink to={"/"} className='d-none d-lg-block'>

            </NavLink>
            {/* Button used to toggle the Navbar to  open and close it ; when the screen is minimized */}
            <button className="navbar-toggler toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <FontAwesomeIcon icon={faBars} className={` icon iconsize `} />
            </button>
            <div className='d-flex d-block d-lg-none'>
                <FontAwesomeIcon icon={faSun} className={` icon icon20 `} />
                {
                    Authenticated === null ?
                        (
                            <NavLink to={"/SignUp"}>
                                <FontAwesomeIcon icon={faUserPlus} className={` icon icon20 mr-4 `} />
                            </NavLink>
                        ) :
                        (

                            <FontAwesomeIcon onClick={SignOut} icon={faSignOutAlt} className={` icon icon20 mr-4 `} />

                        )
                }


            </div>
            <div className="collapse navbar-collapse " id="navbarSupportedContent">
                <NavLink to={"/"}>
                </NavLink>
                {
                    Authenticated === null ?
                        (
                            <>
                                <ul className={` navbar-nav ml-auto  p-0 alignRight`} >
                                    <li className="nav-item active ml-3">
                                        <NavLink className="nav-link" to={"/Examples"}>أمثلة توضيحية</NavLink>
                                    </li>
                                    <li className="nav-item active ml-3">
                                        <NavLink className="nav-link" to={"/Gallarey"}>بنية باستخدام (عرب)</NavLink>
                                    </li>
                                    <li className="nav-item active ml-3">
                                        <a className="nav-link " href="#">مرجع (عرب)</a>
                                    </li>
                                    <li className="nav-item active ml-3">
                                        <NavLink className="nav-link " to={"/AboutArab"}>عن عرب</NavLink>
                                    </li>
                                </ul>
                            </>
                        )
                        :
                        (
                            <>
                                <ul className={` navbar-nav ml-auto  p-0 alignRight`} >
                                    <li className="nav-item active ml-3">
                                        <NavLink className="nav-link" to={"/Development"}>منصة التطوير </NavLink>
                                    </li>
                                    <li className="nav-item active ml-3">
                                        <NavLink className="nav-link" to={"/Examples"}>أمثلة توضيحية</NavLink>
                                    </li>
                                    <li className="nav-item active ml-3">
                                        <NavLink className="nav-link" to={"/Gallarey"}>بنية باستخدام (عرب)</NavLink>
                                    </li>
                                    <li className="nav-item active ml-3">
                                        <a className="nav-link " href="#">مرجع (عرب)</a>
                                    </li>
                                    <li className="nav-item active ml-3">
                                        <NavLink className="nav-link " to={"/Exercises"}>التمارين</NavLink>
                                    </li>
                                    <li className="nav-item active ml-3">
                                        <NavLink className="nav-link " to={"/AboutArab"}>عن عرب</NavLink>
                                    </li>
                                </ul>
                            </>
                        )
                }
            </div>
            <div className='d-none d-lg-block'>
                <ul className={` navbar-nav lastNav mt-2`}>
                    <li className={`nav-item my-auto  icon`}>
                        <FontAwesomeIcon icon={faSun} className="iconsize" />
                    </li>
                    {
                        Authenticated === null ?
                            (
                                <>
                                    <li className="nav-item active">
                                        <NavLink className="nav-link" to={'/SignIn'}>تسجيل الدخول</NavLink>
                                    </li>
                                    <li className="nav-item ">
                                        <NavLink to={"\SignUp"}>
                                            <button className={` btn`}>انشاء حساب</button>
                                        </NavLink>
                                    </li>
                                </>
                            )
                            :
                            (
                                <li className="nav-item ">
                                    <button onClick={SignOut} className={` btn`}> تسجيل خروج</button>
                                </li>
                            )
                    }

                </ul>
            </div>
        </nav>
    )
}

export default Navbar