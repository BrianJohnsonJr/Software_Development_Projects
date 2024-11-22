import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import '../styles/SingleItem.css';

function SingleItem() {
    const { id } = useParams();
    const location = useLocation();
    const [post, setPost] = useState(location.state?.post || null);
    const [loading, setLoading] = useState(!location.state?.post);
    const [error, setError] = useState(null);
    const [rating, setRating] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);

    const MAX_COMMENT_LENGTH = 250;

    useEffect(() => {
        if (!post) {
            setLoading(true);
            const fetchPost = async () => {
                try {
                    const response = await fetch(`/posts/${id}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch post');
                    }
                    const data = await response.json();
                    if (!data.post) {
                        setPost(null);
                    } else {
                        setPost(data.post);
                    }
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchPost();
        }
    }, [id, post, location.state]);

    useEffect(() => {
        const fetchComments = async () => {
            setLoadingComments(true);
            try {
                const response = await fetch(`/posts/${id}/comments`);
                if (!response.ok) {
                    throw new Error('Failed to fetch comments');
                }
                const data = await response.json();
                setComments(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Error fetching comments:', err);
            } finally {
                setLoadingComments(false);
            }
        };

        if (id) {
            fetchComments();
        }
    }, [id]);

    const handleStarClick = (star) => {
        setRating(star);
    };

    const handleCommentChange = (e) => {
        const value = e.target.value;
        if (value.length <= MAX_COMMENT_LENGTH) {
            setNewComment(value);
        }
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
            text: newComment,
            rating: rating,
        };

        try {
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

            const updatedCommentsResponse = await fetch(`/posts/${id}/comments`);
            if (updatedCommentsResponse.ok) {
                const updatedComments = await updatedCommentsResponse.json();
                setComments(Array.isArray(updatedComments) ? updatedComments : []);
            }

            setNewComment('');
            setRating(0);
        } catch (error) {
            alert('Error submitting comment: ' + error.message);
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    if (!post) {
        return <p>Post not found</p>;
    }

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
                        {post.owner?.username}
                    </p>
                    <p>
                        <strong>Tags: </strong>
                        {post.tags?.length > 0 ? post.tags.join(', ') : 'No tags available'}
                    </p>
                    <div className="button-group">
                        <button className="purchase-button">Purchase</button>
                        <button className="cart-button">Add to Cart</button>
                    </div>

                    <div className="comment-section">
                        <h3 className="comment-section-title">Leave a Comment</h3>

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

                        <textarea
                            className="comment-input"
                            placeholder="Write your comment here..."
                            value={newComment}
                            onChange={handleCommentChange}
                        ></textarea>
                        <p className="character-count">{MAX_COMMENT_LENGTH - newComment.length} characters remaining</p>

                        <button onClick={handleSubmitComment} className="submit-comment-button">
                            Submit Comment
                        </button>

                        <div className="comments-display">
                            {loadingComments ? (
                                <p>Loading comments...</p>
                            ) : (
                                comments.map((comment, index) => (
                                    <div key={comment._id || index} className="comment">
                                        <div className="comment-header">
                                            <img alt="userProfilePic" src={comment.owner?.profilePicture}></img>
                                            <span className="username">{comment.owner?.username || 'Anonymous'}</span>
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
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SingleItem;