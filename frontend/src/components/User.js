import React from 'react';
import '../styles/User.css';

const UserResult = ({ user }) => {
    const { username, image, followers, following, postIds } = user;

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
                <h2 className="username">{username}</h2>
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
