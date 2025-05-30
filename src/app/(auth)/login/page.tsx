
"use client";

import * as React from "react";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderKanban } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const { dummyLogin, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleDummyLoginClick = () => {
    if (dummyLogin) {
      dummyLogin();
      toast({ title: "Dummy Login Successful", description: "Welcome, Dummy User!" });
      router.push("/dashboard");
    } else {
      // This case should ideally not happen if the button is only rendered when dummyLogin is available
      toast({ title: "Error", description: "Dummy login is not available.", variant: "destructive" });
    }
  };

  // Redirect if user is already logged in (e.g. after dummy login)
  // AppLayout also handles redirection, but this can make UX smoother on direct navigation to /login
  React.useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
          <FolderKanban className="h-8 w-8" />
          <span className="text-2xl font-bold font-headline">FlowForge</span>
        </Link>
      </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline tracking-tight">Welcome Back!</CardTitle>
          <CardDescription>Log in to continue to FlowForge.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          {dummyLogin && ( // Only render the Dummy Login button if dummyLogin function is provided
            <Button
              variant="outline"
              type="button"
              className="w-full mt-4"
              onClick={handleDummyLoginClick}
            >
              Dummy Login (Dev)
            </Button>
          )}
        </CardContent>
      </Card>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        FlowForge &copy; {new Date().getFullYear()}
      </p>
    </div>
  );
}
