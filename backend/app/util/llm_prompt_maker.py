def rate_sheets_recommendation_prompt(credit_score: int, fico_score, dti_ratio: float, income: float, loan_amount_requested: float, loan_term: int, loan_down_payment: float, loan_interest_preference: str) -> str:
    """
    Generates a prompt for recommending credit sheets based on credit score and income.

    Args:
        credit_score (int): The credit score of the user.
        income (float): The annual income of the user.
        fico_score (int): The FICO score of the user.
        dti_ratio (float): The debt-to-income ratio of the user.
        loan_amount_requested (float): The amount of loan requested by the user.
        loan_term (int): The term of the loan in years.
        loan_down_payment (float): The down payment amount for the loan.
        loan_interest_preference (str): The user's preference for loan interest type (fixed or adjustable).

    Returns:
        str: A formatted prompt string.
    """
    return f"""
    Based on the following information, please recommend the best mortgage options for the user, including details on loan amount, interest rate, loan term, monthly payment, down payment, fixed vs adjustable rate, loan-to-value ratio, and any other relevant details. Also, recommend a wholesale lender that support these options.
    
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

    
    Please provide a detailed explanation of why each recommendation is suitable for the user.
    """