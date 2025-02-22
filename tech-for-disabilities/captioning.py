# from flask import Flask, request, jsonify
# import openai
# import os
# from pydub import AudioSegment

# app = Flask(__name__)
# openai.api_key = "sk-ijklqrst5678uvwxijklqrst5678uvwxijklqrst"

# UPLOAD_FOLDER = "uploads"
# os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# @app.route("/transcribe", methods=["POST"])
# def transcribe():
#     if "audio" not in request.files:
#         return jsonify({"error": "No file uploaded"}), 400

#     file = request.files["audio"]
#     audio_path = os.path.join(UPLOAD_FOLDER, "audio.wav")
#     file.save(audio_path)

#     try:
#         with open(audio_path, "rb") as audio_file:
#             transcript = openai.Audio.transcribe("whisper-1", audio_file)

#         return jsonify({"text": transcript["text"]})
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=5000, debug=True)
