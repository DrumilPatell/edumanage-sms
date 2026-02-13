import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { coursesApi, semestersApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { Edit, Trash2, Plus, RefreshCw, Settings, X, Calendar } from 'lucide-react'

export default function CoursesPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const canEdit = user?.role === 'admin' || user?.role === 'faculty'
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [showSemesterModal, setShowSemesterModal] = useState(false)
  const [showManageSemestersModal, setShowManageSemestersModal] = useState(false)
  const [selectedSemester, setSelectedSemester] = useState('')
  const [newSemesterName, setNewSemesterName] = useState('')
  
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesApi.getCourses({ limit: 100 }),
  })

  const { data: semesters = [] } = useQuery({
    queryKey: ['semesters'],
    queryFn: semestersApi.getSemesters,
  })

  const deleteMutation = useMutation({
    mutationFn: (courseId) => coursesApi.deleteCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries(['courses'])
      setDeleteConfirm(null)
    },
  })

  const bulkUpdateSemesterMutation = useMutation({
    mutationFn: (semester) => coursesApi.bulkUpdateSemester(semester),
    onSuccess: () => {
      queryClient.invalidateQueries(['courses'])
      setShowSemesterModal(false)
      setSelectedSemester('')
    },
  })

  const createSemesterMutation = useMutation({
    mutationFn: (name) => semestersApi.createSemester({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries(['semesters'])
      setNewSemesterName('')
    },
  })

  const deleteSemesterMutation = useMutation({
    mutationFn: (id) => semestersApi.deleteSemester(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['semesters'])
    },
  })

  const handleDelete = (courseId) => {
    deleteMutation.mutate(courseId)
  }

  const handleBulkUpdateSemester = () => {
    if (selectedSemester) {
      bulkUpdateSemesterMutation.mutate(selectedSemester)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Courses</h1>
            <span className="text-sm text-slate-400 bg-slate-700/50 px-3 py-1 rounded-full border border-slate-600">
              {courses.length} total
            </span>
          </div>
          <p className="text-slate-400 mt-1">Manage course catalog and assignments</p>
        </div>
        <div className="flex items-center gap-3">
          {canEdit && (
            <button 
              onClick={() => setShowSemesterModal(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Update Semester
            </button>
          )}
          {canEdit && (
            <button 
              onClick={() => navigate('/add-course')}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Course
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {courses.map((course) => (
              <div key={course.id} className="card hover:shadow-2xl hover:shadow-amber-500/10 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white text-lg">{course.course_name}</h3>
                    <p className="text-sm text-amber-400">{course.course_code}</p>
                  </div>
                  <span className={`badge ${course.is_active ? 'badge-success' : 'badge-danger'}`}>
                    {course.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {course.description && (
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">{course.description}</p>
                )}

                <div className="flex items-center gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500">Credits</p>
                    <p className="text-sm font-medium text-white">{course.credits}</p>
                  </div>
                  {course.semester && (
                    <div>
                      <p className="text-xs text-slate-500">Semester</p>
                      <p className="text-sm font-medium text-white">{course.semester}</p>
                    </div>
                  )}
                  {course.faculty_name && (
                    <div className="flex-1">
                      <p className="text-xs text-slate-500">Faculty</p>
                      <p className="text-sm font-medium text-white truncate">{course.faculty_name}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-slate-700/50">
                  {canEdit ? (
                    <>
                      <button 
                        onClick={() => navigate(`/edit-course/${course.id}`)}
                        className="flex-1 btn-secondary text-sm flex items-center justify-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button 
                        onClick={() => setDeleteConfirm(course)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button className="flex-1 btn-secondary text-sm" disabled>
                      View Only
                    </button>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {!isLoading && courses.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-slate-400">No courses found</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-2">Delete Course</h3>
            <p className="text-slate-400 mb-6">
              Are you sure you want to delete <span className="text-white font-semibold">{deleteConfirm.course_name}</span> ({deleteConfirm.course_code})? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Update Semester Modal */}
      {showSemesterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Update Semester</h3>
                <p className="text-sm text-slate-400">For all courses</p>
              </div>
            </div>
            <p className="text-slate-400 mb-4">
              This will update the current semester for <span className="text-white font-semibold">all {courses.length} courses</span>.
            </p>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-300">
                  Select Semester
                </label>
                <button
                  onClick={() => {
                    setShowSemesterModal(false)
                    setShowManageSemestersModal(true)
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <Settings className="w-3 h-3" />
                  Manage Semesters
                </button>
              </div>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">Select a semester...</option>
                {semesters.map((sem) => (
                  <option key={sem.id} value={sem.name}>
                    {sem.name} {sem.is_current && '(Current)'}
                  </option>
                ))}
              </select>
              {semesters.length === 0 && (
                <p className="text-slate-500 text-sm mt-2">No semesters available. Click "Manage Semesters" to add some.</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSemesterModal(false)
                  setSelectedSemester('')
                }}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkUpdateSemester}
                disabled={!selectedSemester || bulkUpdateSemesterMutation.isPending}
                className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {bulkUpdateSemesterMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update All'
                )}
              </button>
            </div>
            {bulkUpdateSemesterMutation.isSuccess && (
              <p className="text-green-400 text-sm mt-3 text-center">
                ✓ Semester updated successfully!
              </p>
            )}
          </div>
        </div>
      )}

      {/* Manage Semesters Modal */}
      {showManageSemestersModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-lg w-full border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Settings className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Manage Semesters</h3>
                  <p className="text-sm text-slate-400">Add or remove semesters</p>
                </div>
              </div>
              <button
                onClick={() => setShowManageSemestersModal(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add New Semester */}
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={newSemesterName}
                onChange={(e) => setNewSemesterName(e.target.value)}
                placeholder="e.g., Spring 2027"
                className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={() => {
                  if (newSemesterName.trim()) {
                    createSemesterMutation.mutate(newSemesterName.trim())
                  }
                }}
                disabled={!newSemesterName.trim() || createSemesterMutation.isPending}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {/* Semester List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {semesters.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No semesters yet. Add one above.</p>
              ) : (
                semesters.map((sem) => (
                  <div
                    key={sem.id}
                    className="flex items-center justify-between p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-white">{sem.name}</span>
                      {sem.is_current && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => deleteSemesterMutation.mutate(sem.id)}
                      disabled={deleteSemesterMutation.isPending}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t border-slate-700">
              <button
                onClick={() => {
                  setShowManageSemestersModal(false)
                  setShowSemesterModal(true)
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
              >
                Back to Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
