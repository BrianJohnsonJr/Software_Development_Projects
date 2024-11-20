import { React, useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import '../styles/SingleItem.css';

function SingleItem() {
  const { id } = useParams(); // Extract the post ID from the URL
  const location = useLocation(); // Get the location object
  const [post, setPost] = useState(location.state?.post || null); // Initialize post state from location state or null
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!post) { // If post is not available from state, fetch it manually from the server
      setLoading(true);
      const fetchPost = async () => {
        try {
          const response = await fetch(`/posts/${id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch post');
          }
          const data = await response.json();
          setPost(data.post); // Set the fetched post data
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchPost();
    }
  }, [id, post]); // Only fetch if there's no post already loaded

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

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
      <p className="single-item-owner">Owned by: {post.owner?.username}</p>
      <div className="button-group">
        <button className="purchase-button">Purchase</button>
        <button className="cart-button">Add to Cart</button>
      </div>
    </div>
  );
}

export default SingleItem;
