// UniqueProfileView.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/UniqueProfileView.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const UniqueProfileView = () => {
    const [user, setUser] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const { userId } = useParams(); // Assuming the URL contains the userId for the profile
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Replace with your API call to fetch user details
                const response = await fetch(`/users/${userId}`, {
                    method: 'GET',
                    credentials: 'include'
                });

                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData.user);
                    setIsFollowing(userData.isFollowing); // Assume the API indicates follow status
                } else {
                    console.error('Error fetching profile');
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId]);

    const handleFollowToggle = async () => {
        try {
            const response = await fetch(`/users/${userId}/follow`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: isFollowing ? 'unfollow' : 'follow' })
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
            {/* Page title */}
            <h1 className="unique-profile-title">Unique Profile View</h1>

            <div className="unique-profile-header">
                <img src={user?.profilePicture || 'https://via.placeholder.com/120'} alt="" className="unique-profile-picture" />
                <h2>{user?.name}</h2>
            </div>
            <div className="unique-profile-stats">
                <div>
                    <strong>Followers:</strong> {user?.followersCount}
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
                <strong>Posts:</strong> {user?.postsCount}
            </div>
            <button onClick={handleFollowToggle} className={`auth-button follow-button ${isFollowing ? 'following' : ''}`}>
                {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
        </div>
    );
};

export default UniqueProfileView;
