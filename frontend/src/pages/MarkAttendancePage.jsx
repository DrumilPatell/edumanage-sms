import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardCheck, BookOpen, Calendar, CheckCircle, XCircle } from 'lucide-react';

const MarkAttendancePage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingStudents, setFetchingStudents] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchEnrolledStudents();
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://127.0.0.1:8000/api/courses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  const fetchEnrolledStudents = async () => {
    setFetchingStudents(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://127.0.0.1:8000/api/enrollments/course/${selectedCourse}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
        // Initialize attendance as all present
        const initialAttendance = {};
        data.forEach(student => {
          initialAttendance[student.student_id] = true;
        });
        setAttendance(initialAttendance);
      }
    } catch (err) {
      console.error('Failed to fetch enrolled students:', err);
    } finally {
      setFetchingStudents(false);
    }
  };

  const toggleAttendance = (studentId) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Please login first');
      }

      const attendanceRecords = Object.entries(attendance).map(([studentId, isPresent]) => ({
        student_id: parseInt(studentId),
        course_id: parseInt(selectedCourse),
        date: attendanceDate,
        status: isPresent ? 'present' : 'absent'
      }));

      const response = await fetch('http://127.0.0.1:8000/api/attendance/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(attendanceRecords)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to mark attendance');
      }

      setSuccess('Attendance marked successfully!');
      
      setTimeout(() => {
        navigate('/dashboard/attendance');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/dashboard/attendance')}
          className="flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Attendance
        </button>

        <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Mark Attendance</h1>
              <p className="text-slate-400">Record student attendance</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Course
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
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
                  Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>
            </div>

            {selectedCourse && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Students Enrolled ({students.length})
                </h3>
                
                {fetchingStudents ? (
                  <div className="text-center py-8 text-slate-400">
                    Loading students...
                  </div>
                ) : students.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    No students enrolled in this course
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {students.map((student) => (
                      <div
                        key={student.student_id}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer ${
                          attendance[student.student_id]
                            ? 'bg-green-500/10 border-green-500/50'
                            : 'bg-red-500/10 border-red-500/50'
                        }`}
                        onClick={() => toggleAttendance(student.student_id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            attendance[student.student_id]
                              ? 'bg-green-500'
                              : 'bg-red-500'
                          }`}>
                            {attendance[student.student_id] ? (
                              <CheckCircle className="w-6 h-6 text-white" />
                            ) : (
                              <XCircle className="w-6 h-6 text-white" />
                            )}
                          </div>
                          <div>
                            <p className="text-white font-medium">{student.full_name}</p>
                            <p className="text-sm text-slate-400">{student.student_id}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          attendance[student.student_id]
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                        }`}>
                          {attendance[student.student_id] ? 'Present' : 'Absent'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {students.length > 0 && (
              <button
                type="submit"
                disabled={loading || !selectedCourse}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Saving Attendance...' : 'Save Attendance'}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default MarkAttendancePage;
