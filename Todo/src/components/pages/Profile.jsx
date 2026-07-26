import React, { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { requestPasswordReset, updateDetails, verifyPasswordReset } from "../../Api/api";
import { toast, ToastContainer } from "react-toastify";
export default function Profile() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [otp,setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar);
  const [coverPreview, setCoverPreview] = useState(user?.coverImage);
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false)
  const [isLoading,setIsLoading] = useState(false)
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const defaultAvatar =
    "https://images.unsplash.com/photo-1740252117044-2af197eea287?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
  const defaultCover =
    "https://media.licdn.com/dms/image/v2/D4D16AQFBP2Mwojtgaw/profile-displaybackgroundimage-shrink_200_800/B4DZ59I2rXKUAQ-/0/1780215933902?e=1785974400&v=beta&t=CJvlvBJOx1Az4iFHGgzsV5TlQF3tQ4xYZ5_cZWNMl1w";

  const handleAvatarChange = (e) => {
    console.log(e.target.files[0])
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file); 
      setAvatarPreview(URL.createObjectURL(file)); // Show instant preview
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file); // Save file for the API call
      setCoverPreview(URL.createObjectURL(file)); // Show instant preview
    }
  };
  const handleUpdateProfile = async () => {
    if (!fullName.trim()) {
      toast.error("Full Name is equired");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      toast.error("Valid Email is required!");
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      formData.append("fullName", fullName);
      formData.append("email", email);

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }
      if (coverFile) {
        formData.append("coverImage", coverFile);
      }
      
      await updateDetails(formData);

      setTimeout(() => {
        setIsSubmitting(false);
        toast.success("Profile updated successfully!");
      }, 1000);
    } catch (error) {
      console.log(error);
      toast.error("Unknown error occured! Try Again");
      setIsSubmitting(false);
    }
  };
  const handleChangePassword = async () => {
    if (!newPassword) {
      toast.error("New Password is required!");
      return;
    }
    setIsUpdating(true);
    
    try {
      await requestPasswordReset();
      
      setIsOtpModalOpen(true)
      setIsUpdating(false);
    } catch (error) {
      console.log(error.message);
      toast.error("some thing went wrong in generating otp");
      setIsUpdating(false);
    }
  };

  const handleVerifyOtp = async () => {
    if(otp.trim() == ""){
      toast.error("Enter OTP!")
      return
    }
    setIsVerifying(true)
    try {
      console.log(newPassword)
      await verifyPasswordReset(newPassword,otp)
      setIsVerifying(false)
      setIsOtpModalOpen(false)
      setOtp("")

      toast.success("Password updated successfully!")
      
    } catch (error) {
      console.log(error.message)
      toast.error("something went wrong!")
      setIsVerifying(false)
    }
  }
  return (
    <>
      <ToastContainer position="top-right" />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans text-gray-800 dark:bg-gray-700 dark:border-gray-700 dark:text-white">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
            Profile Settings
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden dark:bg-gray-700 dark:border-gray-800">
          <div className="relative h-48 sm:h-56 bg-gray-200">
            <img
              src={coverPreview || defaultCover}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <input
              type="file"
              accept="image/*"
              hidden
              ref={coverInputRef}
              onChange={handleCoverChange}
            />
            <button 
              onClick={() => coverInputRef.current.click()}
              className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-700 px-2 py-1.5 rounded-full text-xs font-semibold shadow-sm border border-gray-200 hover:bg-white transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </button>
          </div>

          <div className="relative px-6 sm:px-10 pb-8">
            <div className="sm:flex sm:items-end sm:space-x-5">
              <div 
                onClick={() => avatarInputRef.current.click()}
                className="relative -mt-16 sm:-mt-20 w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white overflow-hidden bg-white shadow-md">
                <img
                  src={avatarPreview || defaultAvatar}
                  alt="Avatar"
                  className="w-full h-full object-cover hover:bg-black/40 hover:opacity-100 transition-opacity cursor-pointer"
                />
                <input 
                  type="file" 
                  accept="image/*" 
                  hidden 
                  ref={avatarInputRef} 
                  onChange={handleAvatarChange} 
                />
              </div>

              <div className="mt-6 sm:mt-0 sm:flex-1 sm:pb-2">
                <h2 className="text-2xl font-bold text-gray-900 truncate">
                  {user?.fullName || "Loading..."}
                </h2>
                <p className="text-sm text-gray-500 font-medium dark:text-white">
                  @{user?.username || "username"}
                </p>
              </div>
            </div>

            <hr className="my-8 border-gray-100" />

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-8 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-xs font-semibold tracking-wider text-gray-400 uppercase mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#045D4B] focus:border-[#045D4B] sm:text-sm transition-colors dark:focus:ring-black dark:focus:border-black"
                  />
                </div>

                <div>
                  <label
                    htmlFor="username"
                    className="block text-xs font-semibold tracking-wider text-gray-400 uppercase mb-1"
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    defaultValue={user?.username || ""}
                    className="appearance-none block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#045D4B] focus:border-[#045D4B] sm:text-sm transition-colors bg-gray-50 text-gray-500 cursor-not-allowed "
                    disabled
                    title="Username cannot be changed"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold tracking-wider text-gray-400 uppercase mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#045D4B] focus:border-[#045D4B] sm:text-sm transition-colors dark:focus:ring-black dark:focus:border-black"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleUpdateProfile}
                  disabled={isSubmitting}
                  className="inline-flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#045D4B] hover:bg-[#034d3e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#045D4B] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>

              <hr className="my-8 border-gray-100" />

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Change Password
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-y-6 gap-x-8 sm:grid-cols-2">
                  

                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-xs font-semibold tracking-wider text-gray-400 uppercase mb-1"
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="appearance-none block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#045D4B] focus:border-[#045D4B] sm:text-sm transition-colors pr-10 dark:focus:ring-black dark:focus:border-black"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#045D4B] transition-colors"
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
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleChangePassword}
                    disabled={isUpdating}
                    className="inline-flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#045D4B] hover:bg-[#034d3e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {isOtpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden">
            <div className="p-6 sm:p-8">
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h3>
                <p className="text-sm text-gray-500">
                  We've sent a 6-digit verification code to your email. Enter it below to update your password.
                </p>
              </div>

              <div className="mb-2">
                <label
                  htmlFor="otp"
                  className="block text-xs font-semibold tracking-wider text-[#045D4B] uppercase mb-3 text-center"
                >
                  Enter 6-Digit Code
                </label>
                <input
                  type="text"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                  className="block w-full px-4 py-4 text-center text-3xl tracking-[0.5em] font-mono border border-gray-300 rounded-lg shadow-inner text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#045D4B] focus:border-[#045D4B] transition-all"
                  placeholder="000000"
                  autoComplete="off"
                />
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-100">
              <button
                onClick={() => {
                  setIsOtpModalOpen(false);
                  setOtp(""); 
                }}
                disabled={isVerifying}
                className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              
              <button
                onClick={handleVerifyOtp}
                disabled={otp.length !== 6 || isVerifying}
                className="inline-flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#045D4B] hover:bg-[#034d3e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#045D4B] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isVerifying ? "Verifying..." : "Verify & Save"}
              </button>
            </div>
          </div>

        </div>
      )}
    </>
  );
}
