"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, UploadCloud } from "lucide-react";

interface Loan {
  id: string;
  borrowers: string;
  amount: string;
  type: string;
  rate: string;
  status: StatusKey;
  progress: number; // 0–100
  lastUpdated: string;
}

type StatusKey =
  | "In Process"
  | "Ready for Review"
  | "Approved"
  | "Pending Documents"
  | "Denied";

// map colors
const STATUS_STYLES: Record<StatusKey, string> = {
  "In Process": "bg-blue-100 text-blue-600",
  "Ready for Review": "bg-purple-100 text-purple-600",
  Approved: "bg-green-100 text-green-600",
  "Pending Documents": "bg-yellow-100 text-yellow-600",
  Denied: "bg-red-100 text-red-600",
};

const ALL_FILTERS: Array<"All" | StatusKey> = [
  "All",
  "In Process",
  "Ready for Review",
  "Approved",
  "Pending Documents",
  "Denied",
];

export default function ApplicationPage() {
  const [filter, setFilter] = useState<typeof ALL_FILTERS[number]>("All");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loans, setLoans] = useState([])
  const [borrowers, setBorrowers] = useState([{ firstname: "", lastname: "", phone: "", email: "" }]);
  const [loanAmount, setLoanAmount] = useState("");
  const [propertyPrice, setPropertyPrice] = useState("");
  const [loanType, setLoanType] = useState("CONVENTIONAL");
  const [loanTerm, setLoanTerm] = useState("30yrs");
  const [loanPurpose, setLoanPurpose] = useState("PURCHASE");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
 
  const addBorrower = () => {
    setBorrowers([...borrowers, { firstname: "", lastname: "", phone: "", email: "" }]);
  };
  
  const updateBorrower = (index: number, field: string, value: string) => {
    const updatedBorrowers = [...borrowers];
    updatedBorrowers[index][field] = value;
    setBorrowers(updatedBorrowers);
  };
  
  useEffect(() => {
      let base_url ="http://127.0.0.1:5000"
      const loadApplications = async () => {
        // Make the HTTP request
        const response = await fetch(`${base_url}/applications`);
          
        // Check if the request was successful
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // Parse the JSON response
        const data = await response.json();

        setLoans(data)
      }

      loadApplications()
  }, [])



  const filtered = loans
    .filter((l) => filter === "All" || l.status === filter)
    .filter((l) =>
      l.borrowers.toLowerCase().includes(search.trim().toLowerCase())
    );

  const handleSubmit = async () => {
    // Handle the form submission logic here
    console.log("Form submitted with values:", {
      propertyPrice,
      loanAmount,
      loanType,
      loanTerm,
      loanPurpose,
      borrowers,
    });
    
    let base_url = "http://127.0.0.1:5000"

    // Create a FormData object
    const formData = new FormData();
    formData.append("propertyPrice", propertyPrice);
    formData.append("loanAmount", loanAmount);
    formData.append("loanType", loanType);
    formData.append("loanTerm", loanTerm);
    formData.append("loanPurpose", loanPurpose);

    // Append borrowers as a JSON string
    formData.append("borrowers", JSON.stringify(borrowers));

     // Append selected files
    if (selectedFiles.length > 0) {
      selectedFiles.forEach((file) => {
        formData.append("files", file); // Use the same key for multiple files
      });
    }

    try {
      // Make the HTTP request
      const response = await fetch(`${base_url}/applications`, {
        method: "POST",
        body: formData, // Send the FormData object
      });

      console.log("response ", response.body)

      // Check if the request was successful
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Parse the JSON response
      const data = await response.json();
      console.log("Response from server:", data);

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

  return (
    <main className="container mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">Loan Pipeline</h2>

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
            {filtered.map((loan) => (
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
                      STATUS_STYLES[loan.status]
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
            ))}
          </tbody>
        </table>
      </div>

      {/* New Loan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" >
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen" style={{overflowY: "auto",scrollbarWidth: "none"}}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold">New Loan</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {/* Upload Area - Fixed Version */}
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
                      setSelectedFiles(Array.from(e.target.files)); // Convert FileList to an array
                    }
                  }}
                />
              </label>
              {selectedFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold">Selected Files:</h4>
                  <ul className="list-disc list-inside text-left">
                    {selectedFiles.map((file, index) => (
                      <Badge key={index}>{file.name.substring(0, 20)}</Badge>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <Input 
              type="number" 
              placeholder="Property Amount" 
              className="mb-2" 
              value={propertyPrice}
              onChange={(e) => setPropertyPrice(e.target.value)}
            />
            <Input 
              type="number" 
              placeholder="Loan Amount" 
              className="mb-2" 
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
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
                <SelectItem value="30yrs">30 years</SelectItem>
                <SelectItem value="15yrs">15 years</SelectItem>
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
            <Button variant="outline" onClick={addBorrower} className="w-full">
              + Add Borrower
            </Button>
            {borrowers.map((borrower, index) => (
              <div key={index} className="mb-4 border p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-2">Borrower {index + 1}</h3>
                <Input
                  type="text"
                  placeholder="First Name"
                  value={borrower.firstname}
                  onChange={(e) => updateBorrower(index, "firstname", e.target.value)}
                  className="mb-2"
                />
                <Input
                  type="text"
                  placeholder="Last Name"
                  value={borrower.lastname}
                  onChange={(e) => updateBorrower(index, "lastname", e.target.value)}
                  className="mb-2"
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
                />
              </div>
            ))}
           
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setIsModalOpen(false);
                setBorrowers([{ firstname: "", lastname: "", phone: "", email: "" }])}}>
                Cancel
              </Button>
              <Button onClick={() => { handleSubmit(); setIsModalOpen(false); }}>
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}


// "use client";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";
// import { useRef, useState } from "react";
// import { Plus, Loader2 } from "lucide-react";

// type Application = {
//   id: string;
//   name: string;
//   email: string;
//   files: {
//     payStub?: File;
//     incomeProof?: File;
//     bankStatement?: File;
//     idDoc?: File;
//   };
//   processing: boolean;
//   progress: number;
//   complete: boolean;
//   decision: {
//     result: string;
//     reason: string;
//   } | null;
// };

// export default function ApplicationPage() {
//   const [applications, setApplications] = useState<Application[]>([]);
//   const [dialogOpen, setDialogOpen] = useState(false);

//   const nameRef = useRef<HTMLInputElement>(null);
//   const emailRef = useRef<HTMLInputElement>(null);
//   const [files, setFiles] = useState<Partial<Application["files"]>>({});

//   const handleFileChange = (field: keyof Application["files"]) => (e: React.ChangeEvent<HTMLInputElement>) => {

//     const file = e.target.files?.[0];
//     if (file) {
//       setFiles((prev) => ({ ...prev, [field]: file }));
//     }
//   };

//   const handleSubmit = () => {
//     const name = nameRef.current?.value || "";
//     const email = emailRef.current?.value || "";

//     const newApp: Application = {
//       id: crypto.randomUUID(),
//       name,
//       email,
//       files: {
//         payStub: files.payStub,
//         incomeProof: files.incomeProof,
//         bankStatement: files.bankStatement,
//         idDoc: files.idDoc,
//       },
//       processing: false,
//       progress: 0,
//       complete: false,
//       decision: null,
//     };

//     setApplications((prev) => [...prev, newApp]);
//     setDialogOpen(false);
//     setFiles({});
//   };

//   const handleProcess = (id: string) => {
//     setApplications((prev) =>
//       prev.map((app) =>
//         app.id === id ? { ...app, processing: true, progress: 0 } : app
//       )
//     );

//     const interval = setInterval(() => {
//       setApplications((prev) =>
//         prev.map((app) => {
//           if (app.id !== id || app.complete) return app;

//           const nextProgress = app.progress + Math.floor(Math.random() * 15 + 10);
//           if (nextProgress >= 100) {
//             clearInterval(interval);
//             return {
//               ...app,
//               progress: 100,
//               processing: false,
//               complete: true,
//               decision: {
//                 result: "Approved",
//                 reason: "Credit score and income verification passed.",
//               },
//             };
//           }

//           return {
//             ...app,
//             progress: nextProgress,
//           };
//         })
//       );
//     }, 700);
//   };

//   return (
//     <section className="max-w-4xl mx-auto p-6 space-y-6">
//       {/* Add Mortgage Button */}
//       <div className="flex justify-start">
//         <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//           <DialogTrigger asChild>
//             <Button variant="outline">
//               <Plus className="w-4 h-4 mr-2" />
//               Add Mortgage
//             </Button>
//           </DialogTrigger>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>New Mortgage Application</DialogTitle>
//             </DialogHeader>
//             <div className="space-y-4">
//               <div>
//                 <Label>Name</Label>
//                 <Input type="text" ref={nameRef} />
//               </div>
//               <div>
//                 <Label>Email</Label>
//                 <Input type="email" ref={emailRef} />
//               </div>
//               <div>
//                 <Label>Pay Stub</Label>
//                 <Input type="file" onChange={handleFileChange("payStub")} />
//               </div>
//               <div>
//                 <Label>Income Proof</Label>
//                 <Input type="file" onChange={handleFileChange("incomeProof")} />
//               </div>
//               <div>
//                 <Label>Bank Statement</Label>
//                 <Input type="file" onChange={handleFileChange("bankStatement")} />
//               </div>
//               <div>
//                 <Label>ID</Label>
//                 <Input type="file" onChange={handleFileChange("idDoc")} />
//               </div>
//               <Button onClick={handleSubmit} className="mt-2 w-full">
//                 Submit Application
//               </Button>
//             </div>
//           </DialogContent>
//         </Dialog>
//       </div>

//       {/* Application Cards */}
//       {applications.map((app) => (
//         <Card key={app.id}>
//           <CardHeader>
//             <CardTitle>{app.name}</CardTitle>
//             <p className="text-muted-foreground text-sm">{app.email}</p>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             {!app.complete ? (
//               <>
//                 {app.processing ? (
//                   <>
//                     <Progress value={app.progress} />
//                     <p className="text-sm text-muted-foreground">
//                       Processing... {app.progress}%
//                     </p>
//                   </>
//                 ) : (
//                   <Button onClick={() => handleProcess(app.id)}>Process</Button>
//                 )}
//               </>
//             ) : (
//               <>
//                 <p className="text-green-600 font-medium">✅ {app.decision?.result}</p>
//                 <details className="border rounded p-2">
//                   <summary className="cursor-pointer text-sm text-muted-foreground">
//                     View Decision
//                   </summary>
//                   <p className="mt-2 text-sm">{app.decision?.reason}</p>
//                 </details>
//               </>
//             )}
//           </CardContent>
//         </Card>
//       ))}
//     </section>
//   );
// }
