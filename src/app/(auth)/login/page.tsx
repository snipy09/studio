
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderKanban } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { DEMO_AUTH_ENABLED } from "@/contexts/auth-context";

export default function LoginPage() {
  const { demoLogin, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleDemoLoginClick = () => {
    if (DEMO_AUTH_ENABLED && demoLogin) {
      demoLogin();
      toast({ title: "Demo Login Successful", description: "Welcome, Demo User!" });
      router.push("/dashboard");
    } else {
      toast({ title: "Error", description: "Demo login is not available or not enabled.", variant: "destructive" });
    }
  };

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
          <CardTitle className="text-3xl font-headline tracking-tight">Welcome to FlowForge!</CardTitle>
          <CardDescription>Access the demo version instantly.</CardDescription>
        </CardHeader>
        <CardContent>
          {DEMO_AUTH_ENABLED && demoLogin ? (
            <Button
              type="button"
              className="w-full"
              onClick={handleDemoLoginClick}
            >
              Enter Demo
            </Button>
          ) : (
            <p className="text-center text-muted-foreground">
              Login is currently configured for a specific setup.
            </p>
          )}
        </CardContent>
      </Card>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        FlowForge &copy; {new Date().getFullYear()}
      </p>
    </div>
  );
}
