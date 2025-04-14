"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc"; // Google icon (optional)

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Logging in with", email, password);

    // Mock auth logic
    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  };

  const handleGoogleSignIn = () => {
    console.log("Signing in with Google");
    // Add Google sign-in logic here (e.g., next-auth or Firebase)
  };

  return (
    <section className="max-w-md mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button type="submit" className="w-full sm:w-1/2">
                Login
              </Button>
              <Button
                type="button"
                onClick={handleGoogleSignIn}
                variant="outline"
                className="w-full sm:w-1/2 flex items-center justify-center gap-2"
              >
                <FcGoogle className="text-xl" />
                Google
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
