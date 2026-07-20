import React, {  useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router";
import { loginUser } from "../../Api/api";
import { toast, ToastContainer } from "react-toastify";
import AuthContext, { useAuth } from "../../context/AuthContext";
export default function Login() {
  const navigate = useNavigate()
  const {setUser} = useAuth()
  const validationSchema = Yup.object({
    emailOrUsername: Yup.string().trim().required("Username or email is required"),
    password: Yup.string().trim().required("password is required"),
  });
  const formik = useFormik({
    initialValues: { emailOrUsername: "", password: "" },
    validationSchema,
    onSubmit: async  (values) =>  {
      
        try {
          const res = await loginUser(values)
          
          localStorage.setItem("accessToken", res.accessToken);
          localStorage.setItem("refreshToken", res.refreshToken);

          setUser(res.user)

          toast.success('Welcome back!')
          setTimeout(()=>{
            navigate("/")
          },1000)
        } catch (error) {
          console.log(error.message)
          const errorMessage = error?.message || "Invalid credentials. Please try again."
          toast.error(errorMessage);
        } 
    },
  });
  return (
    <>
      <ToastContainer position="top-right" />
      <div className="min-h-screen bg-[#F4F5F7] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-gray-800">
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
            <form className="space-y-6" onSubmit={formik.handleSubmit}>
              {/* Email or Username */}
              <div>
                <label
                  htmlFor="emailOrUsername"
                  className="block text-xs font-semibold tracking-wider text-gray-400 uppercase mb-1"
                >
                  Email or Username
                </label>
                <input
                  id="emailOrUsername"
                  name="emailOrUsername"
                  type="text"
                  placeholder="Enter Email or Username"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="appearance-none block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#045D4B] focus:border-[#045D4B] sm:text-sm transition-colors"
                />
                {formik.touched.emailOrUsername &&
                  formik.errors.emailOrUsername && (
                    <p className="text-red-600 text-xs mt-1">
                      {formik.errors.emailOrUsername}
                    </p>
                  )}
              </div>

              {/* Password */}
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
                  <p className="text-red-600 text-xs mt-1">
                    {formik.errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-[#045D4B] focus:ring-[#045D4B] border-gray-300 rounded cursor-pointer"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-900 cursor-pointer"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a
                    href="/forgot-password"
                    className="font-medium text-[#045D4B] hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={formik.isSubmitting}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#045D4B] hover:bg-[#034d3e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#045D4B] transition-colors"
                >
                  {formik.isSubmitting ? 'Logging in...' : 'Log In'}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-medium text-[#045D4B] hover:underline"
                >
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
