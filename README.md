# 📚 Book Club Poll

A web application for conducting polls in book clubs with questions like "What was your favorite book?" or "How would you rate this book?". Built with React frontend, Flask backend, and Firebase for hosting and database.

## Features

- **Easy Poll Creation**: Simple interface to create polls with multiple question types
- **Multiple Question Types**: 
  - Multiple choice (e.g., "Which book should we read next?")
  - Text answers (e.g., "What was your favorite book?")
  - Rating scale (e.g., "How would you rate this book?")
- **Real-time Results**: View aggregated poll results with visual charts
- **Firebase Integration**: Hosted on Firebase with Firestore database
- **Responsive Design**: Works on desktop and mobile devices

## Architecture

- **Frontend**: React.js with modern UI components
- **Backend**: Flask REST API
- **Database**: Firebase Firestore
- **Hosting**: Firebase Hosting

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- Python 3.8+
- Firebase account and project

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Set up Firebase:
   - Create a Firebase project at https://console.firebase.google.com/
   - Enable Firestore Database
   - Download serviceAccountKey.json from Project Settings > Service Accounts
   - Place it in the `backend` directory

4. Run the Flask server:
```bash
python app.py
```

The API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```
Edit `.env` and add your Firebase configuration

4. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## Deployment

### Deploy to Firebase

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase (if not already done):
```bash
firebase init
```
Select Hosting and choose your project

4. Build the frontend:
```bash
cd frontend
npm run build
```

5. Deploy:
```bash
cd ..
firebase deploy
```

### Deploy Backend

The Flask backend can be deployed to:
- Google Cloud Run
- Heroku
- AWS Elastic Beanstalk
- Any Python-compatible hosting service

Make sure to set environment variables for production deployment.

## Usage

### Creating a Poll

1. Click "Create Poll" in the navigation
2. Enter a title and optional description
3. Add questions (click "+ Add Question" for each new question)
4. For each question:
   - Enter the question text (e.g., "What was your favorite book?")
   - Select question type (Multiple Choice, Text, or Rating)
   - For multiple choice, add options (e.g., book titles)
5. Click "Create Poll"

### Taking a Poll

1. Select a poll from the list
2. Click "Take Poll"
3. Answer all questions
4. Optionally enter your name
5. Submit your responses

### Viewing Results

1. Click "View Results" on any poll
2. See aggregated results with:
   - Bar charts for multiple choice questions
   - Average ratings for rating questions
   - All text responses for open-ended questions

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/polls` | Get all polls |
| GET | `/api/polls/<id>` | Get specific poll |
| POST | `/api/polls` | Create new poll |
| POST | `/api/polls/<id>/responses` | Submit poll response |
| GET | `/api/polls/<id>/responses` | Get poll responses |
| GET | `/api/polls/<id>/results` | Get aggregated results |

## Project Structure

```
book-club-poll/
├── backend/
│   ├── app.py                 # Flask application
│   ├── requirements.txt       # Python dependencies
│   └── README.md             # Backend documentation
├── frontend/
│   ├── public/               # Static files
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── CreatePoll.js
│   │   │   ├── TakePoll.js
│   │   │   ├── PollList.js
│   │   │   └── PollResults.js
│   │   ├── App.js           # Main app component
│   │   ├── api.js           # API client
│   │   └── config.js        # Configuration
│   └── package.json         # Node dependencies
├── firebase.json            # Firebase hosting config
└── README.md               # This file
```

## Technologies Used

- **Frontend**:
  - React 18
  - Axios for HTTP requests
  - CSS3 for styling
  
- **Backend**:
  - Flask 3.0
  - Firebase Admin SDK
  - Flask-CORS
  
- **Database & Hosting**:
  - Firebase Firestore
  - Firebase Hosting

## License

MIT License

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.
