import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import User from '../components/User';
import Post from '../components/Post';
import '../styles/SearchResults.css';

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const searchTerm = searchParams.get('searchTerm'); // Get searchTerm from URL
    const [results, setResults] = useState({ users: [], posts: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserSearchResults = async () => {
            if (!searchTerm || searchTerm.trim() === "") {
                setError('Please enter a search term.');
                setIsLoading(false);
                return;
            }
            try {
                setIsLoading(true);
                const userResponse = await fetch(`/account/search?query=${encodeURIComponent(searchTerm)}`);
                if (!userResponse.ok) {
                    throw new Error('Failed to fetch user search results.');
                }
                const data = await userResponse.json();
                console.log("user data fetched: ", data);
                setResults((prevResults) => ({
                    ...prevResults,
                    users: data.users
                }));
                setError(null);
            } catch (err) {
                console.error('Error fetching search results:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchPostSearchResults = async () => {
            if (!searchTerm || searchTerm.trim() === "") {
                setError('Please enter a search term.');
                setIsLoading(false);
                return;
            }
            try {
                setIsLoading(true);
                const postResponse = await fetch(`/posts/search?query=${encodeURIComponent(searchTerm)}`);
                if (!postResponse.ok) {
                    console.log(postResponse);
                    throw new Error('Failed to fetch post search results.');
                }
                const data = await postResponse.json();
                console.log("post data fetched: ", data);
                setResults((prevResults) => ({
                    ...prevResults,
                    posts: data.posts
                }));
                setError(null);
            } catch (err) {
                console.error('Error fetching search results:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserSearchResults();
        fetchPostSearchResults();
    }, [searchTerm]);

    if (isLoading) {
        return <p>Loading search results...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (results.users.length === 0 && results.posts.length === 0) {
        return <p>No results found for "{searchTerm}".</p>;
    }

    return (
        <div className="search-results-container">
            <h1>Search Results for "{searchTerm}"</h1>

            {results.users?.length >= 0 && (
                <div className="user-results-section">
                    <h3>Users</h3>
                    <div className="user-results-grid">
                        {results.users.map((user) => (
                            <div className="user-card" key={user._id}>
                                <User
                                    user={{
                                        username: user.username,
                                        image: user.image,
                                        followers: user.followers,
                                        following: user.following,
                                        postIds: user.postIds,
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {results.posts?.length >= 0 && (
                <div className="post-results-section">
                    <h2>Posts</h2>
                    <div className="post-results-grid">
                        {results.posts.map((post) => (
                            <div className="post-card" key={post._id}>
                                <Post
                                    key={post._id}
                                    title={post.title}
                                    price={post.price}
                                    tags={post.tags}
                                    image={post.image}
                                />
                            </div>
                            
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchResults;
