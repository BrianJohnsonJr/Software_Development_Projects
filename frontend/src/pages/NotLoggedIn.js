// NotLoggedIn.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/NotLoggedIn.css';

const NotLoggedIn = () => {
    return (
        <div className="not-logged-in-container">
            <h1>You Are Not Logged In</h1>
            <p>Please log in to access this page.</p>
            <div className="not-logged-in-links">
                <Link to="/login" className="login-link">Login</Link>
                <Link to="/register" className="register-link">Register</Link>
            </div>
        </div>
    );
};

export default NotLoggedIn;
