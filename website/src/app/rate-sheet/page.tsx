"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Upload, File, Repeat, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type UploadedFile = {
  id: string;
  file: File;
  annotation: string;
};

export default function RateSheetPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    const selectedFiles = Array.from(event.target.files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      annotation: file.name,
    }));

    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const handleReplace = (id: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "*/*";
    input.onchange = (e: any) => {
      const newFile = e.target.files[0];
      if (!newFile) return;

      setFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                id: crypto.randomUUID(),
                file: newFile,
                annotation: newFile.name,
              }
            : f
        )
      );
    };
    input.click();
  };

  const handleDelete = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleAnnotationChange = (id: string, value: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, annotation: value } : f))
    );
  };

  const getPreviewUrl = (file: File) => {
    return URL.createObjectURL(file);
  };

  return (
    <section className="max-w-2xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Upload Files</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <Button onClick={() => fileInputRef.current?.click()} variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Choose Files
            </Button>
          </div>

          {files.length > 0 && (
            <div className="space-y-3">
              {files.map(({ id, file, annotation }) => (
                <div
                  key={id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between border rounded-lg px-3 py-2 gap-2"
                >
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <File className="w-4 h-4 shrink-0" />
                    <Input
                      value={annotation}
                      onChange={(e) => handleAnnotationChange(id, e.target.value)}
                      className="text-sm"
                      placeholder="Add a label or annotation"
                    />
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPreviewFile({ id, file, annotation })}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl h-[80vh] overflow-auto">
                        <DialogHeader>
                          <DialogTitle className="truncate">{annotation}</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4 max-h-[70vh] overflow-auto">
                          {file.type.startsWith("image/") && (
                            <img
                              src={getPreviewUrl(file)}
                              alt={file.name}
                              className="max-w-full max-h-[60vh] mx-auto"
                            />
                          )}
                          {file.type === "application/pdf" && (
                            <iframe
                              src={getPreviewUrl(file)}
                              className="w-full h-[60vh] border rounded"
                            />
                          )}
                          {!file.type.startsWith("image/") &&
                            file.type !== "application/pdf" && (
                              <p className="text-muted-foreground">
                                Preview not available for this file type.
                              </p>
                            )}
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button variant="ghost" size="icon" onClick={() => handleReplace(id)}>
                      <Repeat className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
