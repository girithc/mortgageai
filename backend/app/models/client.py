class Client:
    def __init__(self, name, credit_score=0, fico_score=0, dti_ratio=0.0, monthly_expenses=0.0, income_sources=[0.0]*5):
        self.name = name
        if len(income_sources) != 5:
            raise ValueError("income_sources must be a list of 5 floats.")
        self.credit_score = credit_score
        self.fico_score = fico_score
        self.dti_ratio = dti_ratio
        self.monthly_expenses = monthly_expenses
        self.income_sources = income_sources
        self.total_income = sum(self.income_sources)

    def calculate_total_income(self):
        self.total_income = sum(self.income_sources)

    def update_income_source(self, index, new_income):
        if not (0 <= index < 5):
            raise IndexError("Index must be between 0 and 4.")
        self.income_sources[index] = new_income
        self.calculate_total_income()
        self.calculate_dti_ratio()

    def calculate_dti_ratio(self):
        if self.total_income == 0:
            raise ValueError("Total income cannot be zero when calculating DTI ratio.")
        monthly_income = self.total_income / 12  # Assuming total_income is annual
        self.dti_ratio = (self.monthly_expenses / monthly_income) * 100

    def update_monthly_expenses(self, new_expenses):
        if new_expenses < 0:
            raise ValueError("Monthly expenses cannot be negative.")
        self.monthly_expenses = new_expenses
        self.calculate_dti_ratio()

    def to_row(self, username, user_name):
        return [
            username,
            user_name,
            str(self.name),
            str(self.credit_score),
            str(self.fico_score),
            str(self.dti_ratio),
            str(self.monthly_expenses),
            *map(str, self.income_sources),
            str(self.total_income)
        ]

    @staticmethod
    def from_row(row):
        # row: [username, user_name, client_name, credit_score, fico_score, dti_ratio, monthly_expenses, income1..5, total_income]
        name = row[2]
        credit_score = int(row[3])
        fico_score = int(row[4])
        dti_ratio = float(row[5])
        monthly_expenses = float(row[6])
        income_sources = list(map(float, row[7:12]))
        return Client(name, credit_score, fico_score, dti_ratio, monthly_expenses, income_sources)

    @staticmethod
    def get_client_by_client_name(client_name, users):
        """
        Search all users' clients for client_name.
        Returns first match found, or None.
        """
        for user in users:
            for client in user.clients:
                if client.name == client_name:
                    return client
        return None
    
    def to_dict(self):
        return {
            "name": self.name,
            "credit_score": self.credit_score,
            "fico_score": self.fico_score,
            "dti_ratio": self.dti_ratio,
            "monthly_expenses": self.monthly_expenses,
            "income_sources": self.income_sources,
            "total_income": self.total_income
        }
