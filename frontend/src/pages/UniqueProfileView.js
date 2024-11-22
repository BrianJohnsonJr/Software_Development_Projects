import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom'; // Added useLocation
import '../styles/UniqueProfileView.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const UniqueProfileView = () => {
    const [user, setUser] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const { id } = useParams(); // Get userId from the URL
    const { state } = useLocation(); // Get passed state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch(`/account/profile/${id}`, {
                    method: 'GET',
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                } else {
                    console.error('Failed to fetch profile');
                    setError(true); // Add a state to indicate an error occurred
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [id]);

    const handleFollowToggle = async () => {
        try {
            const response = await fetch(`/users/${id}/follow`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: isFollowing ? 'unfollow' : 'follow' }),
            });

            if (response.ok) {
                setIsFollowing(!isFollowing); // Toggle follow status
            } else {
                console.error('Failed to update follow status');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <div>Failed to load user data</div>;
    }

    return (
        <div className="unique-profile-container">
            <h1 className="unique-profile-title">Profile View</h1>

            <div className="unique-profile-header">
                <img
                    src={user?.profilePicture || 'https://via.placeholder.com/120'}
                    alt={`${user?.name || 'User'}'s profile`}
                    className="unique-profile-picture"
                />
                <h2>{user?.name || 'Unknown User'}</h2>
            </div>
            <div className="unique-profile-stats">
                <div>
                    <p><strong>Followers:</strong> {user?.followers?.length || 0}</p>
                </div>
            </div>
            <div className="unique-profile-info">
                <p>
                    <FontAwesomeIcon icon={faUser} /> Username: {user?.username || 'N/A'}
                </p>
                <p>
                    <FontAwesomeIcon icon={faEnvelope} /> Email: {user?.email || 'N/A'}
                </p>
                <p>
                    <FontAwesomeIcon icon={faInfoCircle} /> Bio: {user?.bio || 'N/A'}
                </p>
            </div>
            <div className="unique-profile-posts">
                <p><strong>Posts:</strong> {user?.postIds?.length || 0}</p>
            </div>
            <button
                onClick={handleFollowToggle}
                className={`auth-button follow-button ${isFollowing ? 'following' : ''}`}
            >
                {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
        </div>
    );
};

export default UniqueProfileView;
