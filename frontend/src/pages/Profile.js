// Profile.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';

const Profile = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if the user is authenticated
        const fetchProfile = async () => {
            try {
                const response = await fetch('/profile', {
                    method: 'GET',
                    credentials: 'include' // Ensures cookies are sent with the request
                });

                if (response.ok) {
                    const userData = await response.json();
                    setIsAuthenticated(true);
                    setUser(userData.user);
                } else {
                    navigate('/login'); // Redirect to login if not authenticated
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                navigate('/login');
            }
        };

        fetchProfile();
    }, [navigate]);

    // Logout function
    const handleLogout = async () => {
        try {
            await fetch('/logout', {
                method: 'POST',
                credentials: 'include' // Ensures cookies are included with request
            });
            setIsAuthenticated(false);
            navigate('/login'); // Redirect to login page after logout
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    if (!isAuthenticated) {
        return <p>Loading...</p>;
    }

    return (
        <div className="profile-container">
            <h1>Welcome, {user?.name}</h1>
            <p>Username: {user?.username}</p>
            <p>Email: {user?.email}</p>
            <p>Bio: {user?.bio}</p>

            {/* Logout button */}
            <button onClick={handleLogout} className="logout-button">
                Logout
            </button>
        </div>
    );
};

export default Profile;
