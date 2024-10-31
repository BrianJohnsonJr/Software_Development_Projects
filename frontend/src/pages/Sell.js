// pages/Sell.js
import React, { useState } from 'react';
import '../styles/Sell.css'; // Create a CSS file for styling

const Sell = () => {
  const [image, setImage] = useState(null);
  const [sizes, setSizes] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // Handle image file upload
  const handleImageUpload = (e) => {
    setImage(URL.createObjectURL(e.target.files[0]));
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you can handle form submission, such as sending the data to your server
    console.log({ image, title, description, price, sizes, tags });
  };

  return (
    <div className="sell-form-container">
      <h1>Sell Your Item</h1>
      <form onSubmit={handleSubmit} className="sell-form">
        {/* Image Upload */}
        <div className="form-group">
          <label>Upload Image:</label>
          <input type="file" onChange={handleImageUpload} />
          {image && <img src={image} alt="Uploaded Preview" className="image-preview" />}
        </div>

        {/* Post Title */}
        <div className="form-group">
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter post title"
          />
        </div>

        {/* Post Description */}
        <div className="form-group">
          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Enter post description"
          ></textarea>
        </div>

        {/* Price */}
        <div className="form-group">
          <label>Price:</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            placeholder="Enter price"
          />
        </div>

        {/* Available Sizes */}
        <div className="form-group">
          <label>Select Sizes:</label>
          <div className="size-options">
            {['S', 'M', 'L', 'XL'].map((size) => (
              <label key={size}>
                <input
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
