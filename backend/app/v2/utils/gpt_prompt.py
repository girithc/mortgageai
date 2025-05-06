import openai
import json
from app.db.config import Config

client = openai.OpenAI(api_key=Config.OPENAI_API_KEY)

def get_openai_response(prompt):
    """
    Sends a prompt to OpenAI and retrieves the response.

    Args:
        prompt (str): The input prompt to send to OpenAI.

    Returns:
        str: The response from OpenAI.
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0
        )

        raw_output = response.choices[0].message.content.strip()
        return raw_output
    except Exception as e:
        print(f"Error communicating with OpenAI: {e}")
        return None
