import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardCheck, BookOpen, Calendar, CheckCircle, XCircle } from 'lucide-react';
import api from '../lib/api';

const MarkAttendancePage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [displayDate, setDisplayDate] = useState(() => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}-${month}-${year}`;
  });
  const [attendance, setAttendance] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingStudents, setFetchingStudents] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse && attendanceDate) {
      fetchEnrolledStudents();
    }
  }, [selectedCourse, attendanceDate]);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses/');
      setCourses(response.data);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  const fetchEnrolledStudents = async () => {
    setFetchingStudents(true);
    try {
      const response = await api.get('/enrollments/', { params: { course_id: selectedCourse } });
      const attendanceDateObj = new Date(attendanceDate);
      attendanceDateObj.setHours(23, 59, 59, 999);
      
      const filteredEnrollments = response.data.filter(enrollment => {
        const enrollmentDate = new Date(enrollment.enrollment_date);
        return enrollmentDate <= attendanceDateObj && 
              (enrollment.status === 'active' || enrollment.status === 'completed');
      });

      const enrolledStudents = filteredEnrollments.map(enrollment => ({
        student_id: enrollment.student_id,
        full_name: enrollment.student_name,
        student_code: enrollment.student_code,
        enrollment_date: enrollment.enrollment_date
      }));
      setStudents(enrolledStudents);
      const initialAttendance = {};
      enrolledStudents.forEach(student => {
        initialAttendance[student.student_id] = true;
      });
      setAttendance(initialAttendance);
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

  const handleDateChange = (e) => {
    const value = e.target.value;
    setAttendanceDate(value);
    if (value) {
      const [year, month, day] = value.split('-');
      setDisplayDate(`${day}-${month}-${year}`);
    }
  };

  const handleDisplayDateChange = (e) => {
    const value = e.target.value;
    setDisplayDate(value);
    if (value.length === 10) {
      const [day, month, year] = value.split('-');
      setAttendanceDate(`${year}-${month}-${day}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const promises = Object.entries(attendance).map(([studentId, isPresent]) => 
        api.post('/academic/attendance/', {
          student_id: parseInt(studentId),
          course_id: parseInt(selectedCourse),
          date: attendanceDate,
          status: isPresent ? 'present' : 'absent'
        })
      );

      await Promise.all(promises);

      setSuccess('Attendance marked successfully!');
      
      setTimeout(() => {
        navigate('/dashboard/attendance');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to mark attendance');
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
              <p className="text-slate-400">Record student attendance for a course</p>
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
                  <Calendar 
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 cursor-pointer hover:text-amber-400 transition-colors z-10" 
                    onClick={() => document.getElementById('attendance_date_picker').showPicker()}
                  />
                  <input
                    type="date"
                    id="attendance_date_picker"
                    value={attendanceDate}
                    onChange={handleDateChange}
                    max={new Date().toISOString().split('T')[0]}
                    required
                    className="absolute left-0 top-0 w-11 h-full opacity-0 cursor-pointer z-20"
                    style={{ colorScheme: 'dark' }}
                  />
                  <input
                    type="text"
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
            </div>

            {selectedCourse && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Students Enrolled ({students.length})
                </h3>
                
                {fetchingStudents ? (
                  <div className="text-center py-8">
                    <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 mt-2">Loading students...</p>
                  </div>
                ) : students.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 bg-slate-700/30 rounded-lg">
                    No students enrolled in this course
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {students.map((student) => {
                      const enrollDate = new Date(student.enrollment_date);
                      const enrollDay = String(enrollDate.getDate()).padStart(2, '0');
                      const enrollMonth = String(enrollDate.getMonth() + 1).padStart(2, '0');
                      const enrollYear = enrollDate.getFullYear();
                      const formattedEnrollDate = `${enrollDay}-${enrollMonth}-${enrollYear}`;
                      
                      return (
                        <div
                          key={student.student_id}
                          className={`flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer ${
                            attendance[student.student_id]
                              ? 'bg-green-500/10 border-green-500/50 hover:bg-green-500/20'
                              : 'bg-red-500/10 border-red-500/50 hover:bg-red-500/20'
                          }`}
                          onClick={() => toggleAttendance(student.student_id)}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
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
                            <div className="flex-1">
                              <p className="text-white font-semibold text-lg">{student.full_name}</p>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                <p className="text-sm text-slate-400">
                                  <span className="text-slate-500">Student ID:</span> <span className="text-amber-400 font-medium">{student.student_code}</span>
                                </p>
                                <p className="text-sm text-slate-400">
                                  <span className="text-slate-500">Enrolled:</span> <span className="text-cyan-400">{formattedEnrollDate}</span>
                                </p>
                              </div>
                            </div>
                          </div>
                          <span className={`px-4 py-2 rounded-full text-sm font-medium flex-shrink-0 ${
                            attendance[student.student_id]
                              ? 'bg-green-500 text-white'
                              : 'bg-red-500 text-white'
                          }`}>
                            {attendance[student.student_id] ? 'Present' : 'Absent'}
                          </span>
                        </div>
                      );
                    })}
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
