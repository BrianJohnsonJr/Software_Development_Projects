
import React from 'react';
import { Link, useLocation } from 'react-router-dom'; // Import Link and useLocation from react-router-dom
import logo from '../images/logo_white.png'; // Import your logo here
import '../styles/Navbar.css'; 

const Navbar = () => {
  const location = useLocation(); // Get current location

  return (
    <nav className="navbar">
      <img src={logo} alt="Logo" className="navbar-logo" />
      <div className="navbar-links">
        <Link to="/following" className={location.pathname === '/following' ? 'active' : ''}>
          Following
        </Link>
        <Link to="/explore" className={location.pathname === '/explore' ? 'active' : ''}>
          Explore
        </Link>
        <Link to="/sell" className={location.pathname === '/sell' ? 'active' : ''}>
          Sell
        </Link>
      </div>
      <div className="navbar-search">
        <input type="text" placeholder="Search..." className="search-bar" />
        <button className="search-button">Search</button>
      </div>
      <Link to="/profile" className="profile-icon">👤</Link>
    </nav>
  );
};

export default Navbar;
