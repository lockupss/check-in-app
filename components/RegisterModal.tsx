'use client';

import { useState } from 'react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
  });

  type RegisterFormValues = z.infer<typeof RegisterSchema>;

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      userId: "",
      laptopBrand: "",
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
        setErrorMessage(body?.message || "Something went wrong while registering. Maybe userId already exists");
        return;
      }

      form.reset();
      setErrorMessage("");
      onRegistered();
      onClose();
    } catch (error) {
      setErrorMessage("Network error. Please try again later.");
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/20">
      <Card className="w-full max-w-md shadow-xl border border-gray-300">
        <CardHeader>
          <CardTitle>Register Entry</CardTitle>
        </CardHeader>

        {/* 💥 Alert inserted here, right before the form */}
        {errorMessage && (
          <Alert variant="destructive" className="mx-6 mb-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Registration failed</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
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
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User ID</FormLabel>
                    <FormControl>
                      <Input placeholder="User ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="laptopBrand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Laptop Brand</FormLabel>
                    <FormControl>
                      <Input placeholder="Laptop Brand" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-orange-300 text-white">
                Submit
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
