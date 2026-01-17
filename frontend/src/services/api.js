import api from '../lib/api'

export const authApi = {
  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  logout: async () => {
    const response = await api.post('/auth/logout')
    return response.data
  },
}

export const usersApi = {
  getUsers: async (params) => {
    const response = await api.get('/users/', { params })
    return response.data
  },

  getUser: async (id) => {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  createUser: async (data) => {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  updateUser: async (id, data) => {
    const response = await api.patch(`/users/${id}`, data)
    return response.data
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`)
    return response.data
  },
}

export const studentsApi = {
  getStudents: async (params) => {
    const response = await api.get('/students/', { params })
    return response.data
  },

  getStudent: async (id) => {
    const response = await api.get(`/students/${id}`)
    return response.data
  },

  createStudent: async (data) => {
    const response = await api.post('/students/', data)
    return response.data
  },

  updateStudent: async (id, data) => {
    const response = await api.patch(`/students/${id}`, data)
    return response.data
  },

  deleteStudent: async (id) => {
    const response = await api.delete(`/students/${id}`)
    return response.data
  },

  getMyProfile: async () => {
    const response = await api.get('/students/me/profile')
    return response.data
  },
}

export const coursesApi = {
  getCourses: async (params) => {
    const response = await api.get('/courses/', { params })
    return response.data
  },

  getCourse: async (id) => {
    const response = await api.get(`/courses/${id}`)
    return response.data
  },

  createCourse: async (data) => {
    const response = await api.post('/courses/', data)
    return response.data
  },

  updateCourse: async (id, data) => {
    const response = await api.patch(`/courses/${id}`, data)
    return response.data
  },

  deleteCourse: async (id) => {
    const response = await api.delete(`/courses/${id}`)
    return response.data
  },

  getMyCourses: async () => {
    const response = await api.get('/courses/faculty/my-courses')
    return response.data
  },
}

export const enrollmentsApi = {
  getEnrollments: async (params) => {
    const response = await api.get('/enrollments/', { params })
    return response.data
  },

  createEnrollment: async (data) => {
    const response = await api.post('/enrollments/', data)
    return response.data
  },

  updateEnrollment: async (id, data) => {
    const response = await api.patch(`/enrollments/${id}`, data)
    return response.data
  },

  deleteEnrollment: async (id) => {
    const response = await api.delete(`/enrollments/${id}`)
    return response.data
  },

  getStudentEnrollments: async (studentId) => {
    const response = await api.get(`/enrollments/student/${studentId}/courses`)
    return response.data
  },
}

export const academicApi = {
  getAttendance: async (params) => {
    const response = await api.get('/academic/attendance/', { params })
    return response.data
  },

  createAttendance: async (data) => {
    const response = await api.post('/academic/attendance/', data)
    return response.data
  },

  updateAttendance: async (id, data) => {
    const response = await api.patch(`/academic/attendance/${id}`, data)
    return response.data
  },

  getGrades: async (params) => {
    const response = await api.get('/academic/grades/', { params })
    return response.data
  },

  createGrade: async (data) => {
    const response = await api.post('/academic/grades/', data)
    return response.data
  },

  updateGrade: async (id, data) => {
    const response = await api.patch(`/academic/grades/${id}`, data)
    return response.data
  },

  deleteGrade: async (id) => {
    const response = await api.delete(`/academic/grades/${id}`)
    return response.data
  },
}
