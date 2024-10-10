import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.js';

const Layout = () => {
    return (
        <>
            <div>
                <Navbar />
                <Outlet />
            </div>
        </>
    )
}

export default Layout;