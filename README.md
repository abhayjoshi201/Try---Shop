# 🛍️ Try & Buy Logistics Simulator

**A seamless simulation of the "Try Before You Buy" workflow, integrating Customer experience, Store Operations, and Last-Mile Logistics with AI-powered recommendations.**

![App Banner](https://via.placeholder.com/1200x400?text=Try+%26+Buy+Logistics+Simulator)

## 🚀 Overview
This application simulates a modern fashion e-commerce workflow designed to increase Average Order Value (AOV) through a "Try & Buy" model. It orchestrates the complex logistics of sending multiple items to a customer, allowing them to try them at home, and handling the instant return of unwanted items via the delivery rider.

It features an intelligent **Store Ops Dashboard** that uses (simulated) Google Gemini AI to recommend "Same Brand" cross-sell items (e.g., matching joggers for a hoodie) to be added to the package before dispatch.

## 📸 Screenshots

### 1. Customer View
*Browse the catalog and request "Try & Buy" to get multiple sizes sent home.*
![Customer View](https://via.placeholder.com/800x450?text=Customer+View+-+Catalog+%26+Checkout)

### 2. Store Ops View (The Brain)
*Manage incoming orders. The AI automatically suggests "Same Brand" cross-sell items to pack.*
![Store Ops View](https://via.placeholder.com/800x450?text=Store+Ops+View+-+AI+Recommendations)

### 3. Rider View (The Last Mile)
*Manage deliveries and process instant returns at the customer's doorstep.*
![Rider View](https://via.placeholder.com/800x450?text=Rider+View+-+Delivery+%26+Returns)

### 4. AI Fashion Assistant
*Chat with the AI for styling advice and order updates.*
![Chatbot](https://via.placeholder.com/800x450?text=AI+Chatbot+Interface)

## ✨ Key Features

### 👤 Customer View
*   **Catalog Browsing:** View products with rich details (Brand, Size, Price).
*   **Try & Buy Toggle:** Option to request a "Try & Buy" order, signaling the backend to prepare additional sizes or style variations.
*   **Instant Checkout:** seamless mock checkout experience.

### 🏭 Store Ops View
*   **Real-time Order Feed:** Auto-refreshing list of incoming orders.
*   **AI Recommendation Engine:**
    *   Automatically generates packing suggestions based on the primary item.
    *   **"Same Brand" Logic:** Prioritizes matching items (Cross-sell) to complete a look.
    *   **Smart Badging:** Highlights "Same Brand" items and "High Match" probability.
*   **Packing Workflow:** Interactive packing list to add AI suggestions or missing sizes before marking "Ready for Delivery".

### 🚚 Rider View
*   **Delivery Management:** View active deliveries and customer details.
*   **On-Site Returns:** Interactive checklist to mark exactly which items the customer kept vs. returned at the door.
*   **Inventory Re-sync:** Automatically updates stock levels and calculates final payment based on kept items.

## 🛠️ Tech Stack

*   **Frontend:** React 19, TypeScript, Vite
*   **Styling:** Tailwind CSS, Lucide React (Icons)
*   **AI Integration:** Google Gemini SDK (Logic simulated via `geminiService.ts` for consistent demo behavior).
*   **Data Layer:** In-memory Mock Service (Architecture supports swapping for real Shopify GraphQL API).

## 📦 Installation & Run

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/try-and-buy-logistics.git
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the application**
    ```bash
    npm start
    ```
    *Open [http://localhost:3000](http://localhost:3000) to view it in the browser.*

---

*Built for the Google Gemini Developer Competition.*
