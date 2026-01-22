import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { enrollmentsApi, studentsApi, coursesApi } from '../services/api';
import { ArrowLeft, Save, UserPlus, User, BookOpen, Calendar, CheckCircle } from 'lucide-react';

export default function EditEnrollmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    student_id: '',
    course_id: '',
    enrollment_date: '',
    status: 'active'
  });
  const [displayDate, setDisplayDate] = useState('');

  // Fetch students first
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentsApi.getStudents({ limit: 100 }),
  });

  // Fetch courses
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesApi.getCourses({ limit: 100 }),
  });

  // Fetch enrollment data directly by ID
  const { data: enrollment, isLoading: enrollmentLoading } = useQuery({
    queryKey: ['enrollment', id],
    queryFn: () => enrollmentsApi.getEnrollment(id),
  });

  useEffect(() => {
    if (enrollment) {
      // Parse enrollment date - handle both "2026-01-22" and "2026-01-22T00:00:00" formats
      let enrollDate = enrollment.enrollment_date || '';
      if (enrollDate.includes('T')) {
        enrollDate = enrollDate.split('T')[0];
      }
      
      setFormData({
        student_id: enrollment.student_id || '',
        course_id: enrollment.course_id || '',
        enrollment_date: enrollDate,
        status: enrollment.status || 'active'
      });
      
      // Format display date as dd-mm-yyyy
      if (enrollDate) {
        const [year, month, day] = enrollDate.split('-');
        setDisplayDate(`${day}-${month}-${year}`);
      }
    }
  }, [enrollment]);

  const mutation = useMutation({
    mutationFn: (data) => enrollmentsApi.updateEnrollment(id, data),
    onSuccess: () => {
      setTimeout(() => navigate('/dashboard/enrollments'), 1500);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'enrollment_date') {
      setFormData(prev => ({
        ...prev,
        enrollment_date: value
      }));
      if (value) {
        const [year, month, day] = value.split('-');
        setDisplayDate(`${day}-${month}-${year}`);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'student_id' || name === 'course_id' ? parseInt(value, 10) : value
      }));
    }
  };

  const handleDisplayDateChange = (e) => {
    const value = e.target.value;
    setDisplayDate(value);
    if (value.length === 10) {
      const [day, month, year] = value.split('-');
      setFormData(prev => ({
        ...prev,
        enrollment_date: `${year}-${month}-${day}`
      }));
    }
  };

  // Show loading while any data is being fetched
  if (enrollmentLoading || studentsLoading || coursesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/dashboard/enrollments')}
          className="flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Enrollments
        </button>

        <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Edit Enrollment</h1>
              <p className="text-slate-400">Update enrollment information</p>
            </div>
          </div>

          {mutation.isError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
              {mutation.error?.response?.data?.detail || 'Failed to update enrollment'}
            </div>
          )}

          {mutation.isSuccess && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400">
              Enrollment updated successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Select Student
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="">Choose a student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.student_id} - {student.full_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Select Course
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select
                  name="course_id"
                  value={formData.course_id}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="">Choose a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.course_code} - {course.course_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Enrollment Date
              </label>
              <div className="relative">
                <Calendar 
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 cursor-pointer hover:text-amber-400 transition-colors z-10" 
                  onClick={() => document.getElementById('enrollment_date_picker').showPicker()}
                />
                <input
                  type="date"
                  id="enrollment_date_picker"
                  name="enrollment_date"
                  value={formData.enrollment_date}
                  onChange={handleChange}
                  required
                  className="absolute left-0 top-0 w-11 h-full opacity-0 cursor-pointer z-20"
                  style={{ colorScheme: 'dark' }}
                />
                <input
                  type="text"
                  name="display_enrollment_date"
                  value={displayDate}
                  onChange={handleDisplayDateChange}
                  placeholder="dd-mm-yyyy"
                  maxLength="10"
                  className="w-full pl-11 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  onInput={(e) => {
                    let value = e.target.value.replace(/[^\d]/g, '');
                    if (value.length >= 2) value = value.slice(0, 2) + '-' + value.slice(2);
                    if (value.length >= 5) value = value.slice(0, 5) + '-' + value.slice(5, 9);
                    e.target.value = value;
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Status
              </label>
              <div className="relative">
                <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="dropped">Dropped</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard/enrollments')}
                className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {mutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
