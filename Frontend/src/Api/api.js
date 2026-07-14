import axios from "axios"

 export const postTask = async (title,description) => {
    await axios.post(
        "http://localhost:8000/api/v1/todo/addTask",
        {
          title: title.trim(),
          description: description.trim(),
        },
      );
}
export const getSingleTaskData = async (id) => {
    const taskData = await axios.get(`http://localhost:8000/api/v1/todo/${id}`)
    
    return taskData.data.data
}

export const updateTaskDetails = async (id,title,description) => {
    axios.patch(`http://localhost:8000/api/v1/todo/${id}`, {
        title: title.trim(),
        description: description.trim()
      })
}

export const deleteTaskById = async (id) => {
    await axios.delete(`http://localhost:8000/api/v1/todo/${id}`)
}

export const getAllTasks = async (page = 1, limit = 5, filter = "all") => {
    try {
    const res = await axios.get(`http://localhost:8000/api/v1/todo/?page=${page}&limit=${limit}&filter=${filter}`);
    return res.data.data
  } catch (err) {
    console.log(err);
  }
}

export const  updateStatus = async (id) => {
    await axios.patch(`http://localhost:8000/api/v1/todo/toggle-status/${id}`);
  }

export const totalData = async () => {
  try {
    const res = await axios.get("http://localhost:8000/api/v1/todo/count")
    
    return res.data.data
  } catch (error) {
    console.log(error);
  }
}