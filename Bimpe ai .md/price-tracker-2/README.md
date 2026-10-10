# Price Tracker

## Overview
The Price Tracker project is a web application that allows users to track and compare real-time prices of products from various e-commerce platforms. It integrates with APIs from Amazon and Shopify to fetch the latest price data and presents it in a user-friendly interface.

## Features
- Fetch real-time prices from multiple e-commerce platforms.
- Compare prices of products to find the best deals.
- Search functionality to easily find specific products.
- Responsive layout for a seamless user experience.

## Project Structure
```
price-tracker
├── src
│   ├── app
│   │   ├── api
│   │   │   └── prices
│   │   │       └── route.ts
│   │   ├── products
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components
│   │   ├── price-comparison.tsx
│   │   └── product-search.tsx
│   ├── integrations
│   │   ├── amazon.ts
│   │   └── shopify.ts
│   ├── lib
│   │   └── prices.ts
│   └── types
│       └── product.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd price-tracker
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage
To start the development server, run:
```
npm start
```
Visit `http://localhost:3000` in your browser to view the application.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.