# Video Class App

## Setup backend

### Create project directory
mkdir video-streaming-class
cd video-streaming-class

### Create backend directory and files
mkdir backend
cd backend

### Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

### Install dependencies
pip install -r requirements.txt

### Copy environment file and configure
cp .env.example .env
### Edit .env with your database URL and Stream credentials

### Run the application
python main.py

## Setup frontend

### From project root
cd ../  # Go back to project root

### Create frontend with Vite
npm create vite@latest frontend -- --template react-ts
cd frontend

### Remove default files and install dependencies
rm tsconfig.app.json  # Optional: use traditional config
npm install react-router-dom @stream-io/video-react-sdk axios

### Copy environment file and configure
cp .env.example .env
### Edit .env with your API URL and Stream API key

### Replace default files with the provided code above
### Copy all the component files, types, and configurations

### Start development server
npm run dev

## Create database
-- Create PostgreSQL database
`CREATE DATABASE classdb;`

-- The tables will be created automatically when you run the FastAPI server