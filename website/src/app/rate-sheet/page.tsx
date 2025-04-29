"use client";
// add this line in the terminal "npx shadcn@latest add accordion" at cd website.
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from "@/components/ui/accordion";

// Types
type UploadedDocument = {
  id: string;
  file: File;
  borrower: string;
  category: string;
  uploadedAt: Date;
};

type IncomeEntry = {
  id: string;
  label: string;
  amount: number;
  breakdown?: { id: string; label: string; amount: number }[];
};

export default function RateSheetPage() {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<UploadedDocument | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'documents' | 'income'>('documents');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const borrowers = ["Alice Firstimer", "John Homeowner", "Second buyer"];
  const categories = ["Income", "Asset", "Credit"];

  const incomeData: IncomeEntry[] = [
    {
      id: 'wages',
      label: 'Wages',
      amount: 6000,
      breakdown: [
        { id: 'amzn', label: 'Amazon – Paystub Base', amount: 2000 },
        { id: 'amzn_ot', label: 'Amazon – Paystub Overtime', amount: 2000 },
        { id: 'apple', label: 'Apple', amount: 2000 }
      ]
    },
    { id: 'self', label: 'Self Employed', amount: 1500 },
    { id: 'rental', label: 'Rental', amount: 5000 },
    { id: 'other', label: 'Others', amount: 3500 }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedDocument({
      id: crypto.randomUUID(),
      file,
      borrower: "Select a borrower",
      category: "Select a category",
      uploadedAt: new Date()
    });
  };

  const updateDocumentDetails = (borrower: string, category: string) => {
    if (!selectedDocument) return;
    setSelectedDocument({ ...selectedDocument, borrower, category });
  };

  const handleFinalUpload = () => {
    if (!selectedDocument) return;
    setDocuments(prev => [...prev, selectedDocument]);
    setSelectedDocument(null);
    setIsUploadDialogOpen(false);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="container mx-auto">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "documents" | "income")}>
          <TabsList className="inline-flex bg-white rounded-full p-1 shadow">
            <TabsTrigger
              value="income"
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeTab === 'income' ? 'bg-purple-500 text-white' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Income Calculation
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeTab === 'documents' ? 'bg-purple-500 text-white' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Documents
            </TabsTrigger>
          </TabsList>

          {/* Documents Tab */}
          <TabsContent value="documents" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Alice Firstimer and John Homeowner</h2>
              <Button
                className="bg-purple-600 text-white hover:bg-purple-700"
                onClick={() => setIsUploadDialogOpen(true)}
              >
                Upload Document
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Borrower</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded At</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {documents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-gray-500">No documents uploaded yet</td>
                    </tr>
                  ) : (
                    documents.map(doc => (
                      <tr key={doc.id} className="hover:bg-gray-50 cursor-pointer">
                        <td className="px-4 py-3 text-purple-600">{doc.file.name}</td>
                        <td className="px-4 py-3">{doc.borrower}</td>
                        <td className="px-4 py-3">{doc.category}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {doc.uploadedAt.toLocaleDateString()} {doc.uploadedAt.toLocaleTimeString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Upload Dialog */}
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload Document</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 p-6 text-center">
                    <p className="text-gray-500">Drag & drop your file here</p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".pdf,.jpg,.png,.tif"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <Button variant="outline" className="mt-4" onClick={() => fileInputRef.current?.click()}>
                      Browse Files
                    </Button>
                  </div>

                  {selectedDocument && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Borrower</label>
                        <select
                          value={selectedDocument.borrower}
                          onChange={e => updateDocumentDetails(e.target.value, selectedDocument.category)}
                          className="mt-1 w-full border rounded-md p-2"
                        >
                          <option>Select a borrower</option>
                          {borrowers.map(b => <option key={b}>{b}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select
                          value={selectedDocument.category}
                          onChange={e => updateDocumentDetails(selectedDocument.borrower, e.target.value)}
                          className="mt-1 w-full border rounded-md p-2"
                        >
                          <option>Select a category</option>
                          {categories.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>Cancel</Button>
                        <Button
                          className="bg-purple-600 text-white hover:bg-purple-700"
                          onClick={handleFinalUpload}
                          disabled={
                            selectedDocument.borrower === "Select a borrower" ||
                            selectedDocument.category === "Select a category"
                          }
                        >
                          Upload
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Income Tab */}
          <TabsContent value="income" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Qualifying Income</h2>
              <span className="text-3xl font-bold text-purple-600">
                ${incomeData.reduce((sum, i) => sum + i.amount, 0).toLocaleString()}
              </span>
            </div>

            <div className="border rounded-lg overflow-hidden shadow-sm p-6 bg-white">
              <div className="grid grid-cols-2 gap-4">
                <ul className="space-y-3">
                  {incomeData.map((item, idx) => (
                    <li key={item.id} className="flex items-center">
                      <span
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: ['#FBBF24', '#FB923C', '#34D399', '#BFDBFE'][idx % 4] }}
                      />
                      <span className="flex-1">{item.label}</span>
                      <span>${item.amount.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>

                <Accordion type="multiple" className="w-full">
                  {incomeData.map(item => (
                    <AccordionItem key={item.id} value={item.id}>
                      <AccordionTrigger className="flex justify-between px-4 py-2 bg-gray-100 rounded-md">
                        <span>{item.label}</span>
                        <span>${item.amount.toLocaleString()}</span>
                      </AccordionTrigger>
                      {item.breakdown && (
                        <AccordionContent className="p-4 bg-gray-50">
                          <ul className="space-y-2">
                            {item.breakdown.map(b => (
                              <li key={b.id} className="flex justify-between">
                                <span>{b.label}</span>
                                <span>${b.amount.toLocaleString()}</span>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      )}
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}




// "use client";

// import { useRef, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Trash2, Upload, File, Repeat, Eye } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import {
//   Dialog,
//   DialogTrigger,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";

// type UploadedFile = {
//   id: string;
//   file: File;
//   annotation: string;
// };

// export default function RateSheetPage() {
//   const [files, setFiles] = useState<UploadedFile[]>([]);
//   const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
//   const fileInputRef = useRef<HTMLInputElement | null>(null);

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     if (!event.target.files) return;

//     const selectedFiles = Array.from(event.target.files).map((file) => ({
//       id: crypto.randomUUID(),
//       file,
//       annotation: file.name,
//     }));

//     setFiles((prev) => [...prev, ...selectedFiles]);
//   };

//   const handleReplace = (id: string) => {
//     const input = document.createElement("input");
//     input.type = "file";
//     input.accept = "*/*";
//     input.onchange = (e: any) => {
//       const newFile = e.target.files[0];
//       if (!newFile) return;

//       setFiles((prev) =>
//         prev.map((f) =>
//           f.id === id
//             ? {
//                 id: crypto.randomUUID(),
//                 file: newFile,
//                 annotation: newFile.name,
//               }
//             : f
//         )
//       );
//     };
//     input.click();
//   };

//   const handleDelete = (id: string) => {
//     setFiles((prev) => prev.filter((f) => f.id !== id));
//   };

//   const handleAnnotationChange = (id: string, value: string) => {
//     setFiles((prev) =>
//       prev.map((f) => (f.id === id ? { ...f, annotation: value } : f))
//     );
//   };

//   const getPreviewUrl = (file: File) => {
//     return URL.createObjectURL(file);
//   };

//   return (
//     <section className="max-w-2xl mx-auto p-4 space-y-4">
//       <Card>
//         <CardHeader>
//           <CardTitle>Upload Files</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="flex items-center gap-4">
//             <Input
//               type="file"
//               multiple
//               ref={fileInputRef}
//               onChange={handleFileChange}
//               className="hidden"
//             />
//             <Button onClick={() => fileInputRef.current?.click()} variant="outline">
//               <Upload className="w-4 h-4 mr-2" />
//               Choose Files
//             </Button>
//           </div>

//           {files.length > 0 && (
//             <div className="space-y-3">
//               {files.map(({ id, file, annotation }) => (
//                 <div
//                   key={id}
//                   className="flex flex-col sm:flex-row sm:items-center sm:justify-between border rounded-lg px-3 py-2 gap-2"
//                 >
//                   <div className="flex items-center gap-2 w-full sm:w-auto">
//                     <File className="w-4 h-4 shrink-0" />
//                     <Input
//                       value={annotation}
//                       onChange={(e) => handleAnnotationChange(id, e.target.value)}
//                       className="text-sm"
//                       placeholder="Add a label or annotation"
//                     />
//                   </div>
//                   <div className="flex items-center gap-2 justify-end">
//                     <Dialog>
//                       <DialogTrigger asChild>
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           onClick={() => setPreviewFile({ id, file, annotation })}
//                         >
//                           <Eye className="w-4 h-4" />
//                         </Button>
//                       </DialogTrigger>
//                       <DialogContent className="max-w-3xl h-[80vh] overflow-auto">
//                         <DialogHeader>
//                           <DialogTitle className="truncate">{annotation}</DialogTitle>
//                         </DialogHeader>
//                         <div className="mt-4 max-h-[70vh] overflow-auto">
//                           {file.type.startsWith("image/") && (
//                             <img
//                               src={getPreviewUrl(file)}
//                               alt={file.name}
//                               className="max-w-full max-h-[60vh] mx-auto"
//                             />
//                           )}
//                           {file.type === "application/pdf" && (
//                             <iframe
//                               src={getPreviewUrl(file)}
//                               className="w-full h-[60vh] border rounded"
//                             />
//                           )}
//                           {!file.type.startsWith("image/") &&
//                             file.type !== "application/pdf" && (
//                               <p className="text-muted-foreground">
//                                 Preview not available for this file type.
//                               </p>
//                             )}
//                         </div>
//                       </DialogContent>
//                     </Dialog>

//                     <Button variant="ghost" size="icon" onClick={() => handleReplace(id)}>
//                       <Repeat className="w-4 h-4" />
//                     </Button>
//                     <Button variant="ghost" size="icon" onClick={() => handleDelete(id)}>
//                       <Trash2 className="w-4 h-4 text-red-500" />
//                     </Button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </section>
//   );
// }


