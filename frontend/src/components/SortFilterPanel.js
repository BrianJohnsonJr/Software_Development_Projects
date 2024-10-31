import React, { useState } from 'react';
import '../styles/SortFilterPanel.css';

const SortFilterPanel = ({ onSortChange, onFilterChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedSortOption, setSelectedSortOption] = useState(null);

    // Filtering state
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(1000);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [tagsApply, setTagsApply] = useState('all');

    const sortOptions = [
        { id: 'title-asc', label: 'Title A-Z' },
        { id: 'title-desc', label: 'Title Z-A' },
        { id: 'price-asc', label: 'Price Low-High' },
        { id: 'price-desc', label: 'Price High-Low' },
    ];

    const itemTypes = ['Tshirt', 'Hoodie', 'Poster', 'Sticker', 'Mug'];

    const togglePanel = () => setIsOpen(!isOpen);

    const changeSortOption = (optionId) => {
        const newSelection = selectedSortOption === optionId ? null : optionId;
        setSelectedSortOption(newSelection);
        onSortChange(newSelection);
    };

    const addTag = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            const newTag = tagInput.trim().toLowerCase();
            
            // Check if tag already exists
            if (!tags.includes(newTag)) {
                setTags((prevTags) => {
                    const updatedTags = [...prevTags, newTag];
                    onFilterChange({ tags: updatedTags });
                    return updatedTags;
                });
            }
    
            setTagInput(''); // Clear the input after attempting to add
        }
    };

    const removeTag = (tagToRemove) => {
        const updatedTags = tags.filter((tag) => tag !== tagToRemove);
        setTags(updatedTags);
        onFilterChange({ tags: updatedTags, tagsApply });
    };

    const changePrice = (type, value) => {
        const updatedFilters = type === 'min' ? { minPrice: value, maxPrice } : { minPrice, maxPrice: value };
        if (type === 'min') setMinPrice(value);
        else setMaxPrice(value);
        onFilterChange(updatedFilters);
    };

    const toggleType = (type) => {
        setSelectedTypes((prevTypes) => {
            const updatedTypes = prevTypes.includes(type)
                ? prevTypes.filter((t) => t !== type)
                : [...prevTypes, type];
            onFilterChange({ types: updatedTypes });
            return updatedTypes;
        });
    };

    const toggleTagsApply = () => {
        const newTagsApply = tagsApply === 'all' ? 'any' : 'all';
        setTagsApply(newTagsApply);
        onFilterChange({ tagsApply: newTagsApply, tags });
    };

    return (
        <div>
            <button className="sort-filter-icon" onClick={togglePanel}>☰</button>

            <div className={`sort-filter-panel ${isOpen ? 'open' : ''}`}>
                <h2>Sort & Filter</h2>
                <div className="sort-options">
                    {sortOptions.map((option) => (
                        <div
                            key={option.id}
                            className={`sort-option ${selectedSortOption === option.id ? 'selected' : ''}`}
                            onClick={() => changeSortOption(option.id)}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>

                <h3>Tags</h3>
                <span className="toggle-container">
                    <input 
                        type="checkbox" 
                        className="toggle-switch" 
                        checked={tagsApply === 'all'} 
                        onChange={toggleTagsApply} 
                    />
                    <span className="toggle-label">{tagsApply === 'all' ? 'All' : 'Any'}</span>
                </span>

                <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={addTag}
                    placeholder="Add Tag"
                />
                <div className="tags-container">
                    {tags.map((tag) => (
                        <span key={tag} className="tag" onClick={() => removeTag(tag)}>
                            {tag}
                        </span>
                    ))}
                </div>

                <h3>Min/Max Price</h3>
                <div className="price-slider">
                    <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => changePrice('min', Number(e.target.value))}
                        placeholder="Min"
                    />
                    <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => changePrice('max', Number(e.target.value))}
                        placeholder="Max"
                    />
                </div>

                <h3>Item Type</h3>
                <div className="item-types">
                    {itemTypes.map((type) => (
                        <div
                            key={type}
                            className={`type-option ${selectedTypes.includes(type) ? 'selected' : ''}`}
                            onClick={() => toggleType(type)}
                        >
                            {type}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SortFilterPanel;
