import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import { authService } from "@/services/auth-service";
import type { LoginPayload } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
  const [form, setForm] = useState<LoginPayload>({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.email || !form.password) {
      toast({ title: "Missing information", description: "Enter your email and password.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await authService.login(form);
      toast({ title: "Welcome back", description: "You are now signed in." });
      navigate("/admin");
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Unable to signin right now.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md border-slate-200 shadow-lg">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl font-semibold text-slate-900">Sign in to WequiGuard</CardTitle>
            <CardDescription>Monitor your network and manage policies securely.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full rounded-lg" disabled={submitting}>
                {submitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-500">
              Need an account?{" "}
              <Link to="/setup" className="font-semibold text-primary hover:underline">
                View setup guide
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
