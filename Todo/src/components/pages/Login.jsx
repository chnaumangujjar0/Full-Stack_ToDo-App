import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router";
import { auth0Login, loginUser } from "../../Api/api"; // Keep your existing manual API call
import { toast, ToastContainer } from "react-toastify";
import AuthContext, { useAuth } from "../../context/AuthContext";

import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  
  const { loginWithPopup, getIdTokenClaims } = useAuth0();
  const [isAuth0Loading, setIsAuth0Loading] = useState(false);

  const validationSchema = Yup.object({
    emailOrUsername: Yup.string().trim().required("Username or email is required"),
    password: Yup.string().trim().required("Password is required"),
  });
  
  const formik = useFormik({
    initialValues: { emailOrUsername: "", password: "" },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const res = await loginUser(values);
        
        localStorage.setItem("accessToken", res.accessToken);
        localStorage.setItem("refreshToken", res.refreshToken);
        setUser(res.user);

        toast.success('Welcome back!');
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } catch (error) {
        if (error.status == 400) toast.error("Invalid username or email!");
        if (error.status == 401) toast.error("Invalid password");
      } 
    },
  });

  const handleAuth0Login = async () => {
    setIsAuth0Loading(true);
    try {
      await loginWithPopup({
        authorizationParams: {
          connection: "google-oauth2"
        }
      });

      const claims = await getIdTokenClaims();
      if (!claims) throw new Error("Could not retrieve Auth0 token");
      
      const auth0Token = claims.__raw;
      const res = await auth0Login(auth0Token)

      const userData = res.user;

      localStorage.setItem("accessToken", res.accessToken);
      localStorage.setItem("refreshToken", res.refreshToken);
      setUser(userData);
      
      toast.success('Social Login Successful!');

      if (userData.isProfileComplete === false) {
        navigate("/complete-profile");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Social login failed");
    } finally {
      setIsAuth0Loading(false);
    }
  };
  
  return (
    <>
      <ToastContainer position="top-right" />
      <div className="min-h-screen bg-[#F4F5F7] flex flex-col justify-center align-middle py-12 px-2 sm:px-6 lg:px-8 font-sans text-gray-800">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-semibold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Log in to access your tasks
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-sm sm:rounded-lg sm:px-10 border border-gray-100">
            
            {/* MANUAL LOGIN FORM */}
            <form className="space-y-6" onSubmit={formik.handleSubmit}>
              <div>
                <label htmlFor="emailOrUsername" className="block text-xs font-semibold tracking-wider text-gray-400 uppercase mb-1">
                  Email or Username
                </label>
                <input
                  id="emailOrUsername"
                  name="emailOrUsername"
                  type="text"
                  placeholder="Enter Email or Username"
                  value={formik.values.emailOrUsername} // ✅ Fixed typo here
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="appearance-none block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#045D4B] focus:border-[#045D4B] sm:text-sm transition-colors"
                />
                {formik.touched.emailOrUsername && formik.errors.emailOrUsername && (
                  <p className="text-red-600 text-xs mt-1">{formik.errors.emailOrUsername}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold tracking-wider text-gray-400 uppercase mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formik.values.password} // ✅ Fixed typo here
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="appearance-none block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#045D4B] focus:border-[#045D4B] sm:text-sm transition-colors"
                />
                {formik.touched.password && formik.errors.password && (
                  <p className="text-red-600 text-xs mt-1">{formik.errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-end">
                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-[#045D4B] hover:underline">
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={formik.isSubmitting || isAuth0Loading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#045D4B] hover:bg-[#034d3e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#045D4B] transition-colors disabled:opacity-70"
                >
                  {formik.isSubmitting ? 'Logging in...' : 'Log In'}
                </button>
              </div>
            </form>

            {/* 👉 4. SOCIAL LOGIN SECTION */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleAuth0Login}
                  disabled={isAuth0Loading || formik.isSubmitting}
                  type="button"
                  className="w-full flex justify-center items-center gap-3 py-2.5 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#045D4B] transition-colors disabled:opacity-70"
                >
                  {isAuth0Loading ? (
                    "Connecting to Auth0..."
                  ) : (
                    <>
                      {/* Simple Google SVG Icon */}
                      <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                        <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                          <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                          <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                          <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                          <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                        </g>
                      </svg>
                      Sign in with
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link to="/signup" className="font-medium text-[#045D4B] hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}