# Mortgage AI

Mortgage AI is an intelligent platform designed to streamline the mortgage loan process by leveraging cutting-edge AI technologies. It assists lenders and financial institutions in analyzing borrower data, recommending loan decisions, and intelligently assigning qualified borrowers to the right lenders based on real-time lending criteria.

---

## 🚀 Features
- [ ] Sign in/Sign Up
- [x] Loan Application Pipeline
- [x] Create A New Loan Application
- [x] Access Loan Application Details
- [x] Upload Documents on Behalf of Borrower
- [x] Read income from uploaded documents
- [x] Read credit report from uploaded documents
- [ ] Generate and show recommendations
- [ ] Clean up UI to remove unrelated data
- [ ] Redesign and implement side bar menu

### 🔍 Intelligent Loan Analysis
- Automatically extracts and analyzes financial documents (W-2s, paystubs, tax returns)
- Classifies document types and calculates yearly income using AI models

### 🤖 AI-Powered Recommendations
- Provides recommendations on whether to approve or reject a loan application
- Suggests areas of improvement for borrowers (e.g., credit score, income boost)

### 📊 Dynamic Rate Sheet Matching
- Uses lender rate sheets to suggest the best fit for each borrower
- Matches borrowers to lenders that qualify them based on real-time criteria

### 🔄 Retrieval-Augmented Generation (RAG)
- Integrates with external and internal knowledge bases for up-to-date decisions
- Ensures accurate and current responses using RAG pipelines

### 🧠 Fine-Tuned AI for Structured Outputs
- Fine-tuned LLM ensures structured, consistent, and explainable outputs
- Custom prompts tailored for mortgage lending domain

---

## 📦 Tech Stack
- **Python + Flask**: Backend API
- **LangChain + OpenAI API**: LLM Integration
- **Vector DB**: For document embeddings and similarity search
- **PyMuPDF**: PDF parsing and text extraction
- **Astra DB / Cassandra**: Structured data storage

---

## 📌 API Capabilities
- File upload and income classification
- User and client management
- LLM-based Q&A
- Rate sheet recommendations
- Document-based income extraction

See [`api_docs.md`](./api_docs.md) for a full API reference.

---

## 📈 Use Cases
- Mortgage underwriters assessing loan eligibility
- Loan officers suggesting improvements for borderline applications
- Fintech platforms automating lender recommendations

---

## 🛠️ Getting Started
1. Clone the repository
2. Set up a virtual environment and install dependencies
3. Run the Flask server

```bash
git clone https://github.com/your-org/mortgage-ai.git
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m flask run
```

---

4. Run the Nextjs app

```bash

cd website
pnpm install
pnpm run dev
```

---

## 🤝 Contributions
We welcome contributions! Please open an issue to discuss changes or enhancements.

---

## 📄 License
This project is licensed under the MIT License.

