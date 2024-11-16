import React, { useEffect, useState } from 'react';
import Post from '../components/Post'; // Import the reusable Post component
import SortFilterPanel from '../components/SortFilterPanel'; // Sort&Filter panel component
import '../styles/Explore.css';  
import shoePath from "../images/ShoesMerch.webp";
import TShirtPath from "../images/T-ShirtMerch.jpg";
import pantsPath from "../images/PantsMerch.avif";
import hatPath from "../images/HatMerch.jpeg";
import braceletPath from "../images/braceletMerch.webp"
import { useNavigate } from 'react-router-dom';

const Following = () => {
    const [posts, setPosts] = useState([]);
    const [sortOption, setSortOption] = useState('');
    const [filters, setFilters] = useState({ tags: [], minPrice: 0, maxPrice: 1000, types: [], tagsApply: 'any' });
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true); 
    const navigate = useNavigate();

    useEffect(() => {
        // Check if the user is authenticated
        const checkAuth = async () => {
            try {
                const response = await fetch('/account/auth-check', {
                    method: 'GET',
                    credentials: 'include',
                });

                if (response.ok) {
                    setIsAuthenticated(true);
                } else {
                    navigate('/not-logged-in'); // Redirect to "NotLoggedIn" page if not authenticated
                }
            } catch (error) {
                console.error('Error checking authentication:', error);
                navigate('/not-logged-in'); // Redirect to "NotLoggedIn" page if error occurs
            }
        };

        checkAuth();
    }, [navigate]);

    useEffect(() => { // dummy data while we setup the api call to get ONLY posts uploaded by following list (integrate "shuffle/random" algorithm?)
        if(isAuthenticated){
            const fetchedPosts = [
                { id: 1, title: "Chris T-Shirt", description: "", ownerUsername: "John Doe", price: 35, imageUrl: TShirtPath, tags: ["tech", "innovation", "firstPost"] },
                { id: 2, title: "Jane Shoes", description: "Sample Post Description", ownerUsername: "Jane Doe", price: 30, imageUrl: shoePath, tags: ["tech", "innovation"] },
                { id: 3, title: "Designed Joggers", description: "Sample Post Description", ownerUsername: "Johnny Appleseed", price: 10, imageUrl: pantsPath, tags: ["tech", "innovation"] },
                { id: 4, title: "Sample Post Title 4", description: "Sample Post Description", ownerUsername: "Janey Appleseed", price: 5000, imageUrl: hatPath, tags: ["tech", "innovation"] },
                { id: 5, title: "Silver Bracelet", description: "Sample Post Description", ownerUsername: "George Washington", price: 500, imageUrl: braceletPath, tags: ["tech", "innovation"] }
            ];
            setPosts(fetchedPosts);
            setIsLoading(false);
        }
        
    }, [isAuthenticated]);

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

    if (isLoading) {
        return <p>Loading...</p>;
    }

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
                            imageUrl={post.imageUrl}
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

export default Following;
