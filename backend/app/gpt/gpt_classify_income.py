import openai
import json
from app.db.config import Config

client = openai.OpenAI(api_key=Config.OPENAI_API_KEY)

def classify_and_extract_income_from_text(text: str) -> tuple:
    prompt = (
        "You are a document assistant. Analyze the following text and respond ONLY in raw JSON format.\n"
        "1. Classify it as one of: Pay Stub, W-2, Bank Statement.\n"
        "2. Calculate the yearly income if possible.\n\n"
        "DO NOT use markdown, code fences, or explanations.\n\n"
        "Your response must follow this exact JSON structure:\n"
        "{\n"
        "  \"document_type\": \"<label>\" or \"Unknown\",\n"
        "  \"yearly_income\": \"<amount>\" or \"Unknown\"\n"
        "}\n\n"
        "Document:\n"
        f"{text}"
    )

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0
        )

        raw_output = response.choices[0].message.content.strip()
        print("GPT raw output:", repr(raw_output))  # Debug log

        parsed = json.loads(raw_output)
        return parsed.get("document_type", "Unknown"), parsed.get("yearly_income", "Unknown")

    except Exception as e:
        return f"Error: {str(e)}", "Unknown"
    