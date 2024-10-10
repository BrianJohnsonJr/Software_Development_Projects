// components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import logo from '../images/blank_image.webp'; // Import your logo here
import '../styles/Navbar.css'; 

const Navbar = () => {
  return (
    <nav className="navbar">
      <img src={logo} alt="Logo" className="navbar-logo" />
      <div className="navbar-links">
        <Link to="/following">Following</Link>
        <Link to="/explore">Explore</Link>
        <Link to="/sell">Sell</Link>
      </div>
      <input type="text" placeholder="Search..." className="search-bar" />
      <Link to="/profile" className="profile-icon">👤</Link>
    </nav>
  );
};

export default Navbar;
