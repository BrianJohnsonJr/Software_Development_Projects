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
                console.log("data: ", data);
                setResults((prevResults) => ({
                    ...prevResults,
                    usersFound: data
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
                const postResponse = await fetch(`/posts/search?query=${encodeURIComponent(searchTerm)}`)
                if (!postResponse.ok) {
                    console.log(postResponse);
                    throw new Error('Failed to fetch post search results.');
                }
                const data = await postResponse.json();
                console.log("data: ", data);
                setResults((prevResults) => ({
                    ...prevResults,
                    posts: data
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

    if (!results.users.length && !results.posts.length) {
        return <p>No results found for "{searchTerm}".</p>;
    }

    return (
        <div className="search-results-container">
            <h1>Search Results for "{searchTerm}"</h1>

            {results.users.length > 0 && (
                <div className="results-section">
                    <h2>Users</h2>
                    <div className="results-grid">
                        {results.users.map((user) => (
                            <User
                                key={user._id}
                                username={user.username}
                                profilePicture={user.profilePicture}
                                followersCount={user.followers.length}
                                followingCount={user.following.length}
                                postsCount={user.postIds.length}
                            />
                        ))}
                    </div>
                </div>
            )}

            {results.posts.length > 0 && (
                <div className="results-section">
                    <h2>Posts</h2>
                    <div className="results-grid">
                        {results.posts.map((post) => (
                            <Post
                                key={post._id}
                                title={post.title}
                                price={post.price}
                                tags={post.tags}
                                imageUrl={post.imageUrl}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchResults;
