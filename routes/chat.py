from flask import Blueprint, request, jsonify
from flask_socketio import emit
from routes.auth import token_required
import openai
import os
from datetime import datetime

chat_bp = Blueprint('chat', __name__)

# Mock database for demonstration
chats = {}

@chat_bp.route('/', methods=['GET'])
@token_required
def get_chats(current_user):
    user_chats = [c for c in chats.values() if c['user_id'] == current_user['id']]
    return jsonify(user_chats)

@chat_bp.route('/', methods=['POST'])
@token_required
def create_chat(current_user):
    data = request.get_json()
    
    if not data or not data.get('persona_id'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    chat_id = str(len(chats) + 1)
    chats[chat_id] = {
        'id': chat_id,
        'user_id': current_user['id'],
        'persona_id': data['persona_id'],
        'messages': [],
        'created_at': datetime.utcnow().isoformat()
    }
    
    return jsonify(chats[chat_id]), 201

@chat_bp.route('/<chat_id>', methods=['GET'])
@token_required
def get_chat(current_user, chat_id):
    chat = chats.get(chat_id)
    if not chat or chat['user_id'] != current_user['id']:
        return jsonify({'message': 'Chat not found'}), 404
    return jsonify(chat)

@chat_bp.route('/<chat_id>/messages', methods=['POST'])
@token_required
def send_message(current_user, chat_id):
    chat = chats.get(chat_id)
    if not chat or chat['user_id'] != current_user['id']:
        return jsonify({'message': 'Chat not found'}), 404
    
    data = request.get_json()
    if not data or not data.get('content'):
        return jsonify({'message': 'Missing message content'}), 400
    
    message = {
        'id': str(len(chat['messages']) + 1),
        'content': data['content'],
        'role': 'user',
        'timestamp': datetime.utcnow().isoformat()
    }
    
    chat['messages'].append(message)
    
    # Get persona for context
    persona = personas.get(chat['persona_id'])
    if not persona:
        return jsonify({'message': 'Persona not found'}), 404
    
    # Generate AI response
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": persona['description']},
                {"role": "user", "content": data['content']}
            ]
        )
        
        ai_message = {
            'id': str(len(chat['messages']) + 1),
            'content': response.choices[0].message.content,
            'role': 'assistant',
            'timestamp': datetime.utcnow().isoformat()
        }
        
        chat['messages'].append(ai_message)
        
        return jsonify({
            'user_message': message,
            'ai_message': ai_message
        })
    except Exception as e:
        return jsonify({'message': 'Error generating response'}), 500 