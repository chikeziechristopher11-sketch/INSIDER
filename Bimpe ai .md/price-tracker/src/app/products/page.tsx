import React, { useEffect, useState } from 'react';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('/api/prices');
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div>
            <h1>Product Prices</h1>
            <ul>
                {products.map(product => (
                    <li key={product.id}>
                        {product.name}: ${product.price} (Source: {product.source})
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProductsPage;