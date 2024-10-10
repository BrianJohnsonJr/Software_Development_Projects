import React from 'react';
// import '../styles/post.css';  

function Post({ title, description, ownerUsername, price, imageUrl, tags = [], likes }) {
  return (
    <div className="post">
      <img src={imageUrl} alt={title} className="post-image" />
      <div className="post-info">
        <h2>{title}</h2>
        <p>{description}</p>
        <p>Owned by: {ownerUsername}</p>
        <p>Price: ${price}</p>
        <div className="post-tags">
          <p>Tags:</p>
          <ul>
            {Array.isArray(tags) && tags.length > 0 ? (
              tags.map((tag, index) => <li key={index}>{tag}</li>)
            ) : (
              <li>No tags available</li> // Fallback when tags are empty
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Post;
