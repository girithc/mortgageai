"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin && password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    console.log(isLogin ? "Logging in with" : "Registering with", email, password);

    setTimeout(() => {
      window.location.href = "/dashboard"; // Mock navigation
    }, 1000);
  };

  const handleGoogleSignIn = () => {
    console.log("Signing in with Google");
    // Add Google OAuth logic
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Left panel for large screens */}
      <div className="hidden md:flex md:w-1/2 bg-blue-500 flex-col items-center justify-center text-white relative overflow-hidden">
        <div className="z-10 flex flex-col items-center justify-center p-8">
          <h2 className="text-3xl mb-4">{isLogin ? "New here?" : "Already have an account?"}</h2>
          <p className="text-center mb-8">
            {isLogin ? "Sign Up and Start Ordering!" : "Sign in and continue!"}
          </p>
          <Button
            variant="outline"
            onClick={toggleAuthMode}
            className="border-black text-black transition-colors rounded-full px-10 py-4"
          >
            {isLogin ? "REGISTER" : "LOGIN"}
          </Button>
        </div>
        <div
          className="absolute right-0 top-0 h-full w-1/4 bg-white"
          style={{
            borderTopLeftRadius: "100%",
            borderBottomLeftRadius: "100%",
          }}
        ></div>
      </div>

      {/* Right side form */}
      <div className="w-full md:w-1/2 bg-white flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Card className="w-full shadow-lg">
            <CardHeader>
              <CardTitle className="text-center text-3xl font-bold text-gray-800 mb-6">
                {isLogin ? "Sign in" : "Register"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Show toggle button on small screens */}
              <div className="flex md:hidden justify-center mb-6">
                <Button
                  variant="outline"
                  onClick={toggleAuthMode}
                  className="border-gray-400 text-gray-700 rounded-full px-8 py-3 text-sm"
                >
                  {isLogin ? "Need an account? Register" : "Have an account? Login"}
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-2 w-full bg-gray-100 py-6 pl-10"
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-2 w-full bg-gray-100 py-6 pl-10"
                  />
                </div>
                {!isLogin && (
                  <div>
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="mt-2 w-full bg-gray-100 py-6 pl-10"
                    />
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    type="submit"
                    className="w-full sm:w-1/2 bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-full transition-colors"
                  >
                    {isLogin ? "Login" : "Register"}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleGoogleSignIn}
                    variant="outline"
                    className="w-full sm:w-1/2 flex items-center justify-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors rounded-full py-4"
                  >
                    {/* Google SVG */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.45h3.57c2.08-1.92 3.28-4.74 3.28-8.07z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-1 7.28-2.69l-3.57-2.77c-.99.69-2.26 1.1-3.71 1.1-2.87 0-5.3-1.95-6.16-4.57H2.18v2.84C4 20.2 7.74 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.66-2.07z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1 7.74 1 4 3.8 2.18 7.07l3.66 2.84c.86-2.62 3.29-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Google
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
