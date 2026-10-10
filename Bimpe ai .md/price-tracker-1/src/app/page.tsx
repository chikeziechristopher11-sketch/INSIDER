import React from 'react';
import Layout from './layout';
import ProductList from '../products/page';

const HomePage: React.FC = () => {
    return (
        <Layout>
            <h1>Welcome to the Price Tracker</h1>
            <ProductList />
        </Layout>
    );
};

export default HomePage;