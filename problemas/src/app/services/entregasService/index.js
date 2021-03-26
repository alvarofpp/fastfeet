import axios from 'axios'



export default {
  request: (authorization) => {
    const axiosInstance = axios.create({
      baseURL: 'http://localhost:3333'
    })

    axiosInstance.interceptors.request.use((config) => {
      config.params = config.params || {}
      config.headers['Authorization'] = authorization
      return config
    })
    return axiosInstance
  }
}
