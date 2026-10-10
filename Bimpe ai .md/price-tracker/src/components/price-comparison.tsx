import React, { useEffect, useState } from 'react';
import { fetchPrices } from '../lib/prices';
import { Product } from '../types/product';

const PriceComparison: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getPrices = async () => {
            try {
                const priceData = await fetchPrices();
                setProducts(priceData);
            } catch (err) {
                setError('Failed to fetch prices');
            } finally {
                setLoading(false);
            }
        };

        getPrices();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h2>Price Comparison</h2>
            <ul>
                {products.map((product) => (
                    <li key={product.id}>
                        <span>{product.name}</span>: ${product.price} (Source: {product.source})
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PriceComparison;