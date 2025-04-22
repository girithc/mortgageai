import openai
import json
from app.db.config import Config

openai.api_key = Config.OPENAI_API_KEY

def classify_and_extract_income(file_storage) -> tuple:
    try:
        # Upload the PDF file from a file-like object (Flask's file stream)
        uploaded_file = openai.files.create(
            file=(file_storage.filename, file_storage.stream),
            purpose="assistants"
        )

        system_prompt = (
            "You are a document analysis assistant. "
            "Given a PDF file, you must:\n"
            "1. Classify it as one of: Pay Stub, W-2, or Bank Statement.\n"
            "2. Estimate the yearly income from the document.\n\n"
            "Respond ONLY in this JSON format:\n"
            "{\n"
            "  \"document_type\": \"\{type\}\",\n"
            "  \"yearly_income\": \"\{income\}\"\n"
            "}\n\n"
            "Do not add any extra text, markdown, or explanation. Just return valid JSON."
        )

        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": "Please classify the document and determine the yearly income.", "file_ids": [uploaded_file.id]}
            ]
        )

        response_content = response.choices[0].message.content.strip()
        print("GPT raw output:", response_content)
        parsed = json.loads(response_content)

        return parsed.get("document_type", "Unknown"), parsed.get("yearly_income", "Unknown")

    except Exception as e:
        return f"Error: {str(e)}", "Unknown"
