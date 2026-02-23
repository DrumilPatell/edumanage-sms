import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Award, BookOpen, User, Hash, FileText, Calendar } from 'lucide-react';
import api from '../lib/api';

const EditGradePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const queryClient = useQueryClient();
  const backPath = location.state?.from || '/dashboard/grades';
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    student_id: '',
    course_id: '',
    assessment_type: '',
    assessment_name: '',
    score: '',
    max_score: '100',
    letter_grade: '',
    date_assessed: '',
    remarks: ''
  });
  const [displayDate, setDisplayDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [coursesRes, studentsRes, gradeRes] = await Promise.all([
        api.get('/courses/'),
        api.get('/students/'),
        api.get(`/academic/grades/${id}`)
      ]);
      setCourses(coursesRes.data);
      setStudents(studentsRes.data);
      
      const grade = gradeRes.data;
      const dateStr = grade.date_assessed || '';
      setFormData({
        student_id: grade.student_id?.toString() || '',
        course_id: grade.course_id?.toString() || '',
        assessment_type: grade.assessment_type || '',
        assessment_name: grade.assessment_name || '',
        score: grade.score?.toString() || '',
        max_score: grade.max_score?.toString() || '100',
        letter_grade: grade.letter_grade || '',
        date_assessed: dateStr,
        remarks: grade.remarks || ''
      });
      if (dateStr) {
        const [year, month, day] = dateStr.split('-');
        setDisplayDate(`${day}-${month}-${year}`);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load grade data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle date change from date picker
    if (name === 'date_assessed') {
      setFormData(prev => ({ ...prev, date_assessed: value }));
      if (value) {
        const [year, month, day] = value.split('-');
        setDisplayDate(`${day}-${month}-${year}`);
      }
      setError('');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    
    // Auto-calculate letter grade based on score
    if (name === 'score' || name === 'max_score') {
      const score = name === 'score' ? parseFloat(value) : parseFloat(formData.score);
      const maxScore = name === 'max_score' ? parseFloat(value) : parseFloat(formData.max_score);
      
      // Validate score doesn't exceed max score
      if (score > maxScore && maxScore > 0) {
        setError('Score cannot be greater than maximum score');
      } else {
        setError('');
      }
      
      if (score && maxScore && maxScore > 0) {
        const percentage = (score / maxScore) * 100;
        let letterGrade = '';
        if (percentage >= 90) letterGrade = 'A+';
        else if (percentage >= 80) letterGrade = 'A';
        else if (percentage >= 75) letterGrade = 'B+';
        else if (percentage >= 70) letterGrade = 'B';
        else if (percentage >= 65) letterGrade = 'C+';
        else if (percentage >= 60) letterGrade = 'C';
        else if (percentage >= 50) letterGrade = 'D';
        else letterGrade = 'F';
        setFormData(prev => ({ ...prev, letter_grade: letterGrade }));
      }
    }
  };

  const handleDisplayDateChange = (e) => {
    const value = e.target.value;
    setDisplayDate(value);
    if (value.length === 10) {
      const [day, month, year] = value.split('-');
      setFormData(prev => ({ ...prev, date_assessed: `${year}-${month}-${day}` }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate score doesn't exceed max score
    const score = parseFloat(formData.score);
    const maxScore = parseFloat(formData.max_score);
    if (score > maxScore) {
      setError('Score cannot be greater than maximum score');
      return;
    }
    
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await api.put(`/academic/grades/${id}`, {
        student_id: parseInt(formData.student_id),
        course_id: parseInt(formData.course_id),
        assessment_type: formData.assessment_type,
        assessment_name: formData.assessment_name,
        score: parseFloat(formData.score),
        max_score: parseFloat(formData.max_score),
        letter_grade: formData.letter_grade || null,
        date_assessed: formData.date_assessed || null,
        remarks: formData.remarks || null
      });

      setSuccess('Grade updated successfully!');
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      
      setTimeout(() => {
        navigate(backPath);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update grade');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <button
        onClick={() => navigate(backPath)}
        className="fixed top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors z-10"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Grades</span>
      </button>

      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Edit Grade</h1>
              <p className="text-slate-400">Update student assessment grade</p>
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
                  className="w-full pl-11 pr-10 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="">Choose a student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.student_id} - {student.full_name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
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
                  className="w-full pl-11 pr-10 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="">Choose a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.course_code} - {course.course_name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Assessment Type
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    name="assessment_type"
                    value={formData.assessment_type}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-10 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none cursor-pointer"
                  >
                    <option value="">Select type</option>
                    <option value="quiz">Quiz</option>
                    <option value="midterm">Midterm</option>
                    <option value="final">Final</option>
                    <option value="assignment">Assignment</option>
                    <option value="project">Project</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Date Assessed
                </label>
                <div className="relative">
                  <Calendar 
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 cursor-pointer hover:text-amber-400 transition-colors z-10" 
                    onClick={() => document.getElementById('edit_grade_date_picker').showPicker()}
                  />
                  <input
                    type="date"
                    id="edit_grade_date_picker"
                    name="date_assessed"
                    value={formData.date_assessed}
                    onChange={handleChange}
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

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Assessment Name
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="assessment_name"
                  value={formData.assessment_name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Midterm Exam 1, Quiz 3, Final Project"
                  className="w-full pl-11 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Score
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    name="score"
                    value={formData.score}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="Score obtained"
                    className="w-full pl-11 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Max Score
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    name="max_score"
                    value={formData.max_score}
                    onChange={handleChange}
                    required
                    min="1"
                    step="0.01"
                    placeholder="Maximum score"
                    className="w-full pl-11 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Letter Grade
                </label>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    name="letter_grade"
                    value={formData.letter_grade}
                    onChange={handleChange}
                    className="w-full pl-11 pr-10 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none cursor-pointer"
                  >
                    <option value="">Auto / Select</option>
                    <option value="A+">A+</option>
                    <option value="A">A</option>
                    <option value="B+">B+</option>
                    <option value="B">B</option>
                    <option value="C+">C+</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="F">F</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Remarks (Optional)
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows={3}
                placeholder="Any additional notes or comments..."
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <h3 className="text-sm font-medium text-slate-300 mb-2">Grading Scale (Auto-calculated)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-400">
                <div>A+: 90-100%</div>
                <div>A: 80-89%</div>
                <div>B+: 75-79%</div>
                <div>B: 70-74%</div>
                <div>C+: 65-69%</div>
                <div>C: 60-64%</div>
                <div>D: 50-59%</div>
                <div>F: 0-49%</div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {submitting ? 'Updating Grade...' : 'Update Grade'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditGradePage;
