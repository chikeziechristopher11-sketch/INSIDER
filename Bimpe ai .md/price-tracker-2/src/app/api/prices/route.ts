import { NextResponse } from 'next/server';
import { fetchAmazonPrices } from '../../../integrations/amazon';
import { fetchShopifyPrices } from '../../../integrations/shopify';

export async function GET() {
    try {
        const amazonPrices = await fetchAmazonPrices();
        const shopifyPrices = await fetchShopifyPrices();

        const combinedPrices = {
            amazon: amazonPrices,
            shopify: shopifyPrices,
        };

        return NextResponse.json(combinedPrices);
    } catch (error) {
        return NextResponse.error();
    }
}