import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import '../styles/SingleItem.css';

function SingleItem() {
    const { id } = useParams(); // Extract the post ID from the URL
    const location = useLocation(); // Get the location object
    const [post, setPost] = useState(location.state?.post || null); // Initialize post state from location state or null
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // New state variables
    const [rating, setRating] = useState(0); // Tracks the selected rating
    const [newComment, setNewComment] = useState(''); // Tracks the new comment text
    const [comments, setComments] = useState([]); // Stores submitted comments

    useEffect(() => {
        // If no post data is passed via state, fetch the post details using the ID
        if (!post) {
            setLoading(true);
            const fetchPost = async () => {
                try {
                    const response = await fetch(`/posts/${id}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch post');
                    }
                    const data = await response.json();
                    setPost(data.post);
                    setComments(data.post.comments || []); // Set comments if available
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchPost();
        }
    }, [id, post]);

    const handleStarClick = (star) => {
        setRating(star); // Update the selected rating
    };

    const handleSubmitComment = async () => {
        if (newComment.trim() === '') {
            alert('Comment cannot be empty');
            return;
        }

        if (rating === 0) {
            alert('Please select a rating between 1 and 5');
            return;
        }

        const newEntry = {
            text: newComment, // Send the comment text as 'text' field
            rating: rating,   // Send the rating as 'rating' field
        };

        try {
            // Submit the comment
            const response = await fetch(`/posts/${id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newEntry),
            });

            if (!response.ok) {
                throw new Error('Failed to submit comment');
            }

            // Optimistic UI update: Add the new comment to the list immediately
            const updatedComments = [
                ...comments,
                { text: newComment, rating, username: 'CurrentUser' }
            ];
            setComments(updatedComments);

            // Fetch updated post data in the background without overwriting comments
            const updatedPostResponse = await fetch(`/posts/${id}`);
            if (updatedPostResponse.ok) {
                const updatedPost = await updatedPostResponse.json();
                // Only update comments if the fetched post has new ones
                setComments(prevComments => [
                    ...prevComments,
                    ...(updatedPost?.post?.comments || [])
                ]);
            }

            // Clear the input and reset rating
            setNewComment('');
            setRating(0);
        } catch (error) {
            alert('Error submitting comment: ' + error.message);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!post) return <p>Post not found.</p>;

    return (
        <div className="single-item-container">
            <h1>{post.title}</h1>
            <div className="single-item-content">
                <div className="single-item-left">
                    <img src={post.image} alt={post.title} className="single-item-image" />
                    <p className="single-item-price">${post.price}</p>
                </div>
                <div className="single-item-right">
                    <p className="single-item-description">{post.description}</p>
                    <p>
                        <strong>Owned by: </strong>
                        {post.owner?.username || 'Unknown Owner'}
                    </p>
                    <p>
                        <strong>Tags: </strong>
                        {post.tags && post.tags.length > 0 ? post.tags.join(', ') : 'No tags available'}
                    </p>
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
                                    <p className="comment-text">{comment.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SingleItem;
