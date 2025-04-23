class Client:
    def __init__(self, name, credit_score=0, income_sources=[0.0]*5):
        self.name = name
        if len(income_sources) != 5:
            raise ValueError("income_sources must be a list of 5 floats.")
        self.credit_score = credit_score
        self.income_sources = income_sources
        self.total_income = sum(self.income_sources)

    def calculate_total_income(self):
        self.total_income = sum(self.income_sources)

    def update_income_source(self, index, new_income):
        if not (0 <= index < 5):
            raise IndexError("Index must be between 0 and 4.")
        self.income_sources[index] = new_income
        self.calculate_total_income()

    def to_row(self, username, user_name):
        return [
            username,
            user_name,
            str(self.name),
            str(self.credit_score),
            *map(str, self.income_sources),
            str(self.total_income)
        ]

    @staticmethod
    def from_row(row):
        # row: [username, user_name, client_name, credit_score, income1..5, total_income]
        name = row[2]
        credit_score = int(row[3])
        income_sources = list(map(float, row[4:9]))
        return Client(name, credit_score, income_sources)

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
            "income_sources": self.income_sources,
            "total_income": self.total_income
        }
