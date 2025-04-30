from flask import Blueprint, request, jsonify
from routes.auth import token_required
import openai
import os

persona_bp = Blueprint('persona', __name__)

# Mock database for demonstration
personas = {}

@persona_bp.route('/', methods=['GET'])
@token_required
def get_personas(current_user):
    user_personas = [p for p in personas.values() if p['user_id'] == current_user['id']]
    return jsonify(user_personas)

@persona_bp.route('/', methods=['POST'])
@token_required
def create_persona(current_user):
    data = request.get_json()
    
    if not data or not data.get('name') or not data.get('description'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    persona_id = str(len(personas) + 1)
    personas[persona_id] = {
        'id': persona_id,
        'user_id': current_user['id'],
        'name': data['name'],
        'description': data['description'],
        'created_at': datetime.utcnow().isoformat()
    }
    
    return jsonify(personas[persona_id]), 201

@persona_bp.route('/<persona_id>', methods=['GET'])
@token_required
def get_persona(current_user, persona_id):
    persona = personas.get(persona_id)
    if not persona or persona['user_id'] != current_user['id']:
        return jsonify({'message': 'Persona not found'}), 404
    return jsonify(persona)

@persona_bp.route('/<persona_id>', methods=['PUT'])
@token_required
def update_persona(current_user, persona_id):
    persona = personas.get(persona_id)
    if not persona or persona['user_id'] != current_user['id']:
        return jsonify({'message': 'Persona not found'}), 404
    
    data = request.get_json()
    if data.get('name'):
        persona['name'] = data['name']
    if data.get('description'):
        persona['description'] = data['description']
    
    return jsonify(persona)

@persona_bp.route('/<persona_id>', methods=['DELETE'])
@token_required
def delete_persona(current_user, persona_id):
    persona = personas.get(persona_id)
    if not persona or persona['user_id'] != current_user['id']:
        return jsonify({'message': 'Persona not found'}), 404
    
    del personas[persona_id]
    return jsonify({'message': 'Persona deleted successfully'}) 