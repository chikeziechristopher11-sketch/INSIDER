import axios from 'axios';
import { Product } from '../types/product';

const AMAZON_API_URL = 'https://api.amazon.com/products'; // Replace with actual Amazon API endpoint

export const fetchAmazonProductPrices = async (productId: string): Promise<Product | null> => {
    try {
        const response = await axios.get(`${AMAZON_API_URL}/${productId}`);
        const productData = response.data;

        return {
            id: productData.id,
            name: productData.name,
            price: productData.price,
            source: 'Amazon',
        } as Product;
    } catch (error) {
        console.error('Error fetching product prices from Amazon:', error);
        return null;
    }
};