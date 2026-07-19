import React, { useState } from "react";
import { Link } from "react-router";
import { useFormik } from "formik";
import * as Yup from "yup";
import Loader from "../common/Loader";
import { registerUser } from "../../Api/api";
import { toast, ToastContainer } from "react-toastify";
export default function SignUp() {
  const [isLoading, setIsLoading] = useState(false);
  const ValidationSchema = Yup.object({
    fullName: Yup.string().trim().required("Full Name is required"),
    username: Yup.string()
      .trim()
      .email("Invalid email address")
      .required("Email is required"),
    username: Yup.string().trim().required("username is required"),
    password: Yup.string()
      .max(8, "Password must be 8 character long!")
      .required("Password is required"),
  });
  const formik = useFormik({
    initialValues: { fullName: "", username: "", email: "", password: "" },
    validationSchema,
    onSubmit: async function handleSubmit(values, { resetForm }) {
      setIsLoading(true)
      try {
        await registerUser(values.fullName,values.username,values,values.email,values.password)
      } catch (error) {
        toast.error(error)
      }
      
    }
  });

  return (
    <>
    <Loader isLoading={isLoading}/>
      <div className="min-h-screen bg-[#F4F5F7] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-gray-800">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-semibold text-gray-900">
            Create an Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join to start managing your tasks
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-sm sm:rounded-lg sm:px-10 border border-gray-100">
            <form className="space-y-5">
              // Full Name
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-xs font-semibold tracking-wider text-gray-400 uppercase mb-1"
                >
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  placeholder="John Doe"
                  className="appearance-none block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#045D4B] focus:border-[#045D4B] sm:text-sm transition-colors"
                />
              </div>
              //username
              <div>
                <label
                  htmlFor="username"
                  className="block text-xs font-semibold tracking-wider text-gray-400 uppercase mb-1"
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="johndoe123"
                  className="appearance-none block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#045D4B] focus:border-[#045D4B] sm:text-sm transition-colors"
                />
              </div>
              // Email
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold tracking-wider text-gray-400 uppercase mb-1"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="john@example.com"
                  className="appearance-none block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#045D4B] focus:border-[#045D4B] sm:text-sm transition-colors"
                />
              </div>
              //Password
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold tracking-wider text-gray-400 uppercase mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="appearance-none block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#045D4B] focus:border-[#045D4B] sm:text-sm transition-colors"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#045D4B] hover:bg-[#034d3e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#045D4B] transition-colors"
                >
                  Sign Up
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-[#045D4B] hover:underline"
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
