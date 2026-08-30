import axios from "axios"
const API_URL = import.meta.env.VITE_API_URL;
import api from "./axiosInstance.js"
import { useAuth } from "../context/AuthContext.jsx";
// todo apis

 export const postTask = async (title,description,status = "pending",deadline,workspaceId,assignedTo) => {
  console.log(workspaceId)
    await api.post(
        `todo/addTask`,
        {
          title: title.trim(),
          description: description.trim(),
          status,
          deadline,
          workspaceId,
          assignedTo
        },
      );
}
export const getSingleTaskData = async (id) => {
    const taskData = await api.get(`todo/${id}`)
    
    return taskData.data.data
}

export const updateTaskDetails = async (id,title,description,deadline) => {
    api.patch(`todo/${id}`, {
        title: title.trim(),
        description: description.trim(),
        deadline
      })
}

export const deleteTaskById = async (id) => {
    await api.delete(`todo/${id}`)
}

export const getAllTasks = async (page = 1, limit = 5, filter = "all", status = "all",workspaceId = "none") => {
    try {
    const res = await api.get(`todo?page=${page}&limit=${limit}&filter=${filter}&status=${status}&workspaceId=${workspaceId}`);
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

export const fetchWorkspaceTasks = async (workspaceId) => {
  const res = await api.get(`todo/workspace-tasks/${workspaceId}`)
  return res.data.data
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

export const auth0Login =  async(token) => {
  const res = await api.post("user/auth0-login",{
    token: token
  })

  return res.data.data
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

export const completeUserProfile = async (username) => {
  
    const response = await api.post("user/complete-profile", { username });
    return response.data.data; // Returns the updated user object
};

export const requestPasswordReset = async() => {
  const res = await api.post('user/request-reset-password')
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
// notification apis

export const getAllNotifications = async () => {
  const res = await api.get("notification/")
  return res.data.data
}

export const readNotification = async (notificationId) => {
  const res = await api.patch(`notification/${notificationId}/read`, {
    notificationId
  })

  return res.data
}

// login activity api

export const getLoginActivity = async (page,limit) => {
  const res = await api.get(`activity/login-history?page=${page}&limit=${limit}`)
  return res.data.data
}

// workspace apis 
export const createWorkspace = async (workspace) => {
  const res = await api.post("workspace/create",{
    name : workspace.trim()
  })

  return res.data
}

export const getAllWorkspaces = async () => {
  const res = await api.get("workspace/")
  return res.data.data
}

export const getWorkspaceById = async (workspaceId) => {
  const res = await api.get(`workspace/getWorkspaceById/${workspaceId}`)
  return res.data.data
}

export const deleteWorkspaceById = async (workspaceId) =>{
  const res = await api.delete(`workspace/${workspaceId}/delete`)

  return res.data.data
}

export const updateWorkspace = async (workspaceId, name) => {
  const res = await api.patch(`workspace/${workspaceId}/update`,{name})
  return res.data.data
}

export const removeWorkspaceMember = async(workspaceId,memberId) => {
  const res = await api.post(`workspace/${workspaceId}/manage-member`,{
    memberId :memberId
  })

  return res.data
}

// invite api 
export const sendInvite = async (workspaceId,username) => {
  const res = await api.post(`invite/${workspaceId}/send-invite`,{
    username: username.trim()
  })
  return res.data
}

export const getAllInvites = async () => {
  const res = await api.get("invite/")
  return res.data.data
}

export const respondToInvite = async (action, inviteId) => {
  const res = await api.post(`invite/${inviteId}/response`,{
    action
  })

  return res.data
}