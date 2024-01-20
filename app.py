from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import json
app = Flask(__name__)
CORS(app)
USER_DATA = './data/user.json'
ALBUMS_DATA = "./data/albums.json"
PHOTOS_DATA = "./data/photos.json"


@app.route('/users', methods=['GET'])
def get_data():
    try:
        with open(USER_DATA, 'r') as json_file:
            data = json.load(json_file)
        return jsonify(data)
    except FileNotFoundError:
        return jsonify({"error": "Data file not found"}), 404
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON data"}), 500
    
@app.route('/users/<int:user_id>', methods=['GET'])
def user_details(user_id):
    try:
        with open(USER_DATA, 'r') as json_file:
            users = json.load(json_file)
            for user in users:
                if user['id'] == user_id:
                    return jsonify(user)
    except FileNotFoundError:
        return jsonify({"error": "Data file not found"}), 404
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON data"}), 500


@app.route('/edit/<int:user_id>', methods=['POST'])
def edit_user(user_id):
    try:
        with open(USER_DATA, 'r') as json_file:
            data = json.load(json_file)
            user = next((u for u in data if u['id'] == user_id), None)
            if user:
                user['name'] = request.form['name']
                user['email'] = request.form['email']
                user['address']['street'] = request.form['street']
                user['address']['suite'] = request.form['suite']
                user['address']['city'] = request.form['city']
                user['address']['zipcode'] = request.form['zipcode']
                user['phone'] = request.form['phone']
                user['website'] = request.form['website']
                user['company']['name'] = request.form['company_name']
                user['company']['bs'] = request.form['bs']
                with open(USER_DATA, 'w') as json_file:
                    json.dump(data, json_file, indent=2)
                return jsonify({"message":"user updated successfully"})
            else:
                return jsonify({"error": "User not found"}), 404

    except FileNotFoundError:
        return jsonify({"error": "Data file not found"}), 404
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON data"}), 500

@app.route('/user/delete/<int:user_id>', methods=['POST'])
def delete_user(user_id):
    try:
        with open(USER_DATA, 'r') as json_file:
            data = json.load(json_file)
            user_index = next((i for i, u in enumerate(data) if u['id'] == user_id), None)
            if user_index is not None:
                data.pop(user_index)
                with open(USER_DATA, 'w') as json_file:
                    json.dump(data, json_file, indent=2)

                return jsonify({"message":"user deleted successfully"})
            else:
                return jsonify({"error": "User not found"}), 404

    except FileNotFoundError:
        return jsonify({"error": "Data file not found"}), 404
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON data"}), 500


@app.route('/add_user', methods=['POST'])
def add_user():
    try:
        with open(USER_DATA, 'r') as json_file:
            data = json.load(json_file)
            new_user = {
                'id': data[len(data) - 1]['id'] + 1, 
                'name': request.form['name'],
                'username': request.form['username'],
                'email':request.form['email'],
                'address':{
                    'street' : request.form['street'],
                    'suite' : request.form['suite'],
                    'city': request.form['city'],
                    'zipcode': request.form['zipcode']
                },
                'phone':request.form['phone'],
                'website':request.form['website'],
                'company':{
                    'name': request.form['company_name'],
                    'bs' : request.form['bs']
                }
                
            }
            data.append(new_user)
            with open(USER_DATA, 'w') as json_file:
                json.dump(data, json_file, indent=2)

            return jsonify({"message":"user added successfully"})


    except FileNotFoundError:
        return jsonify({"error": "Data file not found"}), 404
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON data"}), 500


@app.route("/albums")
def show_albums():
    user_id = int(request.args.get('userId'))
    try:
        with open(ALBUMS_DATA, "r") as json_file:
            data = json.load(json_file)
            albums = []
            for album in data:
                if album['userId'] == user_id:
                    albums.append(album)
            return jsonify(albums)
    except FileNotFoundError:
        return jsonify({"error": "Data file not found"}), 404
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON data"}), 500

@app.route("/albums/details",)
def album_details():
    album_id = int(request.args.get('albumId'))
    try:
        with open(ALBUMS_DATA, "r") as json_file:
            data = json.load(json_file)
            for album in data:
                if album['id'] == album_id:
                    return jsonify(album)
    
    except FileNotFoundError:
        return jsonify({"error": "Data file not found"}), 404
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON data"}), 500



@app.route("/albums/edit", methods=['POST'])
def update_album():
    album_id = int(request.args.get('albumId'))
    try:
        with open(ALBUMS_DATA, "r") as json_file:
            data = json.load(json_file)
            for album in data:
                if album['id'] == album_id:
                    album['title'] = request.form['title']
                    with open(ALBUMS_DATA, "w") as updated_json_file:
                        json.dump(data, updated_json_file, indent=2)
                    return jsonify({"message":"Album Updated"})
            return jsonify({"message": "Invalid Album Id"})        
    except FileNotFoundError:
        return jsonify({"error": "Data file not found"}), 404
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON data"}), 500
    
@app.route("/album/delete", methods=['POST'])
def delete_album():
    album_id = int(request.args.get('albumId'))
    try:
        with open(ALBUMS_DATA, "r") as json_file:
            data = json.load(json_file)
            for album in data:
                if album['id'] == album_id:
                    data.remove(album)
                    with open(ALBUMS_DATA, "w") as updated_json_file:
                        json.dump(data, updated_json_file, indent=2)
                    return jsonify({"message": "Album Deleted"})
            return jsonify({"message": "Invalid Album Id"})
    except FileNotFoundError:
        return jsonify({"error": "Data file not found"}), 404
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON data"}), 500



@app.route('/albums/photos')
def get_photos():
    albums_id = int(request.args.get('albumId'))
    try:
        with open(PHOTOS_DATA, "r") as json_file:
            data = json.load(json_file)
            photos = []
            for photo in data:
                if photo['albumId'] == albums_id:
                    photos.append(photo)
            return jsonify(photos)
    except FileNotFoundError:
        return jsonify({"error": "Data file not found"}), 404
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON data"}), 500



if __name__ == '__main__':
    app.run(debug=True)
