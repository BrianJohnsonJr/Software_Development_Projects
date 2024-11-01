import React from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/SingleItem.css';

function SingleItem() {
  const { state } = useLocation();
  const post = state?.post;

  if (!post) {
    return <p>Post not found.</p>;
  }

  return (
    <div className="single-item-container">
      <div className="single-item-header">
        <h1 className="single-item-title">{post.title}</h1>
        <p className="single-item-price">${post.price}</p>
      </div>
      <img src={post.imageUrl} alt={post.title} className="single-item-image" />
      <p className="single-item-description">{post.description}</p>
      <div className="single-item-tags">
        <strong>Tags:</strong>
        <ul>
          {post.tags.map((tag, index) => (
            <li key={index}>{tag}</li>
          ))}
        </ul>
      </div>
      <p className="single-item-owner">Owned by: {post.ownerUsername}</p>
      
      <div className="button-group">
        <button className="purchase-button">Purchase</button>
        <button className="cart-button">Add to Cart</button>
      </div>
    </div>
  );
}

export default SingleItem;
