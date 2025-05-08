"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, UploadCloud, LogOut } from "lucide-react";

interface Borrower {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone_number?: string;
  phone_no?: string;
  total_income: number | string;
  credit_score?: number;
  fico_score?: number;
  dti_ratio?: number;
  monthly_expenses?: number | string;
  ssn?: string;
  income_sources?: Array<{source_type: string, income: string}>;
}

interface Application {
  id: string;
  loan_type: string;
  loan_amount: number;
  loan_purpose: string;
  property_price: number;
  status: StatusKey;
  rate: number;
  ltv: number;
  dti: number;
  loan_term: number;
  loan_down_payment: number;
  loan_interest_preference: string;
  primary_borrower_id: string;
  co_borrowers_id: string[];
  total_income: number;
  total_monthly_expenses: number;
  last_updated: string;
  created_at: string;
}

interface LoanDisplay {
  id: string;
  borrowers: string;
  amount: string;
  type: string;
  rate: string;
  status: StatusKey;
  progress: number;
  lastUpdated: string;
}

interface ApplicationResponse {
  application: Application;
  borrowers: Borrower[];
  loan_display?: LoanDisplay;
}

type StatusKey =
  | "INIT"
  | "In Process"
  | "Ready for Review"
  | "Approved"
  | "Pending Documents"
  | "Denied";

// map colors
const STATUS_STYLES: Record<StatusKey, string> = {
  "INIT": "bg-gray-100 text-gray-600",
  "In Process": "bg-blue-100 text-blue-600",
  "Ready for Review": "bg-purple-100 text-purple-600",
  "Approved": "bg-green-100 text-green-600",
  "Pending Documents": "bg-yellow-100 text-yellow-600",
  "Denied": "bg-red-100 text-red-600",
};

const ALL_FILTERS: Array<"All" | StatusKey> = [
  "All",
  "INIT",
  "In Process",
  "Ready for Review",
  "Approved",
  "Pending Documents",
  "Denied",
];

