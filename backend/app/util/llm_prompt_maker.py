def rate_sheets_recommendation_prompt(credit_score: int, fico_score, dti_ratio: float, income: float, loan_amount_requested: float, loan_term: int, loan_down_payment: float, loan_interest_preference: str) -> str:
    """
    Generates a prompt for recommending credit sheets based on credit score and income.

    Args:
        credit_score (int): The credit score of the client.
        income (float): The annual income of the client.
        fico_score (int): The FICO score of the client.
        dti_ratio (float): The debt-to-income ratio of the client.
        loan_amount_requested (float): The amount of loan requested by the client.
        loan_term (int): The term of the loan in years.
        loan_down_payment (float): The down payment amount for the loan.
        loan_interest_preference (str): The client's preference for loan interest type (fixed or adjustable).

    Returns:
        str: A formatted prompt string.
    """
    return f"""
    You are a mortgage lending expert. Based on the following client profile, recommend the most suitable wholesale mortgage lender(s), including their program names if available, and explain why they are a good fit. Consider credit score, DTI, loan preferences, and loan-to-value ratio. Provide specific, up-to-date recommendations where possible.
    
    Loan Application Details:
    Loan Amount Requested: ${loan_amount_requested}
    Loan Term: {loan_term} years
    Loan Down Payment: ${loan_down_payment}
    Loan Interest Preference: {loan_interest_preference}

    Financial Details:
    Credit Score: {credit_score}
    FICO Score: {fico_score}
    DTI Ratio: {dti_ratio}%
    Annual Income: ${income}

    
    Please include:
    1. A short list of recommended wholesale lenders
    2. Program highlights (e.g., low-FICO programs, high-LTV allowance, etc.)
    3. Why each recommendation is appropriate given the client profile
    4. Any potential limitations or considerations
    """
