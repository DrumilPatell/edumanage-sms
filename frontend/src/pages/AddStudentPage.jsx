import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { studentsApi } from '../services/api';
import { ArrowLeft, User, Mail, Phone, Calendar, Hash, Building, GraduationCap, BookOpen } from 'lucide-react';

const AddStudentPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    student_id: '',
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    enrollment_date: new Date().toISOString().split('T')[0],
    program: '',
    year_level: 1,
    gpa: 0.0,
    is_active: true,
    password: ''
  });

  const [displayDOB, setDisplayDOB] = useState('');
  const [displayEnrollmentDate, setDisplayEnrollmentDate] = useState(() => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}-${month}-${year}`;
  });

  const formatDateToDisplay = (isoDate) => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}-${month}-${year}`;
  };

  const formatDateToISO = (displayDate) => {
    if (!displayDate || displayDate.length !== 10) return '';
    const [day, month, year] = displayDate.split('-');
    return `${year}-${month}-${day}`;
  };

  const mutation = useMutation({
    mutationFn: async (data) => {
      const studentData = {
        student_id: data.student_id,
        email: data.email,
        full_name: data.full_name,
        password: data.password || 'Student@123',
        phone: data.phone || null,
        date_of_birth: data.date_of_birth || null,
        address: data.address || null,
        enrollment_year: data.enrollment_date ? new Date(data.enrollment_date).getFullYear() : null,
        program: data.program || null,
        current_semester: data.year_level || 1
      };
      
      return await studentsApi.createStudentWithUser(studentData);
    },
    onSuccess: () => {
      setFormData({
        student_id: '',
        full_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        gender: '',
        address: '',
        enrollment_date: new Date().toISOString().split('T')[0],
        program: '',
        year_level: 1,
        gpa: 0.0,
        is_active: true,
        password: ''
      });
      setDisplayDOB('');
      setTimeout(() => {
        navigate('/dashboard/students');
      }, 1500);
    },
    onError: (error) => {
      console.error('Failed to add student:', error);
      console.error('Error details:', error.response?.data);
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'date_of_birth') {
      setFormData({
        ...formData,
        date_of_birth: value
      });
      setDisplayDOB(formatDateToDisplay(value));
    } else if (name === 'enrollment_date') {
      setFormData({
        ...formData,
        enrollment_date: value
      });
      setDisplayEnrollmentDate(formatDateToDisplay(value));
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : 
                type === 'number' ? parseFloat(value) || 0 : value
      });
    }
  };

  const handleDisplayDOBChange = (e) => {
    const value = e.target.value;
    setDisplayDOB(value);
    if (value.length === 10) {
      setFormData({
        ...formData,
        date_of_birth: formatDateToISO(value)
      });
    }
  };

  const handleDisplayEnrollmentDateChange = (e) => {
    const value = e.target.value;
    setDisplayEnrollmentDate(value);
    if (value.length === 10) {
      setFormData({
        ...formData,
        enrollment_date: formatDateToISO(value)
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/dashboard/students')}
          className="flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Students
        </button>

        <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Add New Student</h1>
              <p className="text-slate-400">Register a new student</p>
            </div>
          </div>

          {mutation.isError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
              {mutation.error?.response?.data?.detail || 'Failed to add student'}
            </div>
          )}

          {mutation.isSuccess && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400">
              Student added successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Student ID
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="student_id"
                    value={formData.student_id}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="e.g., STU001"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Enter full name"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="student@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="123-456-7890"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar 
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 cursor-pointer hover:text-amber-400 transition-colors z-10" 
                    onClick={() => document.getElementById('date_of_birth_picker').showPicker()}
                  />
                  <input
                    type="date"
                    id="date_of_birth_picker"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    className="absolute left-0 top-0 w-11 h-full opacity-0 cursor-pointer z-20"
                    style={{ colorScheme: 'dark' }}
                  />
                  <input
                    type="text"
                    name="display_dob"
                    value={displayDOB}
                    onChange={handleDisplayDOBChange}
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
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    className="absolute left-0 top-0 w-11 h-full opacity-0 cursor-pointer z-20"
                    style={{ colorScheme: 'dark' }}
                    required
                  />
                  <input
                    type="text"
                    name="display_enrollment_date"
                    value={displayEnrollmentDate}
                    onChange={handleDisplayEnrollmentDateChange}
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
                  Program
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="program"
                    value={formData.program}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="e.g., Computer Science"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Year Level
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    name="year_level"
                    value={formData.year_level}
                    onChange={handleChange}
                    min="1"
                    max="6"
                    className="w-full pl-11 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  GPA
                </label>
                <input
                  type="number"
                  name="gpa"
                  value={formData.gpa}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  max="4"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Address
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full pl-11 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                  placeholder="Enter full address"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-slate-300">
                Active Student
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/dashboard/students')}
                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {mutation.isPending ? 'Adding Student...' : 'Add Student'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStudentPage;
