import Axios from 'axios'

const axios = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
  // Necesario para que el navegador mande/reciba la cookie de sesión
  // y la cookie XSRF-TOKEN entre portal.empresa.com y api.empresa.com.
  withCredentials: true,
  withXSRFToken: true,
})

export { axios }