import React, { useEffect, useState } from 'react';
import Post from '../components/Post';
import SortFilterPanel from '../components/SortFilterPanel'; // Sort&Filter panel component
import '../styles/Explore.css';
import blankImagePath from "../images/blank_image.webp"; //can be removed once the imageUrls are being pulled in the post object

const Explore = () => {
    const [posts, setPosts] = useState([]);
    const [sortOption, setSortOption] = useState('');
    const [filters, setFilters] = useState({ tags: [], minPrice: 0, maxPrice: 1000, types: [], tagsApply: 'any' });

    useEffect(() => {
        const fetchPosts = async () => {
            try{
                const response = await fetch('/posts/explore'); 
                if(!response.ok){
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log('Fetched posts:', data);
                if (Array.isArray(data)) {
                    setPosts(data); // Ensure `posts` is an array
                } else {
                    console.error('Unexpected response:', data);
                    setPosts([]); // Fallback to an empty array
                }
            } catch (error) {
                console.error('Error fetching posts:', error);
                setPosts([]); // Set to empty array on failure
            }
          
        };
        fetchPosts();
    }, []);

    const filterPosts = (posts, filters) => {
        return posts.filter((post) => {
            const { tags, minPrice, maxPrice, types, tagsApply } = filters;

            // Check if there are any user-entered tags
            const hasTags = tags.length > 0;
            
            // Match tags according to tagsApply setting if tags are provided
            const matchesTags = !hasTags || (tagsApply === 'all'
                ? tags.every(tag => post.tags.includes(tag)) // all tags must match
                : tags.some(tag => post.tags.includes(tag))  // any tag matches
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
        setFilters((prevFilters) => ({ ...prevFilters, ...newFilters }));
    };

    const filteredAndSortedPosts = sortPosts(filterPosts(posts, filters), sortOption);

    return (
        <div>
            <SortFilterPanel onSortChange={setSortOption} onFilterChange={changeFilters} />
            <div className="posts-container">
                {filteredAndSortedPosts.length > 0 ? (
                    filteredAndSortedPosts.map((post) => (
                        <Post
                            key={post.id}
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
            </div>
        </div>
    );
};

export default Explore;
