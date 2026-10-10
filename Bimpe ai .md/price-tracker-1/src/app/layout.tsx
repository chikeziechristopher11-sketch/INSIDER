import React from 'react';

const Layout: React.FC = ({ children }) => {
    return (
        <div>
            <header>
                <h1>Price Tracker</h1>
            </header>
            <main>{children}</main>
            <footer>
                <p>&copy; {new Date().getFullYear()} Price Tracker. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Layout;