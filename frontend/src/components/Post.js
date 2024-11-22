import React, { forwardRef } from 'react';
import '../styles/Post.css';  
import Likes from './Likes';
import { Link } from 'react-router-dom';

const Post = forwardRef(({ id, title, description, owner, price, image, tags = [], likes }, ref) => {
  const ownerUsername = owner?.username || 'Unknown';
  const imageSrc = image || 'https://via.placeholder.com/150';
  const ownerImage = owner?.profilePicture;

  return (
    <div className="post" ref={ref}>
      <Link
        to={`/posts/${id}`}
        state={{ post: { id, title, description, owner, price, image, tags } }}
        className="post-link"
      >
        <img src={imageSrc} alt={title} className="post-image" />
        <div className="post-details">
          <div className="post-left">
            <h2>{title}</h2>
            <p>${price}</p>
            <p>{description}</p>
          </div>
        </div>
      </Link>

      <p className="post-owner">
        Owned by:&nbsp;
        <Link
            to={owner?._id ? `/profile/${owner._id}` : '#'}
            state={{ owner }}
            className="profile-link"
        >
            {ownerUsername}
        </Link>
      </p>


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
  );
});

export default Post;