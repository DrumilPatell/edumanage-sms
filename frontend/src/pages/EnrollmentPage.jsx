import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, BookOpen, User, Calendar } from 'lucide-react';
import api from '../lib/api';

const EnrollmentPage = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    student_id: '',
    course_id: '',
    enrollment_date: new Date().toISOString().split('T')[0]
  });
  const [displayDate, setDisplayDate] = useState(() => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}-${month}-${year}`;
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students/');
      setStudents(response.data);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses/');
      setCourses(response.data);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'enrollment_date') {
      setFormData({
        ...formData,
        enrollment_date: value
      });
      if (value) {
        const [year, month, day] = value.split('-');
        setDisplayDate(`${day}-${month}-${year}`);
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    setError('');
  };

  const handleDisplayDateChange = (e) => {
    const value = e.target.value;
    setDisplayDate(value);
    if (value.length === 10) {
      const [day, month, year] = value.split('-');
      setFormData({
        ...formData,
        enrollment_date: `${year}-${month}-${day}`
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/enrollments/', {
        student_id: parseInt(formData.student_id),
        course_id: parseInt(formData.course_id),
        enrollment_date: formData.enrollment_date
      });

      setSuccess('Student enrolled successfully!');
      setFormData({
        student_id: '',
        course_id: '',
        enrollment_date: new Date().toISOString().split('T')[0]
      });
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to enroll student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <button
        onClick={() => navigate('/dashboard')}
        className="fixed top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors z-10"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Dashboard</span>
      </button>

      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Enroll Student</h1>
              <p className="text-slate-400">Enroll a student in a course</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400">
              {success}
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
                  onChange={(e) => {
                    let value = e.target.value.replace(/[^\d-]/g, '');
                    // Auto-format with dashes
                    const digits = value.replace(/-/g, '');
                    let formatted = '';
                    if (digits.length > 0) {
                      formatted = digits.slice(0, 2);
                      if (digits.length > 2) {
                        formatted += '-' + digits.slice(2, 4);
                      }
                      if (digits.length > 4) {
                        formatted += '-' + digits.slice(4, 8);
                      }
                    }
                    setDisplayDate(formatted);
                    
                    if (digits.length === 8) {
                      const day = digits.slice(0, 2);
                      const month = digits.slice(2, 4);
                      const year = digits.slice(4, 8);
                      setFormData(prev => ({
                        ...prev,
                        enrollment_date: `${year}-${month}-${day}`
                      }));
                    }
                  }}
                  placeholder="dd-mm-yyyy"
                  maxLength="10"
                  className="w-full pl-11 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Enrolling...' : 'Enroll Student'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentPage;
