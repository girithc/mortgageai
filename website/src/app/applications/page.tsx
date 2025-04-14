"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useRef, useState } from "react";
import { Plus, Loader2 } from "lucide-react";

type Application = {
  id: string;
  name: string;
  email: string;
  files: {
    payStub?: File;
    incomeProof?: File;
    bankStatement?: File;
    idDoc?: File;
  };
  processing: boolean;
  progress: number;
  complete: boolean;
  decision: {
    result: string;
    reason: string;
  } | null;
};

export default function ApplicationPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<Partial<Application["files"]>>({});

  const handleFileChange = (field: keyof Application["files"]) => (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0];
    if (file) {
      setFiles((prev) => ({ ...prev, [field]: file }));
    }
  };

  const handleSubmit = () => {
    const name = nameRef.current?.value || "";
    const email = emailRef.current?.value || "";

    const newApp: Application = {
      id: crypto.randomUUID(),
      name,
      email,
      files: {
        payStub: files.payStub,
        incomeProof: files.incomeProof,
        bankStatement: files.bankStatement,
        idDoc: files.idDoc,
      },
      processing: false,
      progress: 0,
      complete: false,
      decision: null,
    };

    setApplications((prev) => [...prev, newApp]);
    setDialogOpen(false);
    setFiles({});
  };

  const handleProcess = (id: string) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, processing: true, progress: 0 } : app
      )
    );

    const interval = setInterval(() => {
      setApplications((prev) =>
        prev.map((app) => {
          if (app.id !== id || app.complete) return app;

          const nextProgress = app.progress + Math.floor(Math.random() * 15 + 10);
          if (nextProgress >= 100) {
            clearInterval(interval);
            return {
              ...app,
              progress: 100,
              processing: false,
              complete: true,
              decision: {
                result: "Approved",
                reason: "Credit score and income verification passed.",
              },
            };
          }

          return {
            ...app,
            progress: nextProgress,
          };
        })
      );
    }, 700);
  };

  return (
    <section className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Add Mortgage Button */}
      <div className="flex justify-start">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Mortgage
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Mortgage Application</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input type="text" ref={nameRef} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" ref={emailRef} />
              </div>
              <div>
                <Label>Pay Stub</Label>
                <Input type="file" onChange={handleFileChange("payStub")} />
              </div>
              <div>
                <Label>Income Proof</Label>
                <Input type="file" onChange={handleFileChange("incomeProof")} />
              </div>
              <div>
                <Label>Bank Statement</Label>
                <Input type="file" onChange={handleFileChange("bankStatement")} />
              </div>
              <div>
                <Label>ID</Label>
                <Input type="file" onChange={handleFileChange("idDoc")} />
              </div>
              <Button onClick={handleSubmit} className="mt-2 w-full">
                Submit Application
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Application Cards */}
      {applications.map((app) => (
        <Card key={app.id}>
          <CardHeader>
            <CardTitle>{app.name}</CardTitle>
            <p className="text-muted-foreground text-sm">{app.email}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {!app.complete ? (
              <>
                {app.processing ? (
                  <>
                    <Progress value={app.progress} />
                    <p className="text-sm text-muted-foreground">
                      Processing... {app.progress}%
                    </p>
                  </>
                ) : (
                  <Button onClick={() => handleProcess(app.id)}>Process</Button>
                )}
              </>
            ) : (
              <>
                <p className="text-green-600 font-medium">✅ {app.decision?.result}</p>
                <details className="border rounded p-2">
                  <summary className="cursor-pointer text-sm text-muted-foreground">
                    View Decision
                  </summary>
                  <p className="mt-2 text-sm">{app.decision?.reason}</p>
                </details>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
