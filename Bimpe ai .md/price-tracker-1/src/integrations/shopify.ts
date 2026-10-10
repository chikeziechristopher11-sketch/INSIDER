import axios from 'axios';
import { Product } from '../types/product';

const SHOPIFY_API_URL = 'https://your-shopify-store.myshopify.com/admin/api/2023-01/products.json';
const SHOPIFY_ACCESS_TOKEN = 'your_access_token_here';

export const fetchShopifyProducts = async (): Promise<Product[]> => {
    try {
        const response = await axios.get(SHOPIFY_API_URL, {
            headers: {
                'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
                'Content-Type': 'application/json',
            },
        });

        const products: Product[] = response.data.products.map((product: any) => ({
            id: product.id,
            name: product.title,
            price: product.variants[0].price,
            source: 'Shopify',
        }));

        return products;
    } catch (error) {
        console.error('Error fetching products from Shopify:', error);
        throw new Error('Failed to fetch products from Shopify');
    }
};