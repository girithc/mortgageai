import openai
import json
from app.db.config import Config

client = openai.OpenAI(api_key=Config.OPENAI_API_KEY)

def classify_and_extract_income_from_text(text: str) -> tuple:
    prompt = (
        "You are a document assistant. Analyze the following text and respond ONLY in raw JSON format.\n"
        "1. Classify it as one of: Pay Stub, W-2, Bank Statement.\n"
        "2. Extract the hourly rate, hours worked, and pay period if available.\n"
        "3. Calculate the yearly income based on the extracted data. Assume 52 weeks in a year for weekly pay periods.\n\n"
        "DO NOT use markdown, code fences, or explanations.\n\n"
        "Your response must follow this exact JSON structure:\n"
        "{\n"
        "  \"name\": \"<full name of the owner of this document>\" or \"Unknown\",\n"
        "  \"document_type\": \"<label>\" or \"Unknown\",\n"
        "  \"hourly_rate\": \"<amount>\" or \"Unknown\",\n"
        "  \"hours_worked\": \"<amount>\" or \"Unknown\",\n"
        "  \"pay_period\": \"<period>\" or \"Unknown\",\n"
        "  \"yearly_income\": \"<amount>\" or \"Unknown\"\n"
        "}\n\n"
        "Document:\n"
        f"{text}"
    )

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0
        )

        raw_output = response.choices[0].message.content.strip()
        print("GPT raw output:", repr(raw_output))  # Debug log

        parsed = json.loads(raw_output)

        # Post-process yearly income if not provided
        if parsed.get("yearly_income", "Unknown") == "Unknown":
            print("Post-processing yearly income")  # Debug log
            hourly_rate = float(parsed.get("hourly_rate", 0))
            hours_worked = float(parsed.get("hours_worked", 0))
            pay_period = parsed.get("pay_period", "Unknown").lower()

            if pay_period == "weekly":
                yearly_income = hourly_rate * hours_worked * 52
            elif pay_period == "bi-weekly":
                yearly_income = hourly_rate * hours_worked * 26
            else:
                yearly_income = None  # Use None for unknown
        else:
            try:
                yearly_income = float(parsed.get("yearly_income"))
            except (ValueError, TypeError):
                yearly_income = None

        document_type = parsed.get("document_type", "Unknown")

        return document_type, yearly_income

    except Exception as e:
        return f"Error: {str(e)}", "Unknown"
    