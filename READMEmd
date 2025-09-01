# Madlen Case Study

This project is a full-stack web application that allows users to generate, view, and read short stories created with the help of an LLM.

## Tech Stack

### Backend (/server)

*   **Python & FastAPI**
    * I have chosen FastAPI for its high performance and native async support, which is ideal for handling long-running operations like waiting for a response from the LLM api. Pydantic data validation ensured type safety and sped up the development.

*   **SQLite & SQLAlchemy**
    * SQLite for its simplicity and zero-configuration setup compared to other db engines.
    * SQLAlchemy for providing a safe and programmatic way to interact with the database, making the code cleaner and database-agnostic.

*   **OpenRouter**
    * OpenRouter acts as an aggregator for various LLMs, providing access to free models. This allowed for the implementation of the core AI feature without incurring any costs, and also offering flexibility in case we need to change the LLM used.
    Mistral 7B was chosen as the LLM to be used (for now).

### Frontend (/client)

*   **React**
    * Flagship framework for UI development. I had previous work experience in React and Tailwind which made them a clear choice for this case.

*   **Tailwind CSS**
    *   Enables rapid UI development directly within the JSX markup. This speeds up styling since there is no need for creating separate css classes. Also prevents css override bugs.


---

## Project Setup & Installation

### Prerequisites

- Python 3.8+
- Node.js v20.19.0+
- An API key from [OpenRouter.ai](https://openrouter.ai/keys)

### Backend Setup

1.  Navigate to the server directory: cd server
2.  Create and activate a virtual environment:
    
    python -m venv venv
    source venv/bin/activate
    
    (venv\Scripts\activate on Windows)

3.  Install Python dependencies: pip install -r requirements.txt 

4.  Create a .env file in the /server root and add your API key:
    
    OPENROUTER_API_KEY="your_key"
    

### Frontend Setup

1.  Navigate to the client directory: cd client
2.  Install Node.js dependencies: npm install
3.  Create a .env file add the backend API URL:
    
    VITE_API_BASE_URL=http://127.0.0.1:8000
    


## How to Run the Application

1.  **Run the Backend Server:**
    - From the /server directory (with the virtual environment active):
    
    uvicorn app.main:app --reload
    
    - The API will be available at http://127.0.0.1:8000.

2.  **Run the Frontend Development Server:**
    - Navigate to the /client directory:
    
    npm run dev
    
    - The application will be available at http://localhost:5173.