import { SignupForm } from "@/components/auth/signup-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
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
          <CardTitle className="text-3xl font-headline tracking-tight">Create Account</CardTitle>
          <CardDescription>Join FlowForge and start planning your success.</CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm />
        </CardContent>
      </Card>
       <p className="mt-8 text-center text-sm text-muted-foreground">
        FlowForge &copy; {new Date().getFullYear()}
      </p>
    </div>
  );
}
