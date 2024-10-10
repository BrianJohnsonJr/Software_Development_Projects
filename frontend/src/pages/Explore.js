import React from 'react';
import Post from '../components/post'; // Import the reusable Post component

const Explore = () => {
    // Sample posts as plain objects
    const posts = [
        {
            id: 1,
            title: "Sample Post Title",
            description: "",
            ownerUsername: "John Doe",
            price: 50,
            imageUrl: "/public/blank_image.webp", // Check this path
            tags: ["tech", "innovation", "firstPost"],
        },
        {
            id: 2,
            title: "Sample Post Title 2",
            description: "Sample Post Description",
            ownerUsername: "Jane Doe",
            price: 50,
            imageUrl: "/public/blank_image.webp", // Check this path
            tags: ["tech", "innovation"],
        },
        {
            id: 3,
            title: "Sample Post Title 3",
            description: "Sample Post Description",
            ownerUsername: "Johnny Appleseed",
            price: 50,
            imageUrl: "/public/blank_image.webp", // Check this path
            tags: ["tech", "innovation"],
        },
        {
            id: 4,
            title: "Sample Post Title 4",
            description: "Sample Post Description",
            ownerUsername: "Janey Appleseed",
            price: 50,
            imageUrl: "/public/blank_image.webp", // Check this path
            tags: ["tech", "innovation"],
        },
        {
            id: 5,
            title: "Sample Post Title 5",
            description: "Sample Post Description",
            ownerUsername: "George Washington",
            price: 50,
            imageUrl: "/public/blank_image.webp", // Check this path
            tags: ["tech", "innovation"],
        }
    ];

    return (
        <div>
            <h1>Explore</h1>
            <div className="posts-container">
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <Post
                            key={post.id} // Use unique key for each post
                            title={post.title}
                            description={post.description}
                            ownerUsername={post.ownerUsername}
                            price={post.price}
                            imageUrl={post.imageUrl}
                            tags={post.tags} // Pass the tags to the Post component
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
