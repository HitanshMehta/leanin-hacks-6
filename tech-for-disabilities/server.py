from flask import Flask, request, jsonify
from googletrans import Translator

app = Flask(__name__)
translator = Translator()

@app.route("/translate", methods=["POST"])
def translate_text():
    data = request.get_json()
    text = data.get("text", "")
    src = data.get("source", "auto")
    dest = data.get("target", "en")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    translated = translator.translate(text, src=src, dest=dest)
    return jsonify({"translated_text": translated.text})

if __name__ == "__main__":
    app.run(debug=True)

# from flask import Flask, request, jsonify
# from googletrans import Translator
# import os
# import math
# import ffmpeg
# from faster_whisper import WhisperModel

# app = Flask(__name__)
# translator = Translator()

# # Load Whisper model for transcription
# whisper_model = WhisperModel("small")

# # Translation endpoint
# @app.route("/translate", methods=["POST"])
# def translate_text():
#     data = request.get_json()
#     text = data.get("text", "")
#     src = data.get("source", "auto")
#     dest = data.get("target", "en")

#     if not text:
#         return jsonify({"error": "No text provided"}), 400

#     translated = translator.translate(text, src=src, dest=dest)
#     return jsonify({"translated_text": translated.text})

# # Transcription endpoint
# @app.route("/transcribe", methods=["POST"])
# def transcribe_video():
#     if "file" not in request.files:
#         return jsonify({"error": "No file provided"}), 400

#     video_file = request.files["file"]
#     video_path = f"uploads/{video_file.filename}"
#     video_file.save(video_path)

#     # Extract audio
#     audio_path = extract_audio(video_path)

#     # Transcribe audio
#     language, subtitles = transcribe(audio_path)

#     # Clean up files
#     os.remove(video_path)
#     os.remove(audio_path)

#     return jsonify({
#         "language": language,
#         "subtitles": subtitles
#     })

# # Helper function to extract audio
# def extract_audio(video_path):
#     audio_path = video_path.replace(".mp4", ".wav")
#     ffmpeg.input(video_path).output(audio_path).run(overwrite_output=True)
#     return audio_path

# # Helper function to transcribe audio
# def transcribe(audio_path):
#     segments, info = whisper_model.transcribe(audio_path)
#     language = info.language
#     subtitles = []
#     for segment in segments:
#         start_time = format_time(segment.start)
#         end_time = format_time(segment.end)
#         subtitles.append({
#             "start": start_time,
#             "end": end_time,
#             "text": segment.text
#         })
#     return language, subtitles

# # Helper function to format time
# def format_time(seconds):
#     hours = math.floor(seconds / 3600)
#     seconds %= 3600
#     minutes = math.floor(seconds / 60)
#     seconds %= 60
#     milliseconds = round((seconds - math.floor(seconds)) * 1000)
#     seconds = math.floor(seconds)
#     return f"{hours:02d}:{minutes:02d}:{seconds:01d},{milliseconds:03d}"

# if __name__ == "__main__":
#     os.makedirs("uploads", exist_ok=True)
#     app.run(host="0.0.0.0", port=5000, debug=True)