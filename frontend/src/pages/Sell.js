// pages/Sell.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Sell.css'; // Create a CSS file for styling

const Sell = () => {
  const [image, setImage] = useState(null);
  const [sizes, setSizes] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [itemType, setItemType] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 
  const [imageURL, setImageURL] = useState(null);
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
        } finally {
          setIsLoading(false);
        }
    };

    checkAuth();
  }, [navigate]);

  // Handle image file upload
  const handleImageUpload = (e) => {
    setImageURL(URL.createObjectURL(e.target.files[0]));
    const file = e.target.files[0];
    if (file) {
        setImage(file); // Store the raw file for uploading
    }
  };

  // Handle size selection (multiple sizes)
  const handleSizeSelection = (e) => {
    const selectedSize = e.target.value;
    if (sizes.includes(selectedSize)) {
      setSizes(sizes.filter((size) => size !== selectedSize)); // Remove if already selected
    } else {
      setSizes([...sizes, selectedSize]);
    }
  };

  // Handle tag input and add tags (max of 3)
  const handleTagAddition = (e) => {
    e.preventDefault();
    if (tagInput.trim() !== '' && tags.length < 3) {
      setTags([...tags, tagInput.trim()]);
      setTagInput(''); // Clear input
    }
  };

  // Handle tag removal
  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();


    const formData = new FormData();
    formData.append('image', image); // Attach the raw file
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('tags', JSON.stringify(tags)); // Convert array to string
    formData.append('itemType', itemType);
    formData.append('sizes', JSON.stringify(sizes)); // Convert array to string

    try {
        // Send post data to the backend
        const response = await fetch('/posts/create', { // Adjust endpoint if necessary
            method: 'POST',
            body: formData,
            credentials: 'include', // Ensure authentication cookie is sent
        });

        const data = await response.json();
        if (response.ok) {
            // Redirect to the post detail page using the postId from the response
            navigate(`/posts/${data.postId}`);
        } else {
            // Handle errors gracefully
            console.error(data.message || 'Failed to create post');
            alert(data.message || 'Failed to create post');
        }
    } catch (error) {
        console.error('An error occurred:', error);
        alert('An error occurred while creating the post. Please try again.');
    }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!isAuthenticated) {
    return null; // You can also redirect or show a message here, but the redirect is already handled
  }

  return (
    <div className="sell-form-container">
      <h1>Sell Your Item</h1>
      <form onSubmit={handleSubmit} className="sell-form">
        {/* Image Upload */}
        <div className="form-group">
          <label>Upload Image:</label>
          <input type="file" id="image" name="image" onChange={handleImageUpload} />
          {imageURL && <img src={imageURL} alt="Uploaded Preview" className="image-preview" />}
        </div>

        {/* Post Title */}
        <div className="form-group">
          <label for="title">Title:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter post title"
          />
        </div>

        {/* Post Description */}
        <div className="form-group">
          <label for="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Enter post description"
          ></textarea>
        </div>

        {/* Price */}
        <div className="form-group">
          <label for="price">Price:</label>
          <input
            id="price"
            name="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            placeholder="Enter price"
          />
        </div>

        {/* Available Sizes */}
        <div className="form-group">
          <label for="sizes">Select Sizes:</label>
          <div className="size-options" id="sizes" name="sizes">
            {['S', 'M', 'L', 'XL'].map((size) => (
              <label for={size} key={size}>
                <input
                  id={size}
                  name={size}
                  type="checkbox"
                  value={size}
                  checked={sizes.includes(size)}
                  onChange={handleSizeSelection}
                />
                {size}
              </label>
            ))}
          </div>
        </div>
        
        {/* Select item type */}
        <div className="form-group">
          <label>Select item type:</label>
          <div className="type-options">
            {['T-shirt', 'Hoodie', 'Poster', 'Sticker', 'Mug'].map((type) => (
              <label key={type} className="type-option">
                <input
                  type="radio"
                  value={type}
                  checked={itemType === type}
                  onChange={(e) => setItemType(e.target.value)}
                  required
                />
                {type}
              </label>
            ))}
          </div>

        </div>

        {/* Tags */}
        <div className="form-group">
          <label>Tags (Max 3):</label>
          <div className="tags-input">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Enter tag"
              maxLength="15"
            />
            <button onClick={handleTagAddition} disabled={tags.length >= 3}>
              Add Tag
            </button>
          </div>
          <div className="tags-list">
            {tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="remove-tag-btn">
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

        <button type="submit" className="submit-btn">Submit</button>
      </form>
    </div>
  );
};

export default Sell;
