import React from 'react';
import { Link } from 'react-router-dom';  // Import Link from react-router-dom
import '../styles/User.css';

const UserResult = ({ user }) => {
    const { username, image, followers, following, postIds, _id } = user;  // Destructure _id to use in the link

    return (
        <div className="user-result">
            {/* Profile Picture */}
            <div className="profile-picture-container">
                <img 
                    src={image || 'https://preview.redd.it/tuya5a8s2tv71.png?width=422&format=png&auto=webp&s=b379b435e0b570d34bea7eadb00f78faa53ae98d'} 
                    alt={`${username}'s profile`} 
                    className="profile-picture" 
                />
            </div>

            {/* User Information */}
            <div className="user-info">
                {/* Link wrapped around the username */}
                <h2 className="username">
                    <Link to={`/profile/${_id}`} className="profile-link">
                        {username}
                    </Link>
                </h2>
                <div className="stats">
                    <p><strong>Followers:</strong> {followers.length}</p>
                    <p><strong>Following:</strong> {following.length}</p>
                    <p><strong>Posts:</strong> {postIds.length}</p>
                </div>
            </div>
        </div>
    );
};

export default UserResult;
