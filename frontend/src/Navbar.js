
import React from 'react';
import logo from './logo.svg'; // Import your logo here
import './Navbar.css'; // Create a CSS file for styling (optional)

const Navbar = () => {
  return (
    <nav className="navbar">
      <img src={logo} alt="Logo" className="navbar-logo" />
      <div className="navbar-links">
        <a href="/following">Following</a>
        <a href="/explore">Explore</a>
        <a href="/sell">Sell</a>
      </div>
      <input type="text" placeholder="Search..." className="search-bar" />
      <a href="/profile" className="profile-icon">👤</a>
    </nav>
  );
};

export default Navbar;
