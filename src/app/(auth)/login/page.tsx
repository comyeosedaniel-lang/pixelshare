import { LoginButtons } from "@/components/auth/login-buttons";
import { APP_NAME } from "@/lib/utils/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div>
          <h1 className="text-2xl font-bold">{APP_NAME}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to upload and share AI images
          </p>
        </div>
        <LoginButtons />
        <p className="text-xs text-muted-foreground">
          By signing in, you agree to our{" "}
          <a href="/legal/terms" className="underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/legal/privacy" className="underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
