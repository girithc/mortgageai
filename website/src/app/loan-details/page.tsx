"use client";

// import { useLocation, useSearchParams } from 'react-router-dom';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; //use "npx shadcn@latest add tabs" in terminal for this import

type UploadedDocument = {
  id: string;
  file: File;
  borrower: string;
  category: string;
  uploadedAt: Date;
};

type BorrowerInfo = {
  firstName: string;
  lastName: string;
  email: string;
  ssn: string;
  maritalStatus: string;
  phoneNo: string;
};

export default function LoanDetailsPage() {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<UploadedDocument | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("0");
  const [uploadCategory, setUploadCategory] = useState("");
  const [loanDetails, setLoansDetail] = useState({
    loanNumber: "",
    loanType: "",
    loanPurpose: "",
    borrower: "",
    loanAmount: "",
    propertyPrice: "",
    ltv: "",
    dti: "",
    borrowers: []
  })
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // const location = useLocation();

 const getTotalIncome = () => {
    let totalIncome = 0;
    loanDetails.borrowers.forEach((borrower: BorrowerInfo) => {
      totalIncome += parseFloat(borrower.totalIncome.substring(1));
    });
    return totalIncome;
  }

  useEffect(() => {
      loadApplication()
  }, [])

  const loadApplication = async () => {
    let base_url = process.env.REACT_APP_SERVER_URL || "http://localhost:5000"
    // const searchParams = new URLSearchParams(location.search);
    const queries = queryString.parse(window.location.search);
    
    // Make the HTTP request
    const response = await fetch(`${base_url}/application/${queries.loan_id}`);
      
    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    // Parse the JSON response
    const data = await response.json();

    setLoansDetail(data)
  }

  // Borrower data
  // const borrowers = ["Alice Firstimer", "John Homeowner", "Second buyer"];
  const categories = ["Income", "Asset", "Credit"];
  

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const newDocument: UploadedDocument = {
      id: crypto.randomUUID(),
      file,
      borrower: "Select a borrower",
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
    if (selectedDocument && 
        // selectedDocument.borrower !== "Select a borrower" && 
        selectedDocument.category !== "Select a category") {
      setDocuments(prev => [...prev, selectedDocument]);
      setIsUploadDialogOpen(false);
      setSelectedDocument(null);



      let base_url = process.env.REACT_APP_SERVER_URL || "http://localhost:5000"

      // Create a FormData object
      const formData = new FormData();
      formData.append("username", "Admin_username");
      formData.append("client_name", loanDetails.borrowers[Number(activeTab)].id);
      
      // Append selected files
      if (selectedFiles.length > 0) {
        // selectedFiles.forEach((file) => {
        formData.append("file", selectedFiles[0]); // Use the same key for multiple files
        // });
      }

      try {
        let url = ""
        if (uploadCategory === "Income")
          url = `${base_url}/user/client/read-income`
        else if (uploadCategory === "Asset") 
          url = `${base_url}/user/client/read-asset`
        else if (uploadCategory === "Credit")
          url = `${base_url}/user/client/read-credit-report`
        console.log("uploadCategory: ", uploadCategory)
        console.log("URL: ", url)

        // Make the HTTP request
        const response = await fetch(url, {
          method: "POST",
          body: formData, // Send the FormData object
        });

        // Check if the request was successful
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the JSON response
        const data = await response.json();
        console.log("Response from server:", data);

        loadApplication()
        // Reset the form fields
        // setPropertyPrice("");
        // setLoanAmount("");
        // setLoanType("CONVENTIONAL");
        // setLoanTerm("30yrs");
        // setLoanPurpose("PURCHASE");
        // setBorrowers([{ firstname: "", lastname: "", phone: "", email: "" }]);
        // setIsModalOpen(false);
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    }
  };

  const renderBorrowerDetails = (tabKey: string) => {
    const details = loanDetails.borrowers[Number(tabKey)];
    
    return (
      <div className="p-4 border rounded-lg mt-4">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">First name</label>
            <div className="text-lg">{details.firstName}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Last name</label>
            <div className="text-lg">{details.lastName}</div>
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
            <div className="text-lg">{details.maritalStatus}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Phone No</label>
            <div className="text-lg">{details.phoneNo}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Income</label>
            <div className="text-lg">{details.totalIncome}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Credit Score</label>
            <div className="text-lg">{details.creditScore}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white min-h-screen p-8">
      <div className="container mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">{loanDetails.borrowers.map((item) => {return `${item.firstName} ${item.lastName}`}).join(" and ")}</h1>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div className="flex space-x-2">
{/*             <Button variant="outline" className="text-sm">
              Documents
            </Button> */}
            {/* <Button 
              className="bg-[#7C3AED] text-white hover:bg-[#6D28D9]"
              onClick={() => setIsUploadDialogOpen(true)}
            >
              Upload Document
            </Button> */}
          </div>
        </div>

        {/* Loan Details Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Loan Details</h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="grid grid-cols-4 gap-6">
              <div>
                <div className="text-sm text-gray-500">Loan # {loanDetails.loanNumber}</div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <div className="text-sm text-gray-500">Loan Type</div>
                    <div className="font-medium mt-1">{loanDetails.loanType}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Loan Purpose</div>
                    <div className="font-medium mt-1">{loanDetails.loanPurpose}</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Borrower</div>
                <div className="font-medium mt-1 flex items-center">
                  {loanDetails.borrower}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Loan Amount</div>
                <div className="font-medium mt-1">{loanDetails.loanAmount}</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Property Price</div>
                  <div className="font-medium mt-1">{loanDetails.propertyPrice}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">LTV</div>
                  <div className="font-medium mt-1">{loanDetails.ltv}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">DTI</div>
                  <div className="font-medium mt-1">{loanDetails.dti}</div>
                </div>
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
              <span className="ml-2">{loanDetails.borrowers.map((item) => {return `${item.firstName} ${item.lastName}`}).join(" and ")}</span>
            </div>
            <div className="text-lg font-bold text-gray-500 mb-4">Total Income: ${getTotalIncome().toFixed(2)}</div>
            {/* <div className="text-sm text-gray-500 mb-4">Total Income: {loanDetails.borrowers.reduce((acc, borrower) => acc + parseFloat(borrower.totalIncome), 0)}</div> */}

            <Tabs defaultValue="firstimer-alice" value={activeTab} onValueChange={setActiveTab} className="mt-4">
              <TabsList>
                {
                loanDetails.borrowers.map((item, idx) => (<TabsTrigger value={`${idx}`} className="text-purple-600 data-[state=active]:border-b-2 data-[state=active]:border-purple-600">
                  {item.lastName}, {item.firstName}
                </TabsTrigger>))
}
                {/* <TabsTrigger value="firstimer-alice" className="text-purple-600 data-[state=active]:border-b-2 data-[state=active]:border-purple-600">
                  Firstimer, Alice
                </TabsTrigger>
                <TabsTrigger value="homeowner-john">
                  Homeowner, John
                </TabsTrigger> */}
              </TabsList>
              {
                loanDetails.borrowers.map((item, idx)=>(<TabsContent value={`${idx}`}>
                  <div className="flex space-x-2 justify-end">
                    <Button 
                      className="bg-[#7C3AED] text-white hover:bg-[#6D28D9]"
                      onClick={() => setIsUploadDialogOpen(true)}
                    >
                      Upload Document
                    </Button>
                  </div>
                  {renderBorrowerDetails(`${idx}`)}
                </TabsContent>))
              }
            </Tabs>
          </div>
        </div>

        {/* Documents Table */}
        <div className="mb-8">
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
        </div>

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
                  // onChange={handleFileUpload} 
                  onChange={(e) => {
                    if (e.target.files) {
                      handleFileUpload(e); // Call the file upload handler
                      setSelectedFiles(Array.from(e.target.files)); // Convert FileList to an array
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
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Borrower</label>
                    <select 
                      value={selectedDocument.borrower}
                      onChange={(e) => updateDocumentDetails(
                        selectedDocument.id, 
                        e.target.value, 
                        selectedDocument.category
                      )}
                      className="w-full border rounded-md p-2"
                    >
                      <option value="Select a borrower">Select a borrower</option>
                      {borrowers.map(borrower => (
                        <option key={borrower} value={borrower}>{borrower}</option>
                      ))}
                    </select>
                  </div> */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select 
                      value={selectedDocument.category}
                      onChange={(e) => {
                        updateDocumentDetails(
                          selectedDocument.id, 
                          selectedDocument.borrower, 
                          e.target.value
                        )
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
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="bg-[#7C3AED] text-white hover:bg-[#6D28D9]"
                      disabled={
                        !selectedDocument || 
                        // selectedDocument.borrower === "Select a borrower" || 
                        selectedDocument.category === "Select a category"
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
