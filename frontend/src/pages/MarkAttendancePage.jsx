import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ClipboardCheck, BookOpen, User, ChevronLeft, ChevronRight, CheckCircle, XCircle, Calendar, Clock, Shield } from 'lucide-react';
import api from '../lib/api';

const MarkAttendancePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const backPath = location.state?.from || '/dashboard';
  const backLabel = backPath === '/dashboard/attendance' ? 'Back to Attendance' : 'Back to Dashboard';
  
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [existingAttendance, setExistingAttendance] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingStudents, setFetchingStudents] = useState(true);
  const [fetchingCourses, setFetchingCourses] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchEnrolledCourses();
    }
  }, [selectedStudent]);

  useEffect(() => {
    if (selectedStudent && selectedCourse) {
      fetchExistingAttendance();
    }
  }, [selectedStudent, selectedCourse, currentMonth]);

  const fetchStudents = async () => {
    setFetchingStudents(true);
    try {
      const response = await api.get('/students/', { params: { limit: 1000 } });
      setStudents(response.data);
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setError('Failed to load students');
    } finally {
      setFetchingStudents(false);
    }
  };

  const fetchEnrolledCourses = async () => {
    setFetchingCourses(true);
    setEnrolledCourses([]);
    setSelectedCourse(null);
    try {
      const response = await api.get('/enrollments/', { params: { student_id: selectedStudent.id } });
      const activeEnrollments = response.data.filter(e => e.status === 'active' || e.status === 'completed');
      
      const coursesWithDetails = activeEnrollments.map(enrollment => ({
        id: enrollment.course_id,
        course_code: enrollment.course_code,
        course_name: enrollment.course_name,
        enrollment_date: enrollment.enrollment_date
      }));
      
      setEnrolledCourses(coursesWithDetails);
    } catch (err) {
      console.error('Failed to fetch enrolled courses:', err);
    } finally {
      setFetchingCourses(false);
    }
  };

  const fetchExistingAttendance = async () => {
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
      
      const response = await api.get('/academic/attendance/', {
        params: {
          student_id: selectedStudent.id,
          course_id: selectedCourse.id,
          date_from: startDate,
          date_to: endDate
        }
      });
      
      const existing = {};
      response.data.forEach(record => {
        existing[record.date] = record.status;
      });
      setExistingAttendance(existing);
    } catch (err) {
      console.error('Failed to fetch existing attendance:', err);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay };
  };

  const formatDateKey = (day) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const handleDateClick = (day) => {
    if (!selectedCourse) return;
    
    const dateKey = formatDateKey(day);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const clickedDate = new Date(dateKey);
    
    if (clickedDate > today) return;
    
    // Check if date is before enrollment date
    if (selectedCourse.enrollment_date) {
      const enrollmentDate = new Date(selectedCourse.enrollment_date);
      enrollmentDate.setHours(0, 0, 0, 0);
      if (clickedDate < enrollmentDate) return;
    }
    
    setAttendanceRecords(prev => {
      const current = prev[dateKey] || existingAttendance[dateKey] || null;
      let newStatus;
      
      // Cycle through: present -> absent -> late -> excused -> null
      if (current === null) {
        newStatus = 'present';
      } else if (current === 'present') {
        newStatus = 'absent';
      } else if (current === 'absent') {
        newStatus = 'late';
      } else if (current === 'late') {
        newStatus = 'excused';
      } else {
        newStatus = null;
      }
      
      if (newStatus === null) {
        const newRecords = { ...prev };
        delete newRecords[dateKey];
        return newRecords;
      }
      
      return { ...prev, [dateKey]: newStatus };
    });
  };

  const getDateStatus = (day) => {
    const dateKey = formatDateKey(day);
    if (attendanceRecords[dateKey] !== undefined) {
      return attendanceRecords[dateKey];
    }
    return existingAttendance[dateKey] || null;
  };

  const handlePrevMonth = () => {
    // Check if we can go to previous month based on enrollment date
    if (selectedCourse?.enrollment_date) {
      const enrollmentDate = new Date(selectedCourse.enrollment_date);
      const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
      const enrollmentMonthStart = new Date(enrollmentDate.getFullYear(), enrollmentDate.getMonth(), 1);
      if (prevMonth < enrollmentMonthStart) return;
    }
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setAttendanceRecords({});
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    const today = new Date();
    if (nextMonth <= today) {
      setCurrentMonth(nextMonth);
      setAttendanceRecords({});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const recordsToSave = Object.entries(attendanceRecords).filter(([date, status]) => {
      return status !== null && status !== existingAttendance[date];
    });
    
    if (recordsToSave.length === 0) {
      setError('No attendance changes to save');
      return;
    }
    
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const promises = recordsToSave.map(([date, status]) => 
        api.post('/academic/attendance/', {
          student_id: selectedStudent.id,
          course_id: selectedCourse.id,
          date: date,
          status: status
        })
      );

      await Promise.all(promises);
      
      setSuccess(`Attendance saved for ${recordsToSave.length} date(s)!`);
      setAttendanceRecords({});
      fetchExistingAttendance();
      
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const today = new Date();
  const isCurrentMonth = currentMonth.getMonth() === today.getMonth() && 
                         currentMonth.getFullYear() === today.getFullYear();

  // Check if we can navigate to previous month
  const canGoPrevMonth = (() => {
    if (!selectedCourse?.enrollment_date) return true;
    const enrollmentDate = new Date(selectedCourse.enrollment_date);
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const enrollmentMonthStart = new Date(enrollmentDate.getFullYear(), enrollmentDate.getMonth(), 1);
    return prevMonth >= enrollmentMonthStart;
  })();

  const changesCount = Object.keys(attendanceRecords).filter(date => 
    attendanceRecords[date] !== null && attendanceRecords[date] !== existingAttendance[date]
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <button
        onClick={() => navigate(backPath)}
        className="fixed top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors z-10"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>{backLabel}</span>
      </button>

      <div className="max-w-6xl mx-auto">
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Mark Attendance</h1>
              <p className="text-slate-400">Select student, course and mark attendance on calendar</p>
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Panel - Student & Course Selection */}
            <div className="space-y-6">
              {/* Student Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <User className="inline w-4 h-4 mr-2" />
                  Select Student
                </label>
                {fetchingStudents ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={selectedStudent?.id || ''}
                      onChange={(e) => {
                        const student = students.find(s => s.id === parseInt(e.target.value));
                        setSelectedStudent(student || null);
                        setAttendanceRecords({});
                        setExistingAttendance({});
                      }}
                      className="w-full px-4 pr-10 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none cursor-pointer"
                    >
                      <option value="">Choose a student...</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.full_name} ({student.student_id})
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              {/* Course Selection */}
              {selectedStudent && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <BookOpen className="inline w-4 h-4 mr-2" />
                    Enrolled Courses
                  </label>
                  {fetchingCourses ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : enrolledCourses.length === 0 ? (
                    <div className="p-4 bg-slate-700/50 rounded-lg text-slate-400 text-center">
                      No active enrollments found
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                      {enrolledCourses.map((course) => (
                        <button
                          key={course.id}
                          type="button"
                          onClick={() => {
                            setSelectedCourse(course);
                            setAttendanceRecords({});
                            // Navigate to enrollment month if current month is before it
                            if (course.enrollment_date) {
                              const enrollmentDate = new Date(course.enrollment_date);
                              const enrollmentMonthStart = new Date(enrollmentDate.getFullYear(), enrollmentDate.getMonth(), 1);
                              const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
                              if (currentMonthStart < enrollmentMonthStart) {
                                setCurrentMonth(enrollmentMonthStart);
                              }
                            }
                          }}
                          className={`w-full p-3 rounded-lg border text-left transition-all ${
                            selectedCourse?.id === course.id
                              ? 'bg-amber-500/20 border-amber-500 text-white'
                              : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500'
                          }`}
                        >
                          <p className="font-medium">{course.course_code}</p>
                          <p className="text-sm text-slate-400">{course.course_name}</p>
                          {course.enrollment_date && (
                            <p className="text-xs text-amber-400 mt-1">
                              Enrolled: {new Date(course.enrollment_date).toLocaleDateString('en-GB')}
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Legend */}
              {selectedCourse && (
                <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Legend (Click to cycle)</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-slate-300 text-sm">Present</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
                        <XCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-slate-300 text-sm">Absent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-slate-300 text-sm">Late</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-slate-300 text-sm">Excused</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-600 border border-slate-500"></div>
                      <span className="text-slate-300 text-sm">Not Marked</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel - Calendar */}
            <div className="lg:col-span-2">
              {!selectedStudent ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-slate-400">
                  <User className="w-16 h-16 mb-4 opacity-50" />
                  <p>Select a student to begin</p>
                </div>
              ) : !selectedCourse ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-slate-400">
                  <BookOpen className="w-16 h-16 mb-4 opacity-50" />
                  <p>Select a course to view calendar</p>
                </div>
              ) : (
                <div className="bg-slate-700/30 rounded-xl border border-slate-600 p-6">
                  {/* Enrollment Date Info */}
                  {selectedCourse?.enrollment_date && (
                    <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-sm">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Enrollment started: {new Date(selectedCourse.enrollment_date).toLocaleDateString('en-GB')}
                    </div>
                  )}

                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-6">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      disabled={!canGoPrevMonth}
                      className={`p-2 rounded-lg transition-colors ${
                        !canGoPrevMonth
                          ? 'opacity-30 cursor-not-allowed'
                          : 'hover:bg-slate-600'
                      }`}
                    >
                      <ChevronLeft className="w-6 h-6 text-slate-300" />
                    </button>
                    <h3 className="text-xl font-bold text-white">
                      {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </h3>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      disabled={isCurrentMonth}
                      className={`p-2 rounded-lg transition-colors ${
                        isCurrentMonth
                          ? 'opacity-30 cursor-not-allowed'
                          : 'hover:bg-slate-600'
                      }`}
                    >
                      <ChevronRight className="w-6 h-6 text-slate-300" />
                    </button>
                  </div>

                  {/* Day Names */}
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {dayNames.map(day => (
                      <div key={day} className="text-center text-sm font-medium text-slate-400 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-2">
                    {/* Empty cells for days before the 1st */}
                    {Array.from({ length: startingDay }).map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square" />
                    ))}
                    
                    {/* Days of the month */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const dateKey = formatDateKey(day);
                      const dateObj = new Date(dateKey);
                      const isFuture = dateObj > today;
                      const isToday = dateObj.toDateString() === today.toDateString();
                      const status = getDateStatus(day);
                      const hasChange = attendanceRecords[dateKey] !== undefined && 
                                       attendanceRecords[dateKey] !== existingAttendance[dateKey];
                      
                      // Check if date is before enrollment date
                      const isBeforeEnrollment = selectedCourse?.enrollment_date 
                        ? dateObj < new Date(selectedCourse.enrollment_date)
                        : false;
                      const isDisabled = isFuture || isBeforeEnrollment;
                      
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleDateClick(day)}
                          disabled={isDisabled}
                          className={`aspect-square rounded-xl flex flex-col items-center justify-center text-lg font-medium transition-all relative ${
                            isDisabled
                              ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
                              : status === 'present'
                              ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/30'
                              : status === 'absent'
                              ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30'
                              : status === 'late'
                              ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/30'
                              : status === 'excused'
                              ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30'
                              : 'bg-slate-600 text-slate-200 hover:bg-slate-500 border border-slate-500'
                          } ${isToday ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-800' : ''}`}
                        >
                          <span>{day}</span>
                          {status && (
                            <span className="absolute bottom-1">
                              {status === 'present' && <CheckCircle className="w-3 h-3" />}
                              {status === 'absent' && <XCircle className="w-3 h-3" />}
                              {status === 'late' && <Clock className="w-3 h-3" />}
                              {status === 'excused' && <Shield className="w-3 h-3" />}
                            </span>
                          )}
                          {hasChange && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Save Button */}
                  {changesCount > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-600">
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={saving}
                        className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                      >
                        <Calendar className="w-5 h-5" />
                        {saving ? 'Saving...' : `Save Attendance (${changesCount} change${changesCount > 1 ? 's' : ''})`}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkAttendancePage;
