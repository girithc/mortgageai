def rate_sheets_recommendation_prompt(credit_score: int, income: float) -> str:
    """
    Generates a prompt for recommending credit sheets based on credit score and income.

    Args:
        credit_score (int): The credit score of the user.
        income (float): The annual income of the user.

    Returns:
        str: A formatted prompt string.
    """
    return f"""
    Based on the following information, please recommend the best credit sheets for the user and recommend the best wholesale mortgage lenders:
    
    Credit Score: {credit_score}
    Annual Income: ${income}
    
    Please provide a detailed explanation of why each recommendation is suitable for the user.
    """