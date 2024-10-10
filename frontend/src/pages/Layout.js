import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navbar from '../Navbar';

const Layout = () => {
    return (
        <>
            <div>
                <Navbar />
                <Outlet />
            </div>

            <Outlet />
        </>
    )
}

export default Layout;