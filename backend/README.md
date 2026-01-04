# Backend - Book Club Poll API

Flask backend for the Book Club Poll application.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure Firebase:
   - Create a Firebase project
   - Download serviceAccountKey.json from Firebase Console
   - Place it in the backend directory

3. Run the development server:
```bash
python app.py
```

The API will be available at http://localhost:5000

## API Endpoints

### Health Check
- `GET /api/health` - Check API status

### Polls
- `GET /api/polls` - Get all polls
- `GET /api/polls/<poll_id>` - Get specific poll
- `POST /api/polls` - Create new poll

### Responses
- `POST /api/polls/<poll_id>/responses` - Submit poll response
- `GET /api/polls/<poll_id>/responses` - Get all responses for a poll
- `GET /api/polls/<poll_id>/results` - Get aggregated results

## Data Structure

### Poll
```json
{
  "title": "Book Club Poll",
  "description": "Monthly book selection",
  "questions": [
    {
      "question": "Which book should we read?",
      "type": "multiple_choice",
      "options": ["Book A", "Book B", "Book C"]
    }
  ]
}
```

### Response
```json
{
  "responses": {
    "0": "Book A"
  },
  "respondent_name": "John Doe"
}
```
