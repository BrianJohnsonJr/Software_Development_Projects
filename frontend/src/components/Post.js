import React from 'react';
import '../styles/Post.css';  
import Likes from './Likes';
import { Link } from 'react-router-dom';

function Post({ id, title, description, ownerUsername, price, imageUrl, tags = [], likes }) {


  return (
    <div className="post">
      <img src={imageUrl} alt={title} className="post-image" />
      <div className="post-details">
        <div className="post-left">
          <h2>
            <Link to={`/post/${id}`} state={{ post: { id, title, description, ownerUsername, price, imageUrl, tags } }}>
              {title}
            </Link>
          </h2>
        
          <p>Owned by: {ownerUsername}</p>
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
        <Likes/>
      </div>
    </div>
  );
}

export default Post;

