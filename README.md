# Ainhoa's Library

A modern library management system with multiple backend options for flexibility and learning.

## Architecture

This projects frontend uses **Angulars latest version (20th at the moment)**.

It supports **two different backend architectures**:

1. **.NET Backend** - SQLite database with Entity Framework Core
2. **Node.js Server** - In-memory data with WebSocket real-time updates

## Quick Start

### Prerequisites
- Node.js (for Angular frontend)
- .NET 9.0 SDK (for .NET backend option)

### Setup

Run the following steps in your prefered terminal;

1. **Clone the project:**
   ```bash
   git clone https://github.com/asalsid/ainhoas-library.git
   cd ainhoas-library
   ```

2. **Install frontend dependencies:**
   ```bash
   cd library-frontend
   npm install
   ```

3. **Build backend dependencies:**
   ```bash
   cd ../library-backend
   dotnet build
   ```

## Running the Application

The frontend can access both backends, therefor, run each of the following steps in different terminals:

1. **Start the .NET backend:**
   ```bash
   cd library-backend
   dotnet run
   ```
   Backend will run on `http://localhost:5000`

2. **Start the Node.js server:**
   ```bash
   cd library-frontend
   npm run server
   ```
   Server will run on `http://localhost:3000`

3. **Start the Angular frontend:**
   ```bash
   cd library-frontend
   npm start
   ```
   Frontend will run on `http://localhost:4200`

4. **Open your browser:** `http://localhost:4200`

## Features

- **Book Management**: Add, edit, delete, and view books
- **Real-time Updates**: Live data synchronization across all clients
- **Multiple Backends**: Switch between different data persistence options
- **Responsive Design**: Works on desktop and mobile devices
- **Pagination**: Efficient browsing of large book collections

Thank you for visiting Ainhoa's Library!