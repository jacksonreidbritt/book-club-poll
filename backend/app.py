from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Initialize Firebase Admin SDK
def initialize_firebase():
    """Initialize Firebase Admin SDK with credentials"""
    try:
        # Check if already initialized
        firebase_admin.get_app()
    except ValueError:
        # Initialize with default credentials or service account
        if os.path.exists('serviceAccountKey.json'):
            cred = credentials.Certificate('serviceAccountKey.json')
            firebase_admin.initialize_app(cred)
        else:
            # Use default credentials in production
            firebase_admin.initialize_app()
    
    return firestore.client()

db = initialize_firebase()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Book Club Poll API is running'})

@app.route('/api/polls', methods=['GET'])
def get_polls():
    """Get all polls"""
    try:
        polls_ref = db.collection('polls')
        polls = []
        for doc in polls_ref.stream():
            poll_data = doc.to_dict()
            poll_data['id'] = doc.id
            polls.append(poll_data)
        return jsonify({'polls': polls})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/polls/<poll_id>', methods=['GET'])
def get_poll(poll_id):
    """Get a specific poll by ID"""
    try:
        poll_ref = db.collection('polls').document(poll_id)
        poll = poll_ref.get()
        
        if not poll.exists:
            return jsonify({'error': 'Poll not found'}), 404
        
        poll_data = poll.to_dict()
        poll_data['id'] = poll.id
        return jsonify(poll_data)
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
        
        poll_data = {
            'title': data['title'],
            'description': data.get('description', ''),
            'questions': data['questions'],
            'created_at': datetime.utcnow().isoformat(),
            'active': data.get('active', True)
        }
        
        # Add poll to Firestore
        poll_ref = db.collection('polls').document()
        poll_ref.set(poll_data)
        
        poll_data['id'] = poll_ref.id
        return jsonify(poll_data), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/polls/<poll_id>/responses', methods=['POST'])
def submit_response(poll_id):
    """Submit a response to a poll"""
    try:
        data = request.get_json()
        
        # Validate poll exists
        poll_ref = db.collection('polls').document(poll_id)
        poll = poll_ref.get()
        
        if not poll.exists:
            return jsonify({'error': 'Poll not found'}), 404
        
        # Validate required fields
        if not data.get('responses'):
            return jsonify({'error': 'Responses are required'}), 400
        
        response_data = {
            'poll_id': poll_id,
            'responses': data['responses'],
            'respondent_name': data.get('respondent_name', 'Anonymous'),
            'submitted_at': datetime.utcnow().isoformat()
        }
        
        # Add response to Firestore
        response_ref = db.collection('responses').document()
        response_ref.set(response_data)
        
        response_data['id'] = response_ref.id
        return jsonify(response_data), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/polls/<poll_id>/responses', methods=['GET'])
def get_poll_responses(poll_id):
    """Get all responses for a specific poll"""
    try:
        # Validate poll exists
        poll_ref = db.collection('polls').document(poll_id)
        poll = poll_ref.get()
        
        if not poll.exists:
            return jsonify({'error': 'Poll not found'}), 404
        
        # Get all responses for this poll
        responses_ref = db.collection('responses').where('poll_id', '==', poll_id)
        responses = []
        for doc in responses_ref.stream():
            response_data = doc.to_dict()
            response_data['id'] = doc.id
            responses.append(response_data)
        
        return jsonify({'responses': responses})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/polls/<poll_id>/results', methods=['GET'])
def get_poll_results(poll_id):
    """Get aggregated results for a poll"""
    try:
        # Validate poll exists
        poll_ref = db.collection('polls').document(poll_id)
        poll = poll_ref.get()
        
        if not poll.exists:
            return jsonify({'error': 'Poll not found'}), 404
        
        poll_data = poll.to_dict()
        
        # Get all responses
        responses_ref = db.collection('responses').where('poll_id', '==', poll_id)
        responses = [doc.to_dict() for doc in responses_ref.stream()]
        
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
    app.run(debug=True, host='0.0.0.0', port=5000)
