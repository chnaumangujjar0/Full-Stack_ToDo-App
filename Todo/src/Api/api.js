import axios from "axios"
const API_URL = import.meta.env.VITE_API_URL;
 export const postTask = async (title,description,status = "pending") => {
    await axios.post(
        `${API_URL}addTask`,
        {
          title: title.trim(),
          description: description.trim(),
          status,
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

export const getAllTasks = async (page = 1, limit = 5, filter = "all", status = "all") => {
    try {
    const res = await axios.get(`${API_URL}?page=${page}&limit=${limit}&filter=${filter}&status=${status}`);
    console.log(res.data.data)
    return res.data.data
  } catch (err) {
    console.log(err);
  }
}

export const updateStatus = async (id, status) => {
    await axios.patch(`${API_URL}toggle-status/${id}`, {
      status,
    });
  }

export const totalData = async () => {
  try {
    const res = await axios.get(`${API_URL}count`)
    
    return res.data.data
  } catch (error) {
    console.log(error);
  }
}