import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3333'
})


export default {
  request: (authorization) => {
    axiosInstance.interceptors.request.use((config) => {
      config.params = config.params || {}
      config.headers['Authorization'] = authorization
      return config
    })
    return axiosInstance
  }
}
