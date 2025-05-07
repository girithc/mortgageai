"use client";

import queryString from "query-string";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import ReactMarkdown from 'react-markdown';

import { ChevronLeft, Brain } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type UploadedDocument = {
  id: string;
  file: File;
  borrower: string;
  category: string;
  uploadedAt: Date;
};

type IncomeSource = {
  source_type: string;
  income: string;
};

type BorrowerInfo = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  ssn: string;
  marital_status: string;
  phone_no: string;
  total_income: string;
  credit_score: number;
  fico_score: number;
  dti_ratio: number;
  monthly_expenses: string;
  income_sources: IncomeSource[];
};

type LoanDetails = {
  loan_number: string;
  loan_type: string;
  loan_purpose: string;
  primary_borrower: string;
  loan_amount: string;
  property_price: string;
  ltv: number;
  dti: number;
  loan_term: number;
  loan_down_payment: number;
  loan_interest_preference: string;
  status: string;
  rate: number;
  primary_borrower_id: string;
  co_borrowers_id: string[];
  total_income: number;
  total_monthly_expenses: number;
  llm_recommendation: string;
  last_updated: string;
  created_at: string;
  borrowers: BorrowerInfo[];
};

export default function LoanDetailsPage() {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<UploadedDocument | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("0");
  const [uploadCategory, setUploadCategory] = useState("");
  const [loanDetails, setLoanDetails] = useState<LoanDetails>({
    loan_number: "",
    loan_type: "",
    loan_purpose: "",
    primary_borrower: "",
    loan_amount: "",
    property_price: "",
    ltv: 0,
    dti: 0,
    loan_term: 0,
    loan_down_payment: 0,
    loan_interest_preference: "",
    status: "",
    rate: 0,
    primary_borrower_id: "",
    co_borrowers_id: [],
    total_income: 0,
    total_monthly_expenses: 0,
    llm_recommendation: "",
    last_updated: "",
    created_at: "",
    borrowers: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFetchingRecommendation, setIsFetchingRecommendation] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  // const fetchNewRecommendation = async () => {
  //   try {
  //     const base_url = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";
  //     const response = await fetch(`${base_url}/api/applications/${loanDetails.loan_number}/new-recommendation`, {
  //       method: "GET",
  //     });
  
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! Status: ${response.status}`);
  //     }
  
  //     const data = await response.json();
  //     console.log("New recommendation fetched:", data);
  
  //     // Update the recommendation in the state
  //     setLoanDetails(prev => ({
  //       ...prev,
  //       llm_recommendation: data.llm_recommendation || "No insight yet",
  //     }));
  //   } catch (error) {
  //     console.error("Error fetching new recommendation:", error);
  //     alert("Failed to fetch new recommendation. Please try again.");
  //   }
  // };
  const fetchNewRecommendation = async () => {
    setIsFetchingRecommendation(true); // Set loading state to true
    try {
      const base_url = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";
      const response = await fetch(`${base_url}/api/applications/${loanDetails.loan_number}/new-recommendation`, {
        method: "GET",
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("Recommendation fetched:", data);
  
      // Update the recommendation in the state
      setLoanDetails(prev => ({
        ...prev,
        llm_recommendation: data.llm_recommendation || "No insight yet",
      }));
    } catch (error) {
      console.error("Error fetching recommendation:", error);
      alert("Failed to fetch recommendation. Please try again.");
    } finally {
      setIsFetchingRecommendation(false); // Reset loading state
    }
  };
  const getTotalIncome = () => {
    let totalIncome = 0;
    try {
      loanDetails.borrowers.forEach((borrower: BorrowerInfo) => {
        // Handle different formats of income values
        if (typeof borrower.total_income === 'string') {
          // Remove $ and commas if present
          const cleanedIncome = borrower.total_income.replace(/[$,]/g, '');
          totalIncome += parseFloat(cleanedIncome);
        } else if (typeof borrower.total_income === 'number') {
          totalIncome += borrower.total_income;
        }
      });
    } catch (error) {
      console.error("Error calculating total income:", error);
    }
    return totalIncome;
  };

  useEffect(() => {
    loadApplication();
  }, []);

  const loadApplication = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const base_url = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";
      const queries = queryString.parse(window.location.search);
      
      if (!queries.loan_id) {
        throw new Error("No loan ID provided");
      }
      
      // Make the HTTP request to the correct endpoint
      const response = await fetch(`${base_url}/api/applications/${queries.loan_id}`);
        
      // Check if the request was successful
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Parse the JSON response
      const data = await response.json();
      console.log("Loan details loaded:", data);
      
      setLoanDetails(data);
    } catch (error) {
      console.error("Failed to load loan details:", error);
      setError("Failed to load loan details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ["Income", "Asset", "Credit"];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const newDocument: UploadedDocument = {
      id: crypto.randomUUID(),
      file,
      borrower: loanDetails.borrowers[parseInt(activeTab)].id,
      category: "Select a category",
      uploadedAt: new Date()
    };

    setSelectedDocument(newDocument);
  };

  const updateDocumentDetails = (id: string, borrower: string, category: string) => {
    if (selectedDocument) {
      const updatedDocument = { 
        ...selectedDocument, 
        borrower, 
        category 
      };
      setSelectedDocument(updatedDocument);
    }
  };

  const handleFinalUpload = async () => {
    if (selectedDocument && selectedDocument.category !== "Select a category" && selectedFiles.length > 0) {
      setDocuments(prev => [...prev, selectedDocument]);
      
      try {
        const base_url = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";
        
        // Create a FormData object
        const formData = new FormData();
        formData.append("borrower_id", loanDetails.borrowers[parseInt(activeTab)].id);
        
        // Append the file
        formData.append("file", selectedFiles[0]);
        
        let endpoint = "";
        switch (uploadCategory) {
          case "Income":
            endpoint = `${base_url}/api/borrower/read-income`;
            break;
          case "Credit":
            endpoint = `${base_url}/api/borrower/read-credit-report`;
            break;
          case "Asset":
            // If an asset endpoint is implemented in the future
            endpoint = `${base_url}/api/borrower/read-asset`;
            break;
          default:
            throw new Error("Invalid document category");
        }
        
        console.log("Uploading to endpoint:", endpoint);
        
        // Make the HTTP request
        const response = await fetch(endpoint, {
          method: "POST",
          body: formData,
        });
        
        // Check if the request was successful
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // Parse the JSON response
        const data = await response.json();
        console.log("Response from server:", data);
        
        // Refresh loan details to show updated data
        await loadApplication();
        
        // Reset the form
        setIsUploadDialogOpen(false);
        setSelectedDocument(null);
        setSelectedFiles([]);
      } catch (error) {
        console.error("Error uploading document:", error);
        alert("Failed to upload document. Please try again.");
      }
    }
  };

  const renderBorrowerDetails = (tabKey: string) => {
    if (isLoading) {
      return <div className="p-4 text-center">Loading borrower details...</div>;
    }
    
    if (error) {
      return <div className="p-4 text-center text-red-500">{error}</div>;
    }
    
    const index = parseInt(tabKey);
    if (!loanDetails.borrowers || !loanDetails.borrowers[index]) {
      return <div className="p-4 text-center">No borrower details available</div>;
    }
    
    const details = loanDetails.borrowers[index];
    
    return (
      <div className="p-4 border rounded-lg mt-4">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">First name</label>
            <div className="text-lg">{details.first_name}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Last name</label>
            <div className="text-lg">{details.last_name}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
            <div className="text-lg">{details.email}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">SSN</label>
            <div className="text-lg">{details.ssn}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Marital Status</label>
            <div className="text-lg">{details.marital_status || 'Not specified'}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Phone No</label>
            <div className="text-lg">{details.phone_no}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Income</label>
            <div className="text-lg">{details.total_income}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Credit Score</label>
            <div className="text-lg">{details.credit_score || 'Not available'}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Monthly Expenses</label>
            <div className="text-lg">{details.monthly_expenses || 'Not available'}</div>
          </div>
        </div>
        
        {details.income_sources && details.income_sources.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Income Sources</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {details.income_sources.map((source, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 text-sm text-gray-900">{source.source_type}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right">{source.income}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen p-8">
      <div className="container mx-auto">
        {/* Header Section */}
        {/* <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">
              {loanDetails.borrowers.map(item => `${item.first_name} ${item.last_name}`).join(" and ")}
            </h1>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => window.history.back()}>
              Back to Applications
            </Button>
          </div>
        </div> */}

        {/* Error message if loading failed */}
        {error && (
          <div className="bg-red-100 text-red-600 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Loan Details Section */}
        <div className="mb-8">
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => window.history.back()}>          
              <ChevronLeft /> 
            </Button>
          </div>
          <h2 className="text-2xl font-bold mb-4">Loan Details</h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <div className="text-sm text-gray-500">Loan # {loanDetails.loan_number}</div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <div className="text-sm text-gray-500">Loan Type</div>
                    <div className="font-medium mt-1">{loanDetails.loan_type}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Loan Purpose</div>
                    <div className="font-medium mt-1">{loanDetails.loan_purpose}</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Borrower</div>
                <div className="font-medium mt-1 flex items-center">
                  {loanDetails.primary_borrower}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Loan Amount</div>
                <div className="font-medium mt-1">{loanDetails.loan_amount}</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Property Price</div>
                  <div className="font-medium mt-1">{loanDetails.property_price}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">LTV</div>
                  <div className="font-medium mt-1">{loanDetails.ltv}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">DTI</div>
                  <div className="font-medium mt-1">{loanDetails.dti.toFixed(2)}%</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
              <div>
                <div className="text-sm text-gray-500">Status</div>
                <div className="font-medium mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    loanDetails.status === "Approved" ? "bg-green-100 text-green-600" :
                    loanDetails.status === "Denied" ? "bg-red-100 text-red-600" :
                    loanDetails.status === "Pending Documents" ? "bg-yellow-100 text-yellow-600" :
                    loanDetails.status === "Ready for Review" ? "bg-purple-100 text-purple-600" :
                    loanDetails.status === "In Process" ? "bg-blue-100 text-blue-600" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {loanDetails.status}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Interest Rate</div>
                <div className="font-medium mt-1">{loanDetails.rate > 0 ? `${loanDetails.rate.toFixed(2)}%` : 'TBD'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Term</div>
                <div className="font-medium mt-1">{loanDetails.loan_term} years</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Interest Type</div>
                <div className="font-medium mt-1">{loanDetails.loan_interest_preference}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Borrower Details Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Borrower Details</h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center mb-4 text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span className="ml-2">
                {loanDetails.borrowers.map(item => `${item.first_name} ${item.last_name}`).join(" and ")}
              </span>
            </div>
            <div className="text-lg font-bold text-gray-500 mb-4">
              Total Income: ${getTotalIncome().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>

            <Tabs defaultValue="0" value={activeTab} onValueChange={setActiveTab} className="mt-4">
              <TabsList>
                {loanDetails.borrowers.map((item, idx) => (
                  <TabsTrigger 
                    key={item.id} 
                    value={`${idx}`} 
                    className="text-purple-600 data-[state=active]:border-b-2 data-[state=active]:border-purple-600"
                  >
                    {item.last_name}, {item.first_name}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {loanDetails.borrowers.map((item, idx) => (
                <TabsContent key={item.id} value={`${idx}`}>
                  <div className="flex space-x-2 justify-end">
                    <Button 
                      className="bg-[#7C3AED] text-white hover:bg-[#6D28D9]"
                      onClick={() => setIsUploadDialogOpen(true)}
                    >
                      Upload Document
                    </Button>
                  </div>
                  {renderBorrowerDetails(`${idx}`)}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
        {/* <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Recommendation</h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="mb-4">
            <Card style={{height: "300px", overflowY:"scroll", scrollbarWidth:"none"}}>
              <CardHeader>
                <Brain></Brain>
              </CardHeader>
              <CardContent>   
                <ReactMarkdown>{loanDetails.llm_recommendation || "No insight yet"}</ReactMarkdown>
              </CardContent>
            </Card>
            </div>
          </div>
        </div> */}

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Recommendation</h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="mb-4">
              <Card style={{ height: "300px", overflowY: "scroll", scrollbarWidth: "none" }}>
                <CardHeader>
                  <Brain />
                </CardHeader>
                <CardContent>
                  {isFetchingRecommendation ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                  ) : (
                    <ReactMarkdown>{loanDetails.llm_recommendation || "No insight yet"}</ReactMarkdown>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="flex justify-end">
              <Button
                className="bg-[#7C3AED] text-white hover:bg-[#6D28D9]"
                onClick={fetchNewRecommendation}
                disabled={isFetchingRecommendation} // Disable button while loading
              >
                {isFetchingRecommendation ? "Loading..." : "Get Recommendation"}
              </Button>
            </div>
          </div>
        </div>
        {/* Documents Table */}
        {/* <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Documents</h2>
          <div className="border rounded-lg overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Borrower
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-[#7C3AED]">
                      {doc.file.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {doc.borrower}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {doc.category}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {doc.uploadedAt.toLocaleDateString()} {doc.uploadedAt.toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
                {documents.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-gray-500">
                      No documents uploaded yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div> */}

        {/* Upload Document Dialog */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="border-2 border-dashed border-gray-300 p-8 text-center">
                <p className="text-gray-500 mb-4">Drag and drop your file here</p>
                <p>or</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={(e) => {
                    if (e.target.files) {
                      handleFileUpload(e);
                      setSelectedFiles(Array.from(e.target.files));
                    }
                  }}
                  className="hidden" 
                  accept=".pdf,.jpg,.png,.tif"
                />
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Browse Files
                </Button>
                <p className="text-sm text-gray-500 mt-2">PDF, JPG, PNG, or TIF files up to 10MB</p>
              </div>
              
              {selectedDocument && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select 
                      value={selectedDocument.category}
                      onChange={(e) => {
                        updateDocumentDetails(
                          selectedDocument.id, 
                          selectedDocument.borrower, 
                          e.target.value
                        );
                        setUploadCategory(e.target.value);
                      }}
                      className="w-full border rounded-md p-2"
                    >
                      <option value="Select a category">Select a category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsUploadDialogOpen(false);
                        setSelectedDocument(null);
                        setSelectedFiles([]);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="bg-[#7C3AED] text-white hover:bg-[#6D28D9]"
                      disabled={
                        !selectedDocument || 
                        selectedDocument.category === "Select a category" ||
                        selectedFiles.length === 0
                      }
                      onClick={handleFinalUpload}
                    >
                      Upload
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}