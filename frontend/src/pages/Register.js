import React, { useState } from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import "./register.css";

const Register = () => {

    const [popupStyle, showPopup] = useState("hide")

    const popup = () => {
      showPopup("login-popup")
      setTimeout(() => showPopup("hide"), 3000)
    }

    return (
        <div className="wrapper-class">
            <div className="cover">
                <h1>Sign Up</h1>
                <input type="text" placeholder="Username" />
                <input type="password" placeholder="Password" />
                <div className="login-btn" onClick={popup}>Create Account</div>

                <p className="register-text">Go back to <Link to="/login">Login</Link></p>

                <p className="text">Or Create an Account Using</p>

                <div className="alt-login">
                    <div className="facebook"></div>
                    <div className="google"></div>
                </div>

                <div className={popupStyle}>
                  <h3>Login Failed</h3>
                  <p>Username or password incorrect</p>
                </div>
            </div>
        </div>
    );
}

export default Register;
