"use client";

import { useSignIn, useSignUp } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mail, KeyRound, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const { signIn, setActive: setSignInActive } = useSignIn();
  const { signUp, setActive: setSignUpActive } = useSignUp();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [isNewUser, setIsNewUser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Try sign-up first (for new users)
      await signUp?.create({ emailAddress: email });
      await signUp?.prepareEmailAddressVerification({ strategy: "email_code" });
      setIsNewUser(true);
      setStep("code");
    } catch (signUpErr: unknown) {
      // If email already exists, try sign-in
      const err = signUpErr as { errors?: Array<{ code: string }> };
      if (err?.errors?.[0]?.code === "form_identifier_exists") {
        try {
          const signInAttempt = await signIn?.create({ identifier: email });
          const emailCodeFactor = signInAttempt?.supportedFirstFactors?.find(
            (f) => f.strategy === "email_code"
          );

          if (emailCodeFactor && "emailAddressId" in emailCodeFactor) {
            await signInAttempt?.prepareFirstFactor({
              strategy: "email_code",
              emailAddressId: emailCodeFactor.emailAddressId,
            });
          }

          setIsNewUser(false);
          setStep("code");
        } catch (signInErr) {
          console.error("Sign in error:", signInErr);
          setError("Failed to send verification code. Please try again.");
        }
      } else {
        console.error("Sign up error:", signUpErr);
        setError("Failed to send verification code. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isNewUser) {
        const result = await signUp?.attemptEmailAddressVerification({ code });
        if (result?.createdSessionId) {
          await setSignUpActive?.({ session: result.createdSessionId });
          router.push("/admin");
        }
      } else {
        const result = await signIn?.attemptFirstFactor({
          strategy: "email_code",
          code,
        });
        if (result?.createdSessionId) {
          await setSignInActive?.({ session: result.createdSessionId });
          router.push("/admin");
        }
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("Invalid code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep("email");
    setCode("");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-stone-100 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-amber-200/40 to-orange-300/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-amber-100/40 to-yellow-200/30 rounded-full blur-3xl" />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#E07D3B 1px, transparent 1px), linear-gradient(to right, #E07D3B 1px, transparent 1px)`,
            backgroundSize: '64px 64px'
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {/* Back to home link */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="absolute top-6 left-6"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-700 transition-colors text-sm font-medium group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Pivot Pyramid
          </Link>
        </motion.div>

        {/* Login card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Card with doodle border effect */}
          <div className="relative">
            {/* Doodle border SVG */}
            <svg
              className="absolute -inset-3 w-[calc(100%+24px)] h-[calc(100%+24px)] pointer-events-none"
              viewBox="0 0 400 480"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M 30 8
                   Q 35 4, 60 6 L 140 5 Q 180 4, 220 6 L 300 5 Q 340 4, 360 6 L 380 8
                   Q 396 12, 395 35 L 397 120 Q 398 180, 396 240 L 397 320 Q 398 400, 395 440 L 394 460
                   Q 390 476, 360 474 L 280 475 Q 220 476, 160 474 L 80 475 Q 40 476, 20 474 L 8 470
                   Q 4 466, 5 440 L 4 360 Q 3 280, 5 200 L 4 120 Q 3 60, 5 30 L 6 12
                   Q 10 4, 30 8 Z"
                stroke="#E07D3B"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity="0.6"
              />
            </svg>

            {/* Card content */}
            <div className="bg-white rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-200/80 overflow-hidden">
              {/* Header with gradient */}
              <div className="relative px-8 pt-10 pb-6 text-center bg-gradient-to-b from-amber-50/80 to-white">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <Link href="/" className="inline-block mb-4">
                    <Image
                      src="/pivot-pyramid-logo.png"
                      alt="Pivot Pyramid"
                      width={200}
                      height={50}
                      className="h-10 w-auto mx-auto"
                      priority
                    />
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 text-xs font-medium tracking-wide uppercase">
                    <KeyRound className="w-3 h-3" />
                    Admin Access
                  </span>
                </motion.div>
              </div>

              {/* Form section */}
              <div className="px-8 pb-8">
                {/* Error Message */}
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      className="mb-6"
                    >
                      <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-red-700 text-sm">{error}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  {step === "email" ? (
                    <motion.form
                      key="email-form"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      onSubmit={handleSendCode}
                      className="space-y-5"
                    >
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-semibold text-stone-700 mb-2"
                        >
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                          <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl
                                     focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary
                                     outline-none transition-all text-stone-800 placeholder:text-stone-400"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading || !email}
                        className="w-full relative overflow-hidden bg-primary hover:bg-primary-hover
                                 disabled:bg-stone-200 disabled:text-stone-400
                                 text-white font-semibold py-3.5 px-6 rounded-xl
                                 transition-all duration-200 shadow-lg shadow-primary/20
                                 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5
                                 disabled:shadow-none disabled:translate-y-0"
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Sending...
                          </span>
                        ) : (
                          "Send Verification Code"
                        )}
                      </button>

                      <p className="text-center text-xs text-stone-500 pt-2">
                        We&apos;ll send you a one-time code to verify your identity
                      </p>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="code-form"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      onSubmit={handleVerifyCode}
                      className="space-y-5"
                    >
                      <div className="text-center mb-6">
                        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                          <Mail className="w-6 h-6 text-primary" />
                        </div>
                        <p className="text-stone-600 text-sm">
                          We sent a verification code to
                        </p>
                        <p className="font-semibold text-stone-800 mt-1">{email}</p>
                      </div>

                      <div>
                        <label
                          htmlFor="code"
                          className="block text-sm font-semibold text-stone-700 mb-2 text-center"
                        >
                          Enter Code
                        </label>
                        <input
                          id="code"
                          type="text"
                          value={code}
                          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          placeholder="••••••"
                          required
                          autoFocus
                          className="w-full py-4 px-4 bg-stone-50 border border-stone-200 rounded-xl
                                   focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary
                                   outline-none transition-all text-center text-3xl tracking-[0.5em]
                                   font-mono text-stone-800 placeholder:text-stone-300 placeholder:tracking-[0.3em]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading || code.length < 6}
                        className="w-full relative overflow-hidden bg-primary hover:bg-primary-hover
                                 disabled:bg-stone-200 disabled:text-stone-400
                                 text-white font-semibold py-3.5 px-6 rounded-xl
                                 transition-all duration-200 shadow-lg shadow-primary/20
                                 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5
                                 disabled:shadow-none disabled:translate-y-0"
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Verifying...
                          </span>
                        ) : (
                          "Verify & Continue"
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleBack}
                        className="w-full text-stone-500 hover:text-stone-700 font-medium py-2 transition-colors text-sm"
                      >
                        Use a different email
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-xs text-stone-400 text-center"
        >
          Secure passwordless authentication
        </motion.p>
      </div>
    </div>
  );
}
