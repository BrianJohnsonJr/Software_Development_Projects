// Profile.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';


const Profile = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if the user is authenticated
        const fetchProfile = async () => {
            try {
                const response = await fetch('/account/profile', {
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
            await fetch('/account/logout', {
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
            <div className="profile-header">
                <img src={user?.profilePicture || 'https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1677509740.jpg'} alt="" className="profile-picture" />
                <h1>{user?.name}</h1>
            </div>
            <div className="profile-stats">
                <div>
                    <strong>Followers:</strong> {user?.followersCount}
                </div>
            </div>
            <div className="profile-info">
                <div>
                    <FontAwesomeIcon icon={faUser} /> Username: {user?.username}
                </div>
                <div>
                    <FontAwesomeIcon icon={faEnvelope} /> Email: {user?.email}
                </div>
                <div>
                    <FontAwesomeIcon icon={faInfoCircle} /> Bio: {user?.bio}
                </div>
            </div>
            <div className="profile-posts">
                <strong>Posts:</strong> {user?.postsCount}
            </div>
            <Link to="/edit-profile" className="edit-button"> Edit Profile</Link>
            <button onClick={handleLogout} className="auth-button logout-button">
                Logout
            </button>
        </div>
    );
};

export default Profile;
