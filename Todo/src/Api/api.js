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
  console.log(formData)
    await api.patch('user/update-details',formData)

}

export const changePassword = async(oldPassword,newPassword) => {
  await api.patch('/user/change-password',{
    oldPassword: oldPassword.trim(),
    newPassword: newPassword.trim()
  })
}