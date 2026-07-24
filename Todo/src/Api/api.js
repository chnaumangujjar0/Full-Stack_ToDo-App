import axios from "axios"
const API_URL = import.meta.env.VITE_API_URL;
import api from "./axiosInstance.js"
import { useAuth } from "../context/AuthContext.jsx";
// todo apis

 export const postTask = async (title,description,status = "pending") => {
    await api.post(
        `todo/addTask`,
        {
          title: title.trim(),
          description: description.trim(),
          status,
        },
      );
}
export const getSingleTaskData = async (id) => {
    const taskData = await api.get(`todo/${id}`)
    
    return taskData.data.data
}

export const updateTaskDetails = async (id,title,description) => {
    api.patch(`todo/${id}`, {
        title: title.trim(),
        description: description.trim()
      })
}

export const deleteTaskById = async (id) => {
    await api.delete(`todo/${id}`)
}

export const getAllTasks = async (page = 1, limit = 5, filter = "all", status = "all") => {
    try {
    const res = await api.get(`todo?page=${page}&limit=${limit}&filter=${filter}&status=${status}`);
    return res.data.data
  } catch (err) {
    console.log(err);
  }
}

export const updateStatus = async (id, status) => {
    await api.patch(`todo/toggle-status/${id}`, {
      status,
    });
  }

export const totalData = async () => {
  try {
    const res = await api.get(`todo/count`)
    
    return res.data.data
  } catch (error) {
    console.log(error);
  }
}

// user apis

export const registerUser = async (values) => {
  console.log(values)
  const res = await axios.post(`${API_URL}user/register`, {
    fullName: values.fullName.trim(),
    username: values.username.trim(),
    email: values.email.trim(),
    password: values.password.trim()
  })

  return res

}

export const loginUser = async (values) => {
  
  const res = await axios.post(`${API_URL}user/login`,{
    identifier: values.emailOrUsername.trim(),
    password: values.password.trim()
  })

  return res.data.data;
}

export const logoutUser = async () => {
  const {setUser} = useAuth()
  await api.post("user/logout")
  
}

export const updateDetails = async (formData) => {
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
}
  const response = await api.patch('/user/update-details', formData);
  return response.data;
}

export const requestPasswordReset = async() => {
  const res = await api.post('/user/request-reset-password')
}

export const verifyPasswordReset = async (newPassword,otp) => {
  console.log(otp)
  const res = await api.patch("user/verify-reset-password",{
    newPassword: newPassword,
    otp
  })
  return res.data
}

export const requestForgotPasswordOtp = async (email) => {
  const res = await api.post('user/request-forgot-password-otp',{email: email.trim()})
  return res.data
}

export const verifyForgotPasswordOtp = async (otp,email) => {
  const res = await api.post('user/verify-forgot-password-otp',{otp: otp,email: email.trim()})
  return res.data
}

export const changeForgotPasword = async (newPassword,email) => {
  const res = await api.patch("user/change-forgot-password",{newPassword: newPassword.trim(),email: email.trim()})
  return res.data
}