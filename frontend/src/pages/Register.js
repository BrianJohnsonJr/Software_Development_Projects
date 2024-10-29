import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Auth.css';

const Register = () => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [imageUrl, setImageUrl] = useState(''); 
    const [bio, setBio] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }
    
        const userData = {
            name,
            username,
            email,
            password,
            bio,
            imageUrl: imageUrl || "", // Ensure imageUrl is either a value or an empty string
        };
    
        try {
            const response = await fetch('http://localhost:5000/account/register', { // Use full URL for troubleshooting
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
                credentials: 'include',
            });
    
            const data = await response.json();
            if (data.success) {
                navigate('/login');
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <div className="auth-container">
            <h1>Register</h1>
            <form onSubmit={handleRegister}>
                {/* Form fields */}
                <label>Full Name:</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                <label>Username:</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                <label>Email:</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <label>Password:</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <label>Confirm Password:</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                <label>Profile Picture URL:</label>
                <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Enter the image URL" />
                <label>Bio:</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength="200" placeholder="Tell us a bit about yourself..." />
                <button type="submit">Register</button>
                {error && <p className="error-message">{error}</p>}
            </form>
            <p className="auth-link">Already have an account? <Link to="/login">Login here</Link></p>
        </div>
    );
};

export default Register;
