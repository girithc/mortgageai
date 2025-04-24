def rate_sheets_recommendation_prompt(credit_score: int, fico_score, dti_ratio: float, income: float) -> str:
    """
    Generates a prompt for recommending credit sheets based on credit score and income.

    Args:
        credit_score (int): The credit score of the user.
        income (float): The annual income of the user.

    Returns:
        str: A formatted prompt string.
    """
    return f"""
    Based on the following information, please recommend the best mortgage options for the user, including details on loan amount, interest rate, loan term, monthly payment, down payment, fixed vs adjustable rate, loan-to-value ratio, and any other relevant details. Also, recommend a wholesale lender that support these options.
    
    Credit Score: {credit_score}
    FICO Score: {fico_score}
    DTI Ratio: {dti_ratio}%
    Annual Income: ${income}

    
    Please provide a detailed explanation of why each recommendation is suitable for the user.
    """