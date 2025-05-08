"use client";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Key, Save } from "lucide-react";
import { useState } from "react";

export default function ProfilePage() {
  let user = { username: "admin" };
  const [name, setName] = useState(user.name)
  const [password, setPassword] = useState("")

  const handleSubmit = async() => {
    const base_url = "http://127.0.0.1:5000";
    try {
         
      // Create a FormData object
      const formData = new FormData();
      
      // Validate and add required fields
      if (!name) {
        alert("Name can't be empty");
        return;
      }
      
      formData.append("name", name);
      formData.append("password", password);

      // Make the HTTP request
      const response = await fetch(`${base_url}/api/user`, {
        method: "PUT",
        body: formData,
        headers: {
          "Authorization": `Bearer ${user.username}`
        }
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
        alert("Profile updated successfully")
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit application. Please try again.");
    }
  }

  return (
    <section className="max-w-xl mx-auto p-6 min-h-screen flex items-center justify-center">
      <Card className="w-full shadow-lg border-0">
        <CardHeader className="flex flex-col items-center gap-6 pb-8 border-b bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
          <div className="relative mt-2">
            <Avatar className="w-24 h-24 border-4 border-white shadow-md">
              <AvatarImage src="/avatar-placeholder.png" alt="User avatar" />
              <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xl font-medium">JD</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2">
              <Button size="sm" variant="outline" className="rounded-full w-8 h-8 p-0 bg-white">
                <User size={14} />
              </Button>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">Your Profile</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-slate-700">Full Name</Label>
            <div className="relative">
              <Input 
                id="name" 
                placeholder="John Doe" 
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                }}
                className="pl-10 py-2 bg-slate-50 focus:bg-white transition-all" 
              />
              <User size={16} className="absolute left-3 top-3 text-slate-400" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</Label>
            <div className="relative">
              <Input 
                id="email" 
                type="email" 
                placeholder="john@example.com" 
                value={user.username}
                className="pl-10 py-2 bg-slate-50 focus:bg-white transition-all"
                disabled
              />
              <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
            <div className="relative">
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e)=> {
                  setPassword(e.target.value)
                }}
                placeholder="••••••••" 
                className="pl-10 py-2 bg-slate-50 focus:bg-white transition-all"
              />
              <Key size={16} className="absolute left-3 top-3 text-slate-400" />
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-2 pb-6 px-6">
          <Button className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow transition-all" onClick={() => {handleSubmit()}}>
            <Save size={16} className="mr-2" />
            Update Profile
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}