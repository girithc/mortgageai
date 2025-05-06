def rate_sheets_recommendation_prompt(credit_score: int, 
                                      fico_score: int, 
                                      dti_ratio: float, 
                                      income: float, 
                                      loan_amount_requested: float, 
                                      loan_term: int, 
                                      loan_down_payment: float, 
                                      loan_interest_preference: str,
                                      property_price: float,
                                      ltv_ratio: float
                                      ) -> str:
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
    You are an expert mortgage underwriter assistant.
    Evaluate whether this application is likely to get pre-approved by an AUS (e.g., DU or LP) based on common underwriting guidelines. If likely approved, explain why. If not approved, explain why not and give specific, practical advice on how the borrower could improve their application to increase approval chances such as conditional documents.
    Based on the following mortgage loan application, recommend the most suitable wholesale mortgage lender(s), including their program names if available, and explain why they are a good fit. Provide specific, up-to-date recommendations where possible.
    Write a detailed explanation in 1000 words or more. Cover all key aspects.
    Do not include any disclaimers or generic information.
    Do not include any hypothetical scenarios or examples.
    Do not include typical AI disclaimers or generic information.
    
    Loan Application Details:
    Loan Amount Requested: ${loan_amount_requested}
    Loan Term: {loan_term} years
    Loan Down Payment: ${loan_down_payment}
    Loan Interest Preference: {loan_interest_preference}
    Property Price: ${property_price}
    LTV Ratio: {ltv_ratio}%

    Financial Details:
    Credit Score: {credit_score}
    FICO Score: {fico_score}
    DTI Ratio: {dti_ratio}%
    Annual Income: ${income}

    
    Please include:
    1. A short list of recommended wholesale lenders
    2. Program highlights (e.g., low-FICO programs, high-LTV allowance, etc.)
    3. Why each recommendation is appropriate given the loan application profile
    4. Any potential limitations or considerations. Advice on how to improve the application for better rates or terms is also welcome.
    5. Additional recommendations for conditional documents to get the AUS approval.
    """
