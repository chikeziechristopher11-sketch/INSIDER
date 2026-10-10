export interface Product {
    id: string;
    name: string;
    price: number;
    source: 'amazon' | 'shopify';
    imageUrl?: string;
    description?: string;
}