import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router";
import { toast, ToastContainer } from "react-toastify";
import { completeUserProfile } from "../../Api/api";
import { useAuth } from "../../context/AuthContext";

export default function CompleteProfile() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  // 👉 Security Check: If they are already complete, boot them to the dashboard
  useEffect(() => {
    if (user?.isProfileComplete) {
      navigate("/");
    }
  }, [user, navigate]);

  const validationSchema = Yup.object({
    username: Yup.string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .matches(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores allowed")
      .required("Username is required"),
  });

  const formik = useFormik({
    initialValues: { username: "" },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const updatedUser = await completeUserProfile(values.username);
        
        // Update the global state with the new username and the isProfileComplete = true flag
        setUser(updatedUser);
        
        toast.success("Profile complete! Redirecting...");
        setTimeout(() => {
          navigate("/"); // Unlock the app!
        }, 1500);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to set username");
      }
    },
  });

  return (
    <>
      <ToastContainer position="top-right" />
      <div className="min-h-screen bg-[#F4F5F7] flex flex-col justify-center align-middle py-12 px-2 sm:px-6 lg:px-8 font-sans text-gray-800">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-semibold text-gray-900">
            One Last Step
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Choose a unique username for your account
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-sm sm:rounded-lg sm:px-10 border border-gray-100">
            <form className="space-y-6" onSubmit={formik.handleSubmit}>
              <div>
                <label htmlFor="username" className="block text-xs font-semibold tracking-wider text-gray-400 uppercase mb-1">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 text-sm">
                    @
                  </span>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="john_doe"
                    value={formik.values.username}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="appearance-none block w-full pl-8 pr-3 py-2 border border-gray-200 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#045D4B] focus:border-[#045D4B] sm:text-sm transition-colors"
                  />
                </div>
                {formik.touched.username && formik.errors.username && (
                  <p className="text-red-600 text-xs mt-1">{formik.errors.username}</p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={formik.isSubmitting}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#045D4B] hover:bg-[#034d3e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#045D4B] transition-colors disabled:opacity-70"
                >
                  {formik.isSubmitting ? 'Saving...' : 'Complete Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}