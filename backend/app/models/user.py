import os
import csv
from app.models.client import Client

DATABASE_PATH = './app/db/user_database.csv'

class User:
    def __init__(self, username, name, clients=None):
        self.username = username
        self.name = name
        self.clients = clients if clients else []

    def add_client(self, name, credit_score=0, fico_score=0, dti_ratio=0.0, monthly_expenses=0.0, income_sources=[0.0]*5):
        client = Client(
            name=name,
            credit_score=credit_score,
            fico_score=fico_score,
            dti_ratio=dti_ratio,
            monthly_expenses=monthly_expenses,
            income_sources=income_sources
        )
        self.clients.append(client)

    def update_client(self, name, credit_score=None, fico_score=None, dti_ratio=None, monthly_expenses=None, index=None, new_income=None):
        for client in self.clients:
            if client.name == name:
                if credit_score is not None:
                    client.credit_score = credit_score
                if fico_score is not None:
                    client.fico_score = fico_score
                if dti_ratio is not None:
                    client.dti_ratio = dti_ratio
                if monthly_expenses is not None:
                    client.update_monthly_expenses(monthly_expenses)
                if index is not None and new_income is not None:
                    client.update_income_source(index, new_income)
                return
        raise ValueError(f"Client {name} not found.")

    def to_rows(self):
        if not self.clients:
            # Return a row with just the user info and blank client fields
            return [[self.username, self.name, '', '', '', '', '', '', '', '', '', '', '', '']]
        return [client.to_row(self.username, self.name) for client in self.clients]

    @staticmethod
    def from_rows(username, user_name, client_rows):
        # If ALL client rows are placeholders, set clients=None
        if all(not row[2].strip() for row in client_rows):
            clients = None
        else:
            # Otherwise, only include rows with a client_name
            clients = [Client.from_row(row) for row in client_rows if row[2].strip()]
        return User(username, user_name, clients)

    @staticmethod
    def load_users(filepath=DATABASE_PATH):
        if not os.path.isfile(filepath):
            return []
        users_dict = {}  # username: (user_name, [client_rows])
        with open(filepath, 'r', newline='') as f:
            reader = csv.reader(f)
            headers = next(reader, None)  # Skip the header row
            for row in reader:
                # Ensure the row has at least 2 fields (username and user_name)
                if not row or len(row) < 2:
                    continue
                username = row[0].strip()
                user_name = row[1].strip()
                if username not in users_dict:
                    users_dict[username] = (user_name, [])
                users_dict[username][1].append(row)  # Append the row to the user's client rows
        # Create User objects from the grouped data
        users = [User.from_rows(username, user_name, client_rows)
                 for username, (user_name, client_rows) in users_dict.items()]
        return users

    @staticmethod
    def save_user(user, filepath=DATABASE_PATH):
        users = User.load_users(filepath)

        # Build a map for fast lookup (username, client_name) -> Client
        row_map = {}
        for existing_user in users:
            # If user had no clients, still map with empty client_name
            if not existing_user.clients:
                key = (existing_user.username, '')
                row_map[key] = (existing_user, None)
            else:
                for client in existing_user.clients:
                    key = (existing_user.username, client.name)
                    row_map[key] = (existing_user, client)

        # Overwrite or add each client from the input user
        if not user.clients:
            key = (user.username, '')
            row_map[key] = (user, None)
        else:
            for client in user.clients:
                key = (user.username, client.name)
                row_map[key] = (user, client)

        # Reconstruct user dict for output (username -> User)
        users_out = {}
        for (username, client_name), (user_obj, client_obj) in row_map.items():
            if username not in users_out:
                users_out[username] = User(user_obj.username, user_obj.name, [])
            if client_obj:
                users_out[username].add_client(
                    client_obj.name,
                    client_obj.credit_score,
                    client_obj.fico_score,
                    client_obj.dti_ratio,
                    client_obj.monthly_expenses,
                    client_obj.income_sources
                )

        # Write to CSV
        with open(filepath, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['username', 'user_name', 'client_name', 'credit_score', 'fico_score', 'dti_ratio',
                             'monthly_expenses', 'income1', 'income2', 'income3', 'income4', 'income5', 'total_income'])
            for user_obj in users_out.values():
                for row in user_obj.to_rows():
                    writer.writerow(row)

    @staticmethod
    def get_user_by_username(username, filepath=DATABASE_PATH):
        users = User.load_users(filepath)
        print(users)
        for user in users:
            if user.username == username:
                return user
        return None
