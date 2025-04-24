import openai
import json
from app.db.config import Config

client = openai.OpenAI(api_key=Config.OPENAI_API_KEY)

def extract_credit_from_text(text: str) -> tuple:
    prompt = (
        "You are a document assistant. Analyze the following text and respond ONLY in raw JSON format.\n"
        "1. Extract the credit score (such as VantageScore).\n"
        "2. Extract the FICO score if possible.\n"
        "3. Extract the monthly expenses needed to calculate DTI.\n\n"
        "DO NOT use markdown, code fences, or explanations.\n\n"
        "Your response must follow this exact JSON structure:\n"
        "{\n"
        "  \"credit_score\": \"<amount>\" or \"Unknown\",\n"
        "  \"fico_score\": \"<amount>\" or \"Unknown\",\n"
        "  \"monthly_expenses\": \"<amount>\" or \"Unknown\",\n"
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

        credit_score = parsed.get("credit_score", "Unknown")
        fico_score = parsed.get("fico_score", "Unknown")
        monthly_expenses = parsed.get("monthly_expenses", "Unknown")
        return credit_score, fico_score, monthly_expenses
    except json.JSONDecodeError as e:
        return f"Error: {str(e)}", "Unknown"
    