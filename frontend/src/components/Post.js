import React from 'react';
import '../styles/Post.css';  
import Likes from './Likes';
import { Link } from 'react-router-dom';

function Post({ id, title, description, owner, price, imageUrl, tags = [], likes }) {

  return (
    // Update the Link path to match the route "/post/:id" in App.js
    <Link to={`/post/${id}`} state={{ post: { id, title, description, owner, price, imageUrl, tags } }} className="post-link">
      <div className="post">
        <img src={imageUrl} alt={title} className="post-image" />
        <div className="post-details">
          <div className="post-left">
            <h2>{title}</h2>
            <p>
              Owned by:
              <Link 
                to={`/profile/${owner?.id || 'unknown'}`} 
                state={{ owner }}
                className="profile-link"
              >
                {owner?.username || ' Unknown'}
              </Link>
            </p>
          </div>
          <div className="post-right">
            <p>${price}</p>
            <p>{description}</p>
          </div>
        </div>
        <div className="post-tags">
          <ul>
            {Array.isArray(tags) && tags.length > 0 ? (
              tags.map((tag, index) => <li key={index}>{tag}</li>)
            ) : (
              <li>No tags available</li>
            )}
          </ul>
        </div>
        <div className="post-likes">
          <Likes />
        </div>
      </div>
    </Link>
  );
}

export default Post;
