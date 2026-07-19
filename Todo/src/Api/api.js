import axios from "axios"
const API_URL = import.meta.env.VITE_API_URL;

// todo apis

 export const postTask = async (title,description,status = "pending") => {
    await axios.post(
        `${API_URL}todo/addTask`,
        {
          title: title.trim(),
          description: description.trim(),
          status,
        },
      );
}
export const getSingleTaskData = async (id) => {
    const taskData = await axios.get(`${API_URL}todo/${id}`)
    
    return taskData.data.data
}

export const updateTaskDetails = async (id,title,description) => {
    axios.patch(`${API_URL}todo/${id}`, {
        title: title.trim(),
        description: description.trim()
      })
}

export const deleteTaskById = async (id) => {
    await axios.delete(`${API_URL}todo/${id}`)
}

export const getAllTasks = async (page = 1, limit = 5, filter = "all", status = "all") => {
    try {
    const res = await axios.get(`${API_URL}todo?page=${page}&limit=${limit}&filter=${filter}&status=${status}`);
    console.log(res.data.data)
    return res.data.data
  } catch (err) {
    console.log(err);
  }
}

export const updateStatus = async (id, status) => {
    await axios.patch(`${API_URL}todo/toggle-status/${id}`, {
      status,
    });
  }

export const totalData = async () => {
  try {
    const res = await axios.get(`${API_URL}todo/count`)
    
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