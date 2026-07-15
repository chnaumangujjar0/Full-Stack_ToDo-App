import axios from "axios"
const API_URL = import.meta.env.VITE_API_URL;
 export const postTask = async (title,description) => {
    await axios.post(
        `${API_URL}addTask`,
        {
          title: title.trim(),
          description: description.trim(),
        },
      );
}
export const getSingleTaskData = async (id) => {
    const taskData = await axios.get(`${API_URL}${id}`)
    
    return taskData.data.data
}

export const updateTaskDetails = async (id,title,description) => {
    axios.patch(`${API_URL}${id}`, {
        title: title.trim(),
        description: description.trim()
      })
}

export const deleteTaskById = async (id) => {
    await axios.delete(`${API_URL}${id}`)
}

export const getAllTasks = async (page = 1, limit = 5, filter = "all", status = "completed") => {
    try {
    const res = await axios.get(`${API_URL}?page=${page}&limit=${limit}&filter=${filter}&status=${status}`);
    return res.data.data
  } catch (err) {
    console.log(err);
  }
}

export const  updateStatus = async (id) => {
    await axios.patch(`${API_URL}toggle-status/${id}`);
  }

export const totalData = async () => {
  try {
    const res = await axios.get(`${API_URL}count`)
    
    return res.data.data
  } catch (error) {
    console.log(error);
  }
}