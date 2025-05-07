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


    // API base URL - should be environment variable in production
    const base_url = "http://127.0.0.1:5000";

    if (!isLogin) {
      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      else {
        try {
         
          // Create a FormData object
          const formData = new FormData();
          
          // Validate and add required fields
          if (!email || !password) {
            alert("Please fill in all required fields");
            return;
          }
          
          formData.append("username", email);
          formData.append("password", password);
          formData.append("name", "Loan Officer");
    
          // Make the HTTP request
          const response = await fetch(`${base_url}/api/user`, {
            method: "POST",
            body: formData
          });
    
          // Parse the JSON response
          const data = await response.json();
          console.log("Response from server:", data);
    
          // Check if the request was successful
          if (!response.ok) {
            if (response.status === 400) {
              // Handle unauthorized
             alert(data.error)
            }
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          else {
            localStorage.setItem("user", JSON.stringify(data.user))
            window.location.href = "/applications";
          }
        } catch (error) {
          console.error("Error submitting form:", error);
          alert("Failed to submit application. Please try again.");
        }
      }
    }
    else {
      try{
        // Create a FormData object
        const formData = new FormData();
            
        // Validate and add required fields
        if (!email || !password) {
          alert("Please fill in all required fields");
          return;
        }
        
        formData.append("username", email);
        formData.append("password", password);

        // Make the HTTP request
        const response = await fetch(`${base_url}/api/user/login`, {
          method: "POST",
          body: formData
        });

        // Parse the JSON response
        const data = await response.json();
        console.log("Response from server:", data);

        // Check if the request was successful
        if (!response.ok) {
          if (response.status === 400) {
            // Handle unauthorized
          alert(data.error)
          }
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        else {
          localStorage.setItem("user", JSON.stringify(data.user))
          window.location.href = "/applications";
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        alert("Failed to submit application. Please try again.");
      }
    }

    // console.log(isLogin ? "Logging in with" : "Registering with", email, password);

    // setTimeout(() => {
    //   window.location.href = "/applications"; // Mock navigation
    // }, 1000);
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
    <div className="flex min-h-screen">
      {/* Left Graphic Panel */}
      <div className="hidden md:flex md:w-1/2 relative items-center justify-center bg-gradient-to-tr from-indigo-600 to-blue-500 overflow-hidden">
        <div className="z-10 p-12 text-center text-white">
          <h2 className="text-4xl font-extrabold mb-4">
            {isLogin ? "New here?" : "Welcome back!"}
          </h2>
          <p className="mb-8 opacity-90">
            {isLogin
              ? "Create your account and dive in."
              : "Sign in and keep going."}
          </p>
          <Button
            variant="outline"
            onClick={toggleAuthMode}
            className="rounded-full border-white text-black px-8 py-3 hover:bg-white hover:text-indigo-600 transition"
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </Button>
        </div>
        {/* Decorative circles */}
        <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white opacity-10 rounded-full" />
        <div className="absolute -top-16 -left-16 w-72 h-72 bg-white opacity-5 rounded-full" />
      </div>

      {/* Form Panel */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-8 bg-gray-50">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl">
          <CardHeader className="pt-10">
            <CardTitle className="text-3xl font-bold text-center text-gray-800">
              {isLogin ? "Sign In" : "Create Account"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6 mt-6 px-6 pb-8">
              <div>
                <Label htmlFor="email" className="block text-gray-700 mb-2">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl bg-white/90 py-3 px-4 focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <Label htmlFor="password" className="block text-gray-700 mb-2">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl bg-white/90 py-3 px-4 focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              {!isLogin && (
                <div>
                  <Label
                    htmlFor="confirmPassword"
                    className="block text-gray-700 mb-2"
                  >
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full rounded-xl bg-white/90 py-3 px-4 focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl py-3 transition"
              >
                {isLogin ? "Log In" : "Register"}
              </Button>

              <Button
                type="button"
                onClick={() => console.log("Google Sign In")}
                variant="outline"
                className="w-full flex items-center justify-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl py-3 transition"
              >
                {/* Google Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.45h3.57c2.08-1.92 
                    3.28-4.74 3.28-8.07z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-1 7.28-2.69l-3.57-2.77c-.99.69-2.26 1.1-3.71 1.1
                    -2.87 0-5.3-1.95-6.16-4.57H2.18v2.84C4 
                    20.2 7.74 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 
                    8.55 1 10.22 1 12s.43 3.45 1.18 
                    4.93l2.66-2.07z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 
                    1.64l3.15-3.15C17.46 2.09 
                    14.97 1 12 1 7.74 1 4 3.8 2.18 
                    7.07l3.66 2.84c.86-2.62 3.29-4.53 
                    6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign in with Google
              </Button>

              <p className="mt-4 text-center text-sm text-gray-600">
                {isLogin
                  ? "Don’t have an account? "
                  : "Already have an account? "}
                <button
                  type="button"
                  onClick={toggleAuthMode}
                  className="text-indigo-600 hover:underline"
                >
                  {isLogin ? "Register" : "Log in"}
                </button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}