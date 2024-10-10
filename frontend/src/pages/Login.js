import React, { useState } from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import "./loginform.css";

const Login = () => {

    const [popupStyle, showPopup] = useState("hide")

    const popup = () => {
      showPopup("login-popup")
      setTimeout(() => showPopup("hide"), 3000)
    }

    return (
        <div className="wrapper">
            <div className="cover">
                <h1>Sign In</h1>
                <input type="text" placeholder="Username" />
                <input type="password" placeholder="Password" />
                <div className="login-btn" onClick={popup}>Login</div>

                <p className="register-text">Don't have an account? <Link to="/register">Register here</Link></p>

                <p className="text">Or Login Using</p>

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

export default Login;
