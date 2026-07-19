import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useFormik } from "formik";
import * as Yup from "yup";
import Loader from "../common/Loader";
import { registerUser } from "../../Api/api";
import { toast, ToastContainer } from "react-toastify";
export default function SignUp() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate()
  const validationSchema = Yup.object({
    fullName: Yup.string().trim().required("Full Name is required"),
    email: Yup.string()
      .trim()
      .email("Invalid email address")
      .required("Email is required"),
    username: Yup.string().trim().required("username is required").matches(
          /^[a-z0-9]+$/,
          'Username can only contain lowercase letters and numbers (no spaces or special characters)'
        ),
    password: Yup.string()
      .min(8, "Password must be 8 character long!")
      .required("Password is required"),
  });
  const formik = useFormik({
    initialValues: { fullName: "", username: "", email: "", password: "" },
    validationSchema,
    onSubmit: async function handleSubmit(values, { resetForm }) {
      setIsLoading(true)
      try {
        console.log(values)
        await registerUser(values)
        toast.success("Account Created Successfully!")
      } catch (error) {
        console.log(error)
        toast.error(" Account does not created, Try Again" )
      }finally{
        setIsLoading(false)
        setTimeout(()=>{
          navigate("/login")
        },2000)
      }
      
    }
  });

  return (
    <>
    <Loader isLoading={isLoading}/>
    <ToastContainer position="top-right" />
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
            <form className="space-y-5" onSubmit={formik.handleSubmit}>
              {/* fullName */}
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
                  placeholder="John Doe"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="appearance-none block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#045D4B] focus:border-[#045D4B] sm:text-sm transition-colors"
                />
                {formik.touched.fullName && formik.errors.fullName && (
                  <p className="text-red-600 text-xs mt-1">{formik.errors.fullName}</p>
                )}
              </div>
              {/* //username */}
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
                  placeholder="johndoe123"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="appearance-none block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#045D4B] focus:border-[#045D4B] sm:text-sm transition-colors"
                />
                {formik.touched.username && formik.errors.username && (
                  <p className="text-red-600 text-xs mt-1">{formik.errors.username}</p>
                )}
              </div>
              {/* // Email */}
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
                  placeholder="john@example.com"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="appearance-none block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#045D4B] focus:border-[#045D4B] sm:text-sm transition-colors"
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="text-red-600 text-xs mt-1">{formik.errors.email}</p>
                )}
              </div>
              {/* //Password */}
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
                  placeholder="••••••••"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="appearance-none block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#045D4B] focus:border-[#045D4B] sm:text-sm transition-colors"
                />
                {formik.touched.password && formik.errors.password && (
                  <p className="text-red-600 text-xs mt-1">{formik.errors.password}</p>
                )}
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
