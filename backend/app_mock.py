from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import uuid

app = Flask(__name__)
CORS(app)

# Mock database for testing (in-memory storage)
mock_db = {
    'polls': {},
    'responses': {}
}

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Book Club Poll API is running (Mock Mode)'})

@app.route('/api/polls', methods=['GET'])
def get_polls():
    """Get all polls"""
    try:
        polls = list(mock_db['polls'].values())
        return jsonify({'polls': polls})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/polls/<poll_id>', methods=['GET'])
def get_poll(poll_id):
    """Get a specific poll by ID"""
    try:
        if poll_id not in mock_db['polls']:
            return jsonify({'error': 'Poll not found'}), 404
        
        return jsonify(mock_db['polls'][poll_id])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/polls', methods=['POST'])
def create_poll():
    """Create a new poll"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('title'):
            return jsonify({'error': 'Title is required'}), 400
        if not data.get('questions'):
            return jsonify({'error': 'Questions are required'}), 400
        
        poll_id = str(uuid.uuid4())
        poll_data = {
            'id': poll_id,
            'title': data['title'],
            'description': data.get('description', ''),
            'questions': data['questions'],
            'created_at': datetime.utcnow().isoformat(),
            'active': data.get('active', True)
        }
        
        mock_db['polls'][poll_id] = poll_data
        
        return jsonify(poll_data), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/polls/<poll_id>/responses', methods=['POST'])
def submit_response(poll_id):
    """Submit a response to a poll"""
    try:
        data = request.get_json()
        
        # Validate poll exists
        if poll_id not in mock_db['polls']:
            return jsonify({'error': 'Poll not found'}), 404
        
        # Validate required fields
        if not data.get('responses'):
            return jsonify({'error': 'Responses are required'}), 400
        
        response_id = str(uuid.uuid4())
        response_data = {
            'id': response_id,
            'poll_id': poll_id,
            'responses': data['responses'],
            'respondent_name': data.get('respondent_name', 'Anonymous'),
            'submitted_at': datetime.utcnow().isoformat()
        }
        
        if poll_id not in mock_db['responses']:
            mock_db['responses'][poll_id] = []
        
        mock_db['responses'][poll_id].append(response_data)
        
        return jsonify(response_data), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/polls/<poll_id>/responses', methods=['GET'])
def get_poll_responses(poll_id):
    """Get all responses for a specific poll"""
    try:
        # Validate poll exists
        if poll_id not in mock_db['polls']:
            return jsonify({'error': 'Poll not found'}), 404
        
        # Get all responses for this poll
        responses = mock_db['responses'].get(poll_id, [])
        
        return jsonify({'responses': responses})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/polls/<poll_id>/results', methods=['GET'])
def get_poll_results(poll_id):
    """Get aggregated results for a poll"""
    try:
        # Validate poll exists
        if poll_id not in mock_db['polls']:
            return jsonify({'error': 'Poll not found'}), 404
        
        poll_data = mock_db['polls'][poll_id]
        
        # Get all responses
        responses = mock_db['responses'].get(poll_id, [])
        
        # Aggregate results
        results = {
            'poll_id': poll_id,
            'poll_title': poll_data.get('title'),
            'total_responses': len(responses),
            'questions': []
        }
        
        # Process each question
        for idx, question in enumerate(poll_data.get('questions', [])):
            question_results = {
                'question': question.get('question'),
                'type': question.get('type'),
                'answers': {}
            }
            
            # Count responses for this question
            for response in responses:
                answer = response.get('responses', {}).get(str(idx))
                if answer:
                    if question.get('type') in ['multiple_choice', 'rating']:
                        question_results['answers'][answer] = question_results['answers'].get(answer, 0) + 1
                    elif question.get('type') == 'text':
                        if 'text_responses' not in question_results:
                            question_results['text_responses'] = []
                        question_results['text_responses'].append(answer)
            
            results['questions'].append(question_results)
        
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Create a sample poll for testing
    sample_poll_id = str(uuid.uuid4())
    mock_db['polls'][sample_poll_id] = {
        'id': sample_poll_id,
        'title': 'Book Club Monthly Poll',
        'description': 'Help us choose our next book and share your thoughts',
        'questions': [
            {
                'question': 'What was your favorite book this month?',
                'type': 'text'
            },
            {
                'question': 'How would you rate this month\'s book?',
                'type': 'rating',
                'options': ['1', '2', '3', '4', '5']
            },
            {
                'question': 'Which book should we read next?',
                'type': 'multiple_choice',
                'options': ['The Great Gatsby', '1984', 'To Kill a Mockingbird', 'Pride and Prejudice']
            }
        ],
        'created_at': datetime.utcnow().isoformat(),
        'active': True
    }
    
    print(f"Sample poll created with ID: {sample_poll_id}")
    print(f"Access it at: http://localhost:5000/api/polls/{sample_poll_id}")
    
    # Use debug mode only in development
    # For production, use a production WSGI server like gunicorn
    import os
    debug_mode = os.environ.get('FLASK_ENV', 'development') == 'development'
    app.run(debug=debug_mode, host='0.0.0.0', port=5000)
