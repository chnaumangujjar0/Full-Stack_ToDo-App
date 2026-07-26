import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { changeForgotPasword, requestForgotPasswordOtp, verifyForgotPasswordOtp } from "../../Api/api";
// import { forgotPasswordRequest, forgotPasswordVerify } from "../../Api/api"; // Update with your actual API imports

export default function ForgotPassword() {
  const navigate = useNavigate();

  // UI Steps: 1 = Email Input, 2 = OTP & New Password Input
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form Data States
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  // --- API Handlers ---

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await requestForgotPasswordOtp(email)

      toast.success("OTP sent to your email!");
      setStep(2); // Move to OTP verification step
    } catch (error) {
      console.log(error.message);
      if(error.status == 401){
        toast.error("User with this email does not exist!")
      }
      toast.error(
        error?.response?.data?.message || "Failed to send OTP. Try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await verifyForgotPasswordOtp(otp,email)
      toast.success("OTP is verified!");

      setStep(3)
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
          "Invalid otp. Check OTP.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewPassword = async () => {
    if(!newPassword.trim()){
      toast.error("New Password is required!")
      return
    }
    setIsLoading(true)
    try {
      await changeForgotPasword(newPassword,email)

      toast.success("Password changed successsfully.Redirecting...")
      
      setTimeout(()=>{
        navigate("/login")
      },1000)
      setEmail("")
      setStep(1)
      setOtp("")
      setNewPassword("")
    } catch (error) {
      toast.error("something went wrong in changing password")
    }
    setIsLoading(false)
  }
  return (
    <>
      <ToastContainer position="top-right" />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans ">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">
              {step === 1 ? "Forgot Password" :` ${step === 2 ? "Verify OTP" : "Reset Password"}`}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {step === 1
                ? "Enter your email address and we'll send you a 6-digit verification code."
                : `${step === 2 ? `Enter the code sent to ${email}` : "Enter New Password"}`}
            </p>
          </div>

          {/* STEP 1: Email Form */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#045D4B] focus:border-[#045D4B] sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#045D4B] hover:bg-[#034d3e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#045D4B] transition-colors disabled:opacity-70"
                >
                  {isLoading ? "Sending..." : "Send Reset Code"}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: OTP & New Password Form */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {/* OTP Input */}
              <div>
                <label
                  htmlFor="otp"
                  className="block text-xs font-semibold tracking-wider text-[#045D4B] uppercase mb-2 text-center"
                >
                  6-Digit Code
                </label>
                <input
                  type="text"
                  id="otp"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="block w-full px-4 py-3 text-center text-3xl tracking-[0.5em] font-mono border border-gray-300 rounded-lg shadow-inner text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#045D4B] focus:border-[#045D4B]"
                  placeholder="000000"
                  autoComplete="off"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading || otp.length < 6 }
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#045D4B] hover:bg-[#034d3e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#045D4B] transition-colors disabled:opacity-70"
                >
                  {isLoading ? "Verifying..." : "Verify"}
                </button>
              </div>
            </form>
          )}
            {
              step === 3 && (
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#045D4B] focus:border-[#045D4B] sm:text-sm pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#045D4B]"
                  >
                    {showNewPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                <button
                  onClick={handleNewPassword}
                  disabled={isLoading}
                  className="w-full mt-8 flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#045D4B] hover:bg-[#034d3e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#045D4B] transition-colors disabled:opacity-70"
                >
                  {isLoading ? "Saving..." : "Save"}
                </button>
              </div>) 
            }
          {/* Footer Link */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-[#045D4B] hover:text-[#034d3e] transition-colors"
            >
              &larr; Back to Login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
