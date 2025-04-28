"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; #use "npx shadcn@latest add tabs" in terminal for this import

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
  const [selectedDocument, setSelectedDocument] = useState<UploadedDocument | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("firstimer-alice");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Borrower data
  const borrowers = ["Alice Firstimer", "John Homeowner", "Second buyer"];
  const categories = ["Income", "Asset", "Credit"];
  
  const borrowerDetails = {
    "firstimer-alice": {
      firstName: "Alice",
      lastName: "Firstimer",
      email: "alice@gmail.com",
      ssn: "***-**-3456",
      maritalStatus: "Married",
      phoneNo: "(408) 239-1921"
    },
    "homeowner-john": {
      firstName: "John",
      lastName: "Homeowner",
      email: "john@example.com",
      ssn: "***-**-7890",
      maritalStatus: "Married",
      phoneNo: "(408) 555-4321"
    }
  };

  // Loan details
  const loanDetails = {
    loanNumber: "02567891",
    loanType: "Conventional",
    loanPurpose: "Purchase",
    borrower: "Alice Firstimer",
    loanAmount: "$1,000,000",
    propertyPrice: "$1,350,000",
    ltv: "74%",
    dti: "38%"
  };

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

  const handleFinalUpload = () => {
    if (selectedDocument && 
        selectedDocument.borrower !== "Select a borrower" && 
        selectedDocument.category !== "Select a category") {
      setDocuments(prev => [...prev, selectedDocument]);
      setIsUploadDialogOpen(false);
      setSelectedDocument(null);
    }
  };

  const renderBorrowerDetails = (tabKey: string) => {
    const details = borrowerDetails[tabKey as keyof typeof borrowerDetails];
    
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
            <h1 className="text-xl font-semibold">Alice Firstimer and John Homeowner</h1>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" className="text-sm">
              Documents
            </Button>
            <Button 
              className="bg-[#7C3AED] text-white hover:bg-[#6D28D9]"
              onClick={() => setIsUploadDialogOpen(true)}
            >
              Upload Document
            </Button>
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
              <span className="ml-2">Alice Firstimer and John Homeowner</span>
            </div>

            <Tabs defaultValue="firstimer-alice" value={activeTab} onValueChange={setActiveTab} className="mt-4">
              <TabsList>
                <TabsTrigger value="firstimer-alice" className="text-purple-600 data-[state=active]:border-b-2 data-[state=active]:border-purple-600">
                  Firstimer, Alice
                </TabsTrigger>
                <TabsTrigger value="homeowner-john">
                  Homeowner, John
                </TabsTrigger>
              </TabsList>
              <TabsContent value="firstimer-alice">
                {renderBorrowerDetails("firstimer-alice")}
              </TabsContent>
              <TabsContent value="homeowner-john">
                {renderBorrowerDetails("homeowner-john")}
              </TabsContent>
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
                  onChange={handleFileUpload} 
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
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select 
                      value={selectedDocument.category}
                      onChange={(e) => updateDocumentDetails(
                        selectedDocument.id, 
                        selectedDocument.borrower, 
                        e.target.value
                      )}
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
                        selectedDocument.borrower === "Select a borrower" || 
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