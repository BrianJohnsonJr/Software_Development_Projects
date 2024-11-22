import React, { useEffect, useState, useRef, useCallback } from 'react';
import Post from '../components/Post';
import SortFilterPanel from '../components/SortFilterPanel';
import '../styles/Explore.css';

const Explore = () => {
    const [posts, setPosts] = useState([]);
    const [sortOption, setSortOption] = useState('');
    const [filters, setFilters] = useState({ tags: [], minPrice: 0, maxPrice: 1000, types: [], tagsApply: 'any' });
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const loadedPostIds = useRef(new Set());

    const fetchPosts = useCallback(async () => {
        if (isLoading || !hasMore) return;

        try {
            setIsLoading(true);
            const lastPost = posts[posts.length - 1];
            const url = lastPost 
                ? `/posts/explore?lastId=${lastPost._id}`
                : '/posts/explore';
                
            console.log('Fetching posts with URL:', url);
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Fetched posts:', data);

            if (Array.isArray(data) && data.length > 0) {
                // Filter out any posts we've already loaded
                const newPosts = data.filter(post => !loadedPostIds.current.has(post._id));
                
                if (newPosts.length > 0) {
                    // Add new post IDs to our Set
                    newPosts.forEach(post => loadedPostIds.current.add(post._id));
                    setPosts(prevPosts => [...prevPosts, ...newPosts]);
                }
                
                // If we received fewer posts than expected, we've reached the end
                setHasMore(data.length === 25);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, hasMore, posts]);

    const filterPosts = (posts, filters) => {
        return posts.filter((post) => {
            const { tags, minPrice, maxPrice, types, tagsApply } = filters;

            const hasTags = tags.length > 0;
            const matchesTags = !hasTags || (tagsApply === 'all'
                ? tags.every(tag => post.tags.includes(tag))
                : tags.some(tag => post.tags.includes(tag))
            );

            const withinPriceRange = post.price >= minPrice && post.price <= maxPrice;
            const matchesType = types.length === 0 || types.includes(post.itemType);

            return matchesTags && withinPriceRange && matchesType;
        });
    };

    const sortPosts = (posts, sortOption) => {
        switch (sortOption) {
            case 'title-asc':
                return [...posts].sort((a, b) => a.title.localeCompare(b.title));
            case 'title-desc':
                return [...posts].sort((a, b) => b.title.localeCompare(a.title));
            case 'price-asc':
                return [...posts].sort((a, b) => a.price - b.price);
            case 'price-desc':
                return [...posts].sort((a, b) => b.price - a.price);
            default:
                return posts;
        }
    };

    const changeFilters = (newFilters) => {
        // Reset everything when filters change
        setPosts([]);
        loadedPostIds.current.clear();
        setHasMore(true);
        setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
    };

    // Create ref for intersection observer
    const observerRef = useRef();
    
    // Create ref for the last post element
    const lastPostRef = useCallback((node) => {
        if (isLoading) return;

        // Disconnect the previous observer if it exists
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        // Create new observer
        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                fetchPosts();
            }
        });

        // Observe the new node
        if (node) {
            observerRef.current.observe(node);
        }
    }, [isLoading, hasMore, fetchPosts]);

    const filteredAndSortedPosts = sortPosts(filterPosts(posts, filters), sortOption);

    // Initial fetch
    useEffect(() => {
        fetchPosts();
    }, []); // Remove fetchPosts from dependencies to prevent infinite loop

    return (
        <div>
            <SortFilterPanel onSortChange={setSortOption} onFilterChange={changeFilters} />
            <div className="posts-container">
                {filteredAndSortedPosts.length > 0 ? (
                    filteredAndSortedPosts.map((post, index) => (
                        <Post
                            ref={index === filteredAndSortedPosts.length - 1 ? lastPostRef : null}
                            key={post._id}
                            _id={post._id}
                            title={post.title}
                            description={post.description}
                            ownerUsername={post.ownerUsername}
                            price={post.price}
                            image={post.image}
                            tags={post.tags}
                        />
                    ))
                ) : (
                    <p>This feed is empty.</p>
                )}
                {isLoading && <div className="loading-indicator">Loading...</div>}
            </div>
        </div>
    );
};

export default Explore;