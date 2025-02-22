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
