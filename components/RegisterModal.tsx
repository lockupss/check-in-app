'use client';

import { useState } from 'react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function RegisterModal({ show, onClose, onRegistered }: any) {
  const [errorMessage, setErrorMessage] = useState("");

  const RegisterSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    userId: z.string().min(2, "User ID is required"),
    laptopBrand: z.string().min(2, "Laptop brand is required"),
    department: z.string().min(2, "Department is required"),
  });

  type RegisterFormValues = z.infer<typeof RegisterSchema>;

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      userId: "",
      laptopBrand: "",
      department: "General",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        const msg = body?.message || "Something went wrong while registering. Maybe userId already exists";
        setErrorMessage(msg);
        toast.error(`❌ Registration failed: ${msg}`);
        return;
      }

      form.reset();
      setErrorMessage("");
      toast.success(`✅ Registration successful for ${data.name}`);
      onRegistered();
      onClose();
    } catch (error) {
      setErrorMessage("Network error. Please try again later.");
      toast.error("⚠️ Network error. Please try again.");
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-amber-50/80">
      <Card className="w-full max-w-md shadow-xl border-amber-200 bg-amber-50">
        <CardHeader className="border-b border-amber-200">
          <CardTitle className="text-amber-900">Register Entry</CardTitle>
        </CardHeader>

        {errorMessage && (
          <Alert variant="destructive" className="mx-6 mb-2 bg-amber-100 border-amber-300 text-amber-900">
            <AlertCircle className="h-4 w-4 text-amber-700" />
            <AlertTitle className="text-amber-800">Registration failed</AlertTitle>
            <AlertDescription className="text-amber-700">{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-6">
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-amber-800">Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Name" 
                        {...field} 
                        className="border-amber-300 focus:ring-amber-500 focus:border-amber-500 bg-amber-50 text-amber-900"
                      />
                    </FormControl>
                    <FormMessage className="text-amber-600" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-amber-800">User ID</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="User ID" 
                        {...field} 
                        className="border-amber-300 focus:ring-amber-500 focus:border-amber-500 bg-amber-50 text-amber-900"
                      />
                    </FormControl>
                    <FormMessage className="text-amber-600" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="laptopBrand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-amber-800">Laptop Brand</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Laptop Brand" 
                        {...field} 
                        className="border-amber-300 focus:ring-amber-500 focus:border-amber-500 bg-amber-50 text-amber-900"
                      />
                    </FormControl>
                    <FormMessage className="text-amber-600" />
                  </FormItem>
                )}
              />
            
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-amber-800">Department</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Department" 
                        {...field} 
                        className="border-amber-300 focus:ring-amber-500 focus:border-amber-500 bg-amber-50 text-amber-900"
                      />
                    </FormControl>
                    <FormMessage className="text-amber-600" />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between border-t border-amber-200 pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="border-amber-300 text-amber-800 hover:bg-amber-100 hover:text-amber-900"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-amber-700 hover:bg-amber-800 text-amber-50"
              >
                Submit
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}