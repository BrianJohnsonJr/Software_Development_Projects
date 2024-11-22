// Register.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Auth.css';

const Register = () => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profilePicture, setProfilePicture] = useState(''); 
    const [imageURL, setImageURL] = useState(null);
    const [bio, setBio] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }
    
        const formData = new FormData();
        formData.append('name', name);
        formData.append('username', username);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('bio', bio);
        if (profilePicture) {
            formData.append('profilePicture', profilePicture); // Append the file to FormData
        }
        try {
            const response = await fetch('/account/register', { 
                method: 'POST',
                body: formData,
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

    const handleImageUpload = (e) => {
        setImageURL(URL.createObjectURL(e.target.files[0]));
        const file = e.target.files[0];
        if (file) {
            setProfilePicture(file); // Store the raw file for uploading
        }
    };

    return (
        <div className="auth-container">
            <h1>Register</h1>
            <form onSubmit={handleRegister}>
                {/* Form fields */}
                <label htmlFor="name">Full Name:</label>
                <input type="text" id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
                <label htmlFor="username">Username:</label>
                <input type="text" id="username" name="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <label htmlFor="password">Password:</label>
                <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <label htmlFor="confirmPassword">Confirm Password:</label>
                <input type="password" id="confirmPassword" name="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                <label>Profile Picture:</label>
                <div className="form-group">
                    <label htmlFor="image">Profile Picture:</label>
                    <input type="file" id="image" name="image" onChange={handleImageUpload} />
                    {profilePicture && <img src={imageURL} alt="Uploaded Preview" className="image-preview" />}
                </div>
                <label htmlFor="bio">Bio:</label>
                <textarea name="bio" id="bio" value={bio} onChange={(e) => setBio(e.target.value)} maxLength="200" placeholder="Tell us a bit about yourself..." />
                <button type="submit">Register</button>
                {error && <p className="error-message">{error}</p>}
            </form>
            <p className="auth-link">Already have an account? <Link to="/login">Login here</Link></p>
        </div>
    );
};

export default Register;
