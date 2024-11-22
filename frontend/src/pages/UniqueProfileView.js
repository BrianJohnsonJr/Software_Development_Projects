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

    return (
        <div className="unique-profile-container">
            <h1 className="unique-profile-title">Profile View</h1>

            <div className="unique-profile-header">
                <img
                    src={user.profilePicture || 'https://via.placeholder.com/120'}
                    alt=""
                    className="unique-profile-picture"
                />
                <h2>{user.name}</h2>
            </div>
            <div className="unique-profile-stats">
                <div>
                    <strong>Followers:</strong> {user.followers.length}
                </div>
            </div>
            <div className="unique-profile-info">
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
            <div className="unique-profile-posts">
                <strong>Posts:</strong> {user.postIds?.length}
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
