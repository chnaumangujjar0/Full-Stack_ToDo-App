import React from 'react';
import { useFormik } from 'formik';
import * as Yup from "yup";
import { Link } from 'react-router';
export default function Login() {

  const validationSchema = Yup.object({
      username: Yup.string().trim().required("Username or email is required"),
      password: Yup.string().trim().required("password is required"),
    });
  const formik = useFormik({
    initialValues: {username: "", email:"",password:""},
    validationSchema,
    onSubmit: async function handleSubmit(values,{resetForm}) {
      try {
        
      } catch (error) {
        
      }
    }
  })
  return (
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
          <form className="space-y-6">
            {/* Email or Username */}
            <div>
              <label htmlFor="emailOrUsername" className="block text-xs font-semibold tracking-wider text-gray-400 uppercase mb-1">
                Email or Username
              </label>
              <input
                id="emailOrUsername"
                name="emailOrUsername"
                type="text"
                required
                placeholder="john@example.com"
                className="appearance-none block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#045D4B] focus:border-[#045D4B] sm:text-sm transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold tracking-wider text-gray-400 uppercase mb-1">
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

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#045D4B] focus:ring-[#045D4B] border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 cursor-pointer">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="/forgot-password" className="font-medium text-[#045D4B] hover:underline">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#045D4B] hover:bg-[#034d3e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#045D4B] transition-colors"
              >
                Log In
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-[#045D4B] hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}