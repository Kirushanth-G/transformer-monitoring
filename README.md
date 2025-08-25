# Transformer Monitoring System - Client Side

A React-based web application for monitoring electrical transformers, built with Vite for fast development and optimized builds.

## How to Access the Application

You have two options to view and interact with the Transformer Monitoring System:

### Option 1: Live Website (Recommended for Quick Access)
🌐 **Visit the deployed application:**
[http://react-powergrid.s3-website-ap-southeast-1.amazonaws.com/transformers](http://react-powergrid.s3-website-ap-southeast-1.amazonaws.com/transformers)

This is a live deployment of the application that you can access immediately without any setup.

### Option 2: Run Frontend Code Locally (For Development)
🔧 **Run the application on your local machine** (accessible at `http://localhost:5173`)

Follow the setup instructions below to run the frontend locally.

## How to Run the Project Locally

### Prerequisites

Before running this project locally, make sure you have the following installed:

#### Required Software

1. **Node.js** (version 18.0.0 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **npm** (version 9.0.0 or higher)
   - Usually comes with Node.js
   - Verify installation: `npm --version`

#### Development Tools (Recommended)

1. **Visual Studio Code**
   - Recommended extensions:
     - ES7+ React/Redux/React-Native snippets
     - Prettier - Code formatter
     - ESLint

### Setup Instructions

1. **Navigate to the project directory:**
   ```bash
   cd client-side
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   Open your browser and go to `http://localhost:5173`

The development server will automatically reload when you make changes to the code.

## Tech Stack

- **Frontend Framework:** React 19.1.0
- **Build Tool:** Vite
- **Styling:** Tailwindcss
- **HTTP Client:** Axios
- **Routing:** React Router
- **Development Server Port:** 5173

## Available Scripts

- `npm run dev` - Start development server on port 5173
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint


