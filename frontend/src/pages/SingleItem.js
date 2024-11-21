import { React, useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import '../styles/SingleItem.css';

function SingleItem() {
  const { id } = useParams(); // Extract the post ID from the URL
  const location = useLocation(); // Get the location object
  const [post, setPost] = useState(location.state?.post || null); // Initialize post state from location state or null
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]); // Store comments
  const [newComment, setNewComment] = useState(''); // Store new comment text
  const [rating, setRating] = useState(0); // Store selected rating (1-5)
  
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
  

  const handleSubmitComment = () => {
    // Submit the comment along with rating (You can add further logic to send this to the server)
    const newCommentData = {
      username: 'User', // Replace with actual user logic if available
      comment: newComment,
      rating: rating
    };
    setComments([...comments, newCommentData]); // Update comments array
    setNewComment(''); // Reset the input field
    setRating(0); // Reset rating after submission
  };

  const handleStarClick = (star) => {
    setRating(star);
  };

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

      {/* Comment Section */}
      <div className="comment-section">
        <h3 className="comment-section-title">Leave a Comment</h3>

        {/* Rating Stars */}
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`star ${rating >= star ? 'selected' : ''}`}
              onClick={() => handleStarClick(star)}
            >
              ★
            </span>
          ))}
        </div>

        {/* Comment Text Input */}
        <textarea
          className="comment-input"
          placeholder="Write your comment here..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        ></textarea>

        {/* Submit Button */}
        <button onClick={handleSubmitComment} className="submit-comment-button">
          Submit Comment
        </button>

        {/* Display Submitted Comments */}
        <div className="comments-display">
          {comments.map((comment, index) => (
            <div key={index} className="comment">
              <div className="comment-header">
                <span className="username">{comment.username}</span>
                <div className="rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${comment.rating >= star ? 'selected' : ''}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <p className="comment-text">{comment.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SingleItem;