export default function ApplicationPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [filter, setFilter] = useState<typeof ALL_FILTERS[number]>("All");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [borrowers, setBorrowers] = useState([{ firstname: "", lastname: "", phone: "", email: "", ssn: "" }]);
  const [loanAmount, setLoanAmount] = useState("");
  const [propertyPrice, setPropertyPrice] = useState("");
  const [loanType, setLoanType] = useState("CONVENTIONAL");
  const [loanTerm, setLoanTerm] = useState("30");
  const [loanInterestPreference, setLoanInterestPreference] = useState("FIXED");
  const [loanPurpose, setLoanPurpose] = useState("PURCHASE");
  const [loanDownPayment, setLoanDownPayment] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
 
  // Check authentication on component mount
  useEffect(() => {
    // For development/testing, we can skip auth check
    // In production, uncomment this code
    
    /*
    // Check for auth token in localStorage or sessionStorage
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    if (!token) {
      // Redirect to login if not authenticated
      router.push('/');
      return;
    }
    */
    
    setIsAuthenticated(true);
    loadApplications();
  }, []);

  const addBorrower = () => {
    setBorrowers([...borrowers, { firstname: "", lastname: "", phone: "", email: "", ssn: "" }]);
  };
  
  const updateBorrower = (index: number, field: string, value: string) => {
    const updatedBorrowers = [...borrowers];
    updatedBorrowers[index][field] = value;
    setBorrowers(updatedBorrowers);
  };
  
  const loadApplications = async () => {
    setLoading(true);
    setError("");
    
    try {
      // API base URL - should be environment variable in production
      const base_url = "http://127.0.0.1:5000";
      
      let user = { username: 'admin' }
      // Make the HTTP request - using the endpoint that works with your backend
      const response = await fetch(`${base_url}/api/applications`, {
        headers: {
          "Authorization": "Bearer " + user.username
        }
      } );
        
      // Check if the request was successful
      if (!response.ok) {
        if (response.status === 401) {
          // Handle unauthorized
          setIsAuthenticated(false);
          router.push('/');
          throw new Error("Unauthorized. Please log in again.");
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Parse the JSON response
      const data = await response.json();
      
      console.log("Applications loaded:", data);
      setApplications(data);
    } catch (error) {
      console.error("Failed to load applications:", error);
      setError("Failed to load applications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear auth tokens
    setIsAuthenticated(false);
    router.push('/');
  };

  // Get loans to display, using loan_display from API if available
  const getDisplayLoans = () => {
    if (applications.length === 0) return [];
    
    // First check if loan_display is provided by the API
    if (applications[0].loan_display) {
      return applications.map(app => app.loan_display);
    }
    
    // Otherwise, process the data manually
    return applications.map(app => {
      const application = app.application;
      const borrowersList = app.borrowers;
      
      // Get primary borrower name
      const primaryBorrower = borrowersList.find(b => b.id === application.primary_borrower_id);
      const borrowerName = primaryBorrower ? primaryBorrower.name : 'Unknown';
      
      // Calculate progress - simplified example (could be based on status or other factors)
      let progress = 0;
      switch (application.status) {
        case "INIT": progress = 20; break;
        case "In Process": progress = 40; break;
        case "Ready for Review": progress = 60; break;
        case "Pending Documents": progress = 80; break;
        case "Approved": progress = 100; break;
        case "Denied": progress = 100; break;
        default: progress = 20;
      }
      
      return {
        id: application.id,
        borrowers: borrowerName,
        amount: `$${application.loan_amount.toLocaleString()}`,
        type: application.loan_type,
        rate: application.rate ? `${application.rate.toFixed(2)}%` : 'TBD',
        status: application.status as StatusKey,
        progress: progress,
        lastUpdated: application.last_updated
      };
    });
  };

  const filtered = getDisplayLoans()
    .filter((l) => filter === "All" || l.status === filter)
    .filter((l) =>
      l.borrowers.toLowerCase().includes(search.trim().toLowerCase())
    );

  const handleSubmit = async () => {
    try {
      // API base URL - should be environment variable in production
      const base_url = "http://127.0.0.1:5000";

      // Create a FormData object
      const formData = new FormData();
      
      // Validate and add required fields
      if (!propertyPrice || !loanAmount || !loanDownPayment) {
        alert("Please fill in all required fields");
        return;
      }
      
      formData.append("property_price", propertyPrice);
      formData.append("loan_amount", loanAmount);
      formData.append("loan_down_payment", loanDownPayment);
      formData.append("loan_type", loanType);
      formData.append("loan_term", loanTerm);
      formData.append("loan_purpose", loanPurpose);
      formData.append("loan_interest_preference", loanInterestPreference);

      // Append borrowers as a JSON string
      formData.append("borrowers", JSON.stringify(borrowers));

      // Append selected files
      if (selectedFiles.length > 0) {
        selectedFiles.forEach((file) => {
          formData.append("files", file);
        });
      }

      // Include auth token in headers if needed
      const user = { username: 'admin' };
      const token = user.username;
      const headers = {};
      if (token) {
        Object.assign(headers, { 'Authorization': `Bearer ${token}` });
      }

      // Make the HTTP request
      const response = await fetch(`${base_url}/api/applications`, {
        method: "POST",
        body: formData,
        headers
      });

      // Check if the request was successful
      if (!response.ok) {
        if (response.status === 401) {
          // Handle unauthorized
          setIsAuthenticated(false);
          router.push('/');
          throw new Error("Unauthorized. Please log in again.");
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Parse the JSON response
      const data = await response.json();
      console.log("Response from server:", data);

      // Reset the form fields and close modal
      setPropertyPrice("");
      setLoanAmount("");
      setLoanDownPayment("");
      setLoanType("CONVENTIONAL");
      setLoanTerm("30");
      setLoanPurpose("PURCHASE");
      setBorrowers([{ firstname: "", lastname: "", phone: "", email: "", ssn: "" }]);
      setSelectedFiles([]);
      setIsModalOpen(false);
      
      // Refresh the applications list
      loadApplications();
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit application. Please try again.");
    }
  };

  return (
    <main className="container mx-auto p-6 space-y-6">
      {/* <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Loan Pipeline</h2>
        <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div> */}

      {/* Error message if loading failed */}
      {error && (
        <div className="bg-red-100 text-red-600 p-4 rounded-md">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Filters + Search + New Loan */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div className="flex space-x-2">
              {ALL_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    filter === f
                      ? "bg-indigo-50 text-indigo-700"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Input
                placeholder="Search loans..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1"
              />
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Loan
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Loan ID",
                    "Borrowers",
                    "Loan Amount",
                    "Type",
                    "Rate",
                    "Status",
                    "Progress",
                    "Last Updated",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.length > 0 ? (
                  filtered.map((loan) => (
                    <tr key={loan.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a href={`loan-details?loan_id=${loan.id}`} className="text-indigo-600 hover:underline">{loan.id}</a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {loan.borrowers}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {loan.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {loan.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {loan.rate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            STATUS_STYLES[loan.status] || STATUS_STYLES["INIT"]
                          }`}
                        >
                          {loan.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap w-60">
                        <Progress value={loan.progress} className="h-2" />
                        <p className="mt-1 text-xs text-gray-500">
                          {Math.round((loan.progress / 100) * 5)}/5 steps
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {loan.lastUpdated}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      No loans found. Create your first loan by clicking "New Loan".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* New Loan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen" style={{overflowY: "auto", scrollbarWidth: "none"}}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold">New Loan</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6 text-center">
              <UploadCloud className="w-10 h-10 text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">Drag and drop your file here, or</p>
              <label className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md cursor-pointer">
                Browse Files
                <input
                  type="file"
                  className="hidden"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      setSelectedFiles(Array.from(e.target.files));
                    }
                  }}
                />
              </label>
              {selectedFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold">Selected Files:</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedFiles.map((file, index) => (
                      <Badge key={index}>{file.name.substring(0, 20)}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Input 
              type="number" 
              placeholder="Property Price" 
              className="mb-2" 
              value={propertyPrice}
              onChange={(e) => setPropertyPrice(e.target.value)}
              required
            />
            <Input 
              type="number" 
              placeholder="Loan Amount" 
              className="mb-2" 
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              required
            />
            <Input 
              type="number" 
              placeholder="Down Payment" 
              className="mb-2" 
              value={loanDownPayment}
              onChange={(e) => setLoanDownPayment(e.target.value)}
              required
            />
            <Select
              value={loanType}
              onValueChange={(value) => setLoanType(value)}
            >
              <SelectTrigger className="mb-2">
                <SelectValue placeholder="Loan Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CONVENTIONAL">Conventional</SelectItem>
                <SelectItem value="NON_CONVENTIONAL">Non-Conventional</SelectItem>
                <SelectItem value="VA">VA</SelectItem>
                <SelectItem value="FHA">FHA</SelectItem>
              </SelectContent> 
            </Select>
            <Select
              value={loanTerm}
              onValueChange={(value) => setLoanTerm(value)}
            >
              <SelectTrigger className="mb-2">
                <SelectValue placeholder="Loan Term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 years</SelectItem>
                <SelectItem value="15">15 years</SelectItem>
              </SelectContent> 
            </Select>
            <Select
              value={loanInterestPreference}
              onValueChange={(value) => setLoanInterestPreference(value)}
            >
              <SelectTrigger className="mb-2">
                <SelectValue placeholder="Interest Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FIXED">Fixed</SelectItem>
                <SelectItem value="VARIABLE">Variable</SelectItem>
              </SelectContent> 
            </Select>
            <Select
              value={loanPurpose}
              onValueChange={(value) => setLoanPurpose(value)}
            >
              <SelectTrigger className="mb-2">
                <SelectValue placeholder="Loan Purpose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PURCHASE">Purchase</SelectItem>
                <SelectItem value="REFINANCE">Refinance</SelectItem>
              </SelectContent> 
            </Select>
            <Button variant="outline" onClick={addBorrower} className="w-full mt-4">
              + Add Borrower
            </Button>
            {borrowers.map((borrower, index) => (
              <div key={index} className="mt-4 mb-4 border p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-2">Borrower {index + 1}</h3>
                <Input
                  type="text"
                  placeholder="First Name"
                  value={borrower.firstname}
                  onChange={(e) => updateBorrower(index, "firstname", e.target.value)}
                  className="mb-2"
                  required
                />
                <Input
                  type="text"
                  placeholder="Last Name"
                  value={borrower.lastname}
                  onChange={(e) => updateBorrower(index, "lastname", e.target.value)}
                  className="mb-2"
                  required
                />
                <Input
                  type="text"
                  placeholder="Phone"
                  value={borrower.phone}
                  onChange={(e) => updateBorrower(index, "phone", e.target.value)}
                  className="mb-2"
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={borrower.email}
                  onChange={(e) => updateBorrower(index, "email", e.target.value)}
                  className="mb-2"
                  required
                />
                <Input
                  type="text"
                  placeholder="SSN"
                  value={borrower.ssn}
                  onChange={(e) => updateBorrower(index, "ssn", e.target.value)}
                  className="mb-2"
                />
              </div>
            ))}
           
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => {
                setIsModalOpen(false);
                setBorrowers([{ firstname: "", lastname: "", phone: "", email: "", ssn: "" }])
              }}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}