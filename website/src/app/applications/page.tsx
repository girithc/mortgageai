"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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

  // mock data
  const loans: Loan[] = [
    {
      id: "L12345",
      borrowers: "Alice Firstimer and John Homeowner",
      amount: "$320,000",
      type: "Conventional",
      rate: "4.25%",
      status: "In Process",
      progress: (3 / 5) * 100,
      lastUpdated: "04/24/2025",
    },
    {
      id: "L12346",
      borrowers: "Sarah Johnson and Mark Williams",
      amount: "$450,000",
      type: "FHA",
      rate: "4.5%",
      status: "Ready for Review",
      progress: (4 / 5) * 100,
      lastUpdated: "04/23/2025",
    },
    {
      id: "L12347",
      borrowers: "David Lee and Jennifer Kim",
      amount: "$275,000",
      type: "VA",
      rate: "4%",
      status: "Pending Documents",
      progress: (2 / 5) * 100,
      lastUpdated: "04/25/2025",
    },
    {
      id: "L12348",
      borrowers: "Michael Brown and Lisa Brown",
      amount: "$380,000",
      type: "Conventional",
      rate: "4.375%",
      status: "Approved",
      progress: 100,
      lastUpdated: "04/22/2025",
    },
    {
      id: "L12349",
      borrowers: "Robert Smith",
      amount: "$210,000",
      type: "Conventional",
      rate: "4.25%",
      status: "Denied",
      progress: (3 / 5) * 100,
      lastUpdated: "04/21/2025",
    },
  ];

  const filtered = loans
    .filter((l) => filter === "All" || l.status === filter)
    .filter((l) =>
      l.borrowers.toLowerCase().includes(search.trim().toLowerCase())
    );

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
                  <a className="text-indigo-600 hover:underline">{loan.id}</a>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
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
                />
              </label>
            </div>
            <Input placeholder="Borrower" className="mb-2" />
            <Input placeholder="Loan Amount" className="mb-2" />
            <Input placeholder="Loan Type" className="mb-2" />
            <Input placeholder="Desired Rate" className="mb-4" />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => { /* handle submit logic */ }}>
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
