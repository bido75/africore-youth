import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [currentView, setCurrentView] = useState('home');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/api/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const profile = await response.json();
        setUser(profile);
      } else {
        localStorage.removeItem('token');
        setToken(null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setCurrentView('home');
  };

  if (!token) {
    return <AuthScreen setToken={setToken} setUser={setUser} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <Header user={user} logout={logout} currentView={currentView} setCurrentView={setCurrentView} />
      <main className="container mx-auto px-4 py-8">
        {currentView === 'home' && <HomeView user={user} setCurrentView={setCurrentView} />}
        {currentView === 'profile' && <ProfileView user={user} setUser={setUser} token={token} />}
        {currentView === 'discover' && <DiscoverView token={token} setCurrentView={setCurrentView} />}
        {currentView === 'connections' && <ConnectionsView token={token} />}
        {currentView === 'jobs' && <JobsView token={token} user={user} setCurrentView={setCurrentView} />}
        {currentView === 'post-job' && <PostJobView token={token} setCurrentView={setCurrentView} />}
        {currentView === 'my-applications' && <MyApplicationsView token={token} />}
        {currentView === 'organization' && <OrganizationDashboard token={token} user={user} setCurrentView={setCurrentView} />}
        {currentView === 'funding' && <ProjectsView token={token} user={user} setCurrentView={setCurrentView} />}
        {currentView === 'my-projects' && <MyProjectsView token={token} setCurrentView={setCurrentView} />}
        {currentView === 'create-project' && <CreateProjectView token={token} setCurrentView={setCurrentView} />}
        {currentView === 'my-contributions' && <MyContributionsView token={token} />}
        {currentView === 'civic' && <CivicEngagementView token={token} user={user} setCurrentView={setCurrentView} />}
        {currentView === 'create-policy' && <CreatePolicyView token={token} setCurrentView={setCurrentView} />}
        {currentView === 'my-civic-participation' && <MyCivicParticipationView token={token} />}
        {currentView === 'education' && <CoursesView token={token} user={user} setCurrentView={setCurrentView} />}
        {currentView === 'create-course' && <CreateCourseView token={token} setCurrentView={setCurrentView} />}
        {currentView === 'my-courses' && <MyCoursesView token={token} />}
        {currentView === 'mentorship' && <MentorshipView token={token} />}
      </main>
    </div>
  );
}

// Create Policy Component - MISSING IMPLEMENTATION
function CreatePolicyView({ token, setCurrentView }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    proposal_type: '',
    target_location: '',
    expected_impact: '',
    implementation_timeline: '',
    resources_needed: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/api/policies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          supporting_documents: []
        })
      });

      if (response.ok) {
        setMessage('Policy proposal created successfully!');
        setTimeout(() => setCurrentView('civic'), 2000);
      } else {
        const error = await response.json();
        setMessage(error.detail || 'Failed to create policy proposal');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📜 Propose Policy</h2>
      
      {message && (
        <div className={`p-4 rounded-lg mb-4 ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Policy Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              <option value="">Select Category</option>
              <option value="education">Education</option>
              <option value="healthcare">Healthcare</option>
              <option value="environment">Environment</option>
              <option value="economy">Economy</option>
              <option value="technology">Technology</option>
              <option value="infrastructure">Infrastructure</option>
              <option value="social">Social Issues</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Proposal Type</label>
            <select
              name="proposal_type"
              value={formData.proposal_type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              <option value="">Select Type</option>
              <option value="youth_initiative">Youth Initiative</option>
              <option value="policy_reform">Policy Reform</option>
              <option value="new_legislation">New Legislation</option>
              <option value="community_program">Community Program</option>
              <option value="government_feedback">Government Feedback</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Location</label>
            <input
              type="text"
              name="target_location"
              value={formData.target_location}
              onChange={handleChange}
              placeholder="e.g., Nigeria, Lagos State, All of Africa"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Implementation Timeline</label>
            <input
              type="text"
              name="implementation_timeline"
              value={formData.implementation_timeline}
              onChange={handleChange}
              placeholder="e.g., 6 months, 1 year"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Policy Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Expected Impact</label>
          <textarea
            name="expected_impact"
            value={formData.expected_impact}
            onChange={handleChange}
            rows="3"
            placeholder="Describe the positive changes this policy will bring..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Resources Needed</label>
          <textarea
            name="resources_needed"
            value={formData.resources_needed}
            onChange={handleChange}
            rows="3"
            placeholder="What resources, support, or changes are needed to implement this policy?"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Policy Proposal'}
          </button>
          <button
            type="button"
            onClick={() => setCurrentView('civic')}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// My Civic Participation Component - MISSING IMPLEMENTATION
function MyCivicParticipationView({ token }) {
  const [participation, setParticipation] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyCivicParticipation();
  }, []);

  const fetchMyCivicParticipation = async () => {
    try {
      const response = await fetch(`${API_URL}/api/civic_participation`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setParticipation(data.participation || []);
      }
    } catch (error) {
      console.error('Error fetching civic participation:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your civic participation...</p>
        </div>
      </div>
    );
  }

  const supportCount = participation.filter(p => p.participation_type === 'support').length;
  const opposeCount = participation.filter(p => p.participation_type === 'oppose').length;
  const feedbackCount = participation.filter(p => p.participation_type === 'feedback').length;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🗳️ My Civic Participation</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Supported</h3>
          <p className="text-2xl font-bold text-green-600">{supportCount}</p>
          <p className="text-green-700">policies supported</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Opposed</h3>
          <p className="text-2xl font-bold text-red-600">{opposeCount}</p>
          <p className="text-red-700">policies opposed</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-purple-800 mb-2">Feedback</h3>
          <p className="text-2xl font-bold text-purple-600">{feedbackCount}</p>
          <p className="text-purple-700">feedback provided</p>
        </div>
      </div>

      {participation.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🗳️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No civic participation yet</h3>
          <p className="text-gray-600">Start participating in policy discussions to make your voice heard!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {participation.map(item => (
            <div key={item.participation_id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">{item.policy_title}</h3>
                  <p className="text-sm text-gray-600">
                    {item.participation_type === 'support' && '👍 Supported'}
                    {item.participation_type === 'oppose' && '👎 Opposed'}
                    {item.participation_type === 'feedback' && '💬 Provided Feedback'}
                  </p>
                  <p className="text-sm text-gray-500">on {new Date(item.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {item.feedback && (
                <div className="mt-3 bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700"><strong>Your feedback:</strong> {item.feedback}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>

// Education/Courses with Full CRUD
function CoursesView({ token, user, setCurrentView }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_URL}/api/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const enrollInCourse = async (courseId) => {
    try {
      const response = await fetch(`${API_URL}/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      });

      if (response.ok) {
        // Update course enrollment status
        setCourses(courses.map(course => 
          course.course_id === courseId 
            ? { ...course, is_enrolled: true }
            : course
        ));
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesTitle = course.title.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory = categoryFilter === '' || course.category === categoryFilter;
    return matchesTitle && matchesCategory;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading learning opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-4">📚 EduNations</h1>
        <p className="text-xl mb-6">
          Unlock your potential with world-class education. Learn skills, earn credentials, and advance your career across Africa.
        </p>
        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentView('create-course')}
            className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
          >
            Create Course
          </button>
          <button
            onClick={() => setCurrentView('my-courses')}
            className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
          >
            My Courses
          </button>
          <button
            onClick={() => setCurrentView('mentorship')}
            className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
          >
            Mentorship
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        {/* Filters */}
        <div className="mb-6 flex space-x-4">
          <input
            type="text"
            placeholder="Search courses..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option value="technology">Technology</option>
            <option value="business">Business</option>
            <option value="design">Design</option>
            <option value="marketing">Marketing</option>
            <option value="finance">Finance</option>
            <option value="healthcare">Healthcare</option>
            <option value="education">Education</option>
            <option value="agriculture">Agriculture</option>
            <option value="environment">Environment</option>
          </select>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <CourseCard key={course.course_id} course={course} onEnroll={enrollInCourse} />
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No courses found</h3>
            <p className="text-gray-600">Try adjusting your search filters or be the first to create a course!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CourseCard({ course, onEnroll }) {
  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{course.title}</h3>
          <p className="text-sm text-gray-600 mb-2">by {course.instructor_name}</p>
          <span className="inline-block bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs">
            {course.category}
          </span>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">{course.duration}</p>
          <p className="text-sm text-gray-500">{course.difficulty_level}</p>
        </div>
      </div>

      <p className="text-gray-700 mb-4 text-sm line-clamp-3">{course.description}</p>

      {course.skills_covered && course.skills_covered.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-800 mb-2 text-sm">Skills You'll Learn:</h4>
          <div className="flex flex-wrap gap-1">
            {course.skills_covered.slice(0, 3).map((skill, index) => (
              <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                {skill}
              </span>
            ))}
            {course.skills_covered.length > 3 && (
              <span className="text-xs text-gray-500">+{course.skills_covered.length - 3} more</span>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <p className="text-lg font-semibold text-indigo-600">
            {course.price === 0 ? 'Free' : `$${course.price}`}
          </p>
          <p className="text-xs text-gray-500">{course.enrolled_count} students</p>
        </div>
        
        {course.is_enrolled ? (
          <button
            disabled
            className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-medium"
          >
            Enrolled ✓
          </button>
        ) : (
          <button
            onClick={() => onEnroll(course.course_id)}
            className="bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors"
          >
            Enroll Now
          </button>
        )}
      </div>
    </div>
  );
}

// Civic Engagement with Full CRUD
function CivicEngagementView({ token, user, setCurrentView }) {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const response = await fetch(`${API_URL}/api/policies`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPolicies(data.policies || []);
      }
    } catch (error) {
      console.error('Error fetching policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const participateInPolicy = async (policyId, participationType, feedback = '') => {
    try {
      const response = await fetch(`${API_URL}/api/civic_participation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          policy_id: policyId,
          participation_type: participationType,
          feedback: feedback
        })
      });

      if (response.ok) {
        // Update policy participation status
        setPolicies(policies.map(policy => 
          policy.policy_id === policyId 
            ? { ...policy, has_participated: true }
            : policy
        ));
      }
    } catch (error) {
      console.error('Error participating in policy:', error);
    }
  };

  const filteredPolicies = policies.filter(policy => {
    const matchesTitle = policy.title.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory = categoryFilter === '' || policy.category === categoryFilter;
    return matchesTitle && matchesCategory;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading civic engagement opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-4">🏛️ AfriVoice</h1>
        <p className="text-xl mb-6">
          Shape Africa's future through civic engagement. Participate in policy discussions, provide feedback, and make your voice heard.
        </p>
        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentView('create-policy')}
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
          >
            Propose Policy
          </button>
          <button
            onClick={() => setCurrentView('my-civic-participation')}
            className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors"
          >
            My Participation
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        {/* Filters */}
        <div className="mb-6 flex space-x-4">
          <input
            type="text"
            placeholder="Search policies..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option value="education">Education</option>
            <option value="healthcare">Healthcare</option>
            <option value="environment">Environment</option>
            <option value="economy">Economy</option>
            <option value="technology">Technology</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="social">Social Issues</option>
          </select>
        </div>

        {/* Policy Grid */}
        <div className="space-y-6">
          {filteredPolicies.map(policy => (
            <PolicyCard 
              key={policy.policy_id} 
              policy={policy} 
              onParticipate={participateInPolicy} 
            />
          ))}
        </div>

        {filteredPolicies.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏛️</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No policies found</h3>
            <p className="text-gray-600">Try adjusting your search filters or be the first to propose a policy!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PolicyCard({ policy, onParticipate }) {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleVote = (voteType) => {
    onParticipate(policy.policy_id, voteType);
  };

  const handleFeedback = () => {
    if (feedback.trim()) {
      onParticipate(policy.policy_id, 'feedback', feedback);
      setShowFeedbackForm(false);
      setFeedback('');
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{policy.title}</h3>
          <p className="text-sm text-gray-600 mb-2">by {policy.creator_name}</p>
          <div className="flex space-x-2 mb-3">
            <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
              {policy.category}
            </span>
            <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
              {policy.proposal_type}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">
            Target: {policy.target_location}
          </p>
          <p className="text-sm text-gray-500">
            Timeline: {policy.implementation_timeline}
          </p>
        </div>
      </div>

      <p className="text-gray-700 mb-4">{policy.description}</p>

      <div className="mb-4">
        <h4 className="font-medium text-gray-800 mb-2">Expected Impact:</h4>
        <p className="text-sm text-gray-600">{policy.expected_impact}</p>
      </div>

      {policy.resources_needed && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-800 mb-2">Resources Needed:</h4>
          <p className="text-sm text-gray-600">{policy.resources_needed}</p>
        </div>
      )}

      {policy.has_participated ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-green-800 text-sm font-medium">✓ You have participated in this policy discussion</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex space-x-2">
            <button
              onClick={() => handleVote('support')}
              className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              👍 Support
            </button>
            <button
              onClick={() => handleVote('oppose')}
              className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
            >
              👎 Oppose
            </button>
            <button
              onClick={() => setShowFeedbackForm(!showFeedbackForm)}
              className="flex-1 bg-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-600 transition-colors"
            >
              💬 Feedback
            </button>
          </div>

          {showFeedbackForm && (
            <div className="space-y-2">
              <textarea
                placeholder="Share your thoughts and suggestions..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleFeedback}
                  className="flex-1 bg-purple-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-purple-600 transition-colors"
                >
                  Submit Feedback
                </button>
                <button
                  onClick={() => setShowFeedbackForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Authentication Component
function AuthScreen({ setToken, setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    country: '',
    age: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/login' : '/api/register';
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        setToken(data.access_token);
        setUser(data.user);
      } else {
        setError(data.detail || 'Authentication failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center p-4">
      <div className="flex bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full">
        {/* Left side - Branding */}
        <div className="bg-gradient-to-br from-orange-500 to-yellow-500 p-12 flex flex-col justify-center w-1/2">
          <h1 className="text-4xl font-bold text-white mb-4">Welcome to AfriCore</h1>
          <p className="text-orange-100 text-lg mb-8">Pan-African Youth Development & Innovation Network</p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <img src="https://images.unsplash.com/photo-1589736184265-3c5c3dcfe3c0?w=200&h=150&fit=crop" alt="African youth" className="rounded-lg" />
            <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&h=150&fit=crop" alt="African innovation" className="rounded-lg" />
          </div>
          <div className="text-center">
            <p className="text-white font-semibold text-lg">Connect • Collaborate • Create</p>
            <p className="text-orange-100 mt-2">Join thousands of African youth building the future of our continent together.</p>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="w-1/2 p-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {isLogin ? 'Welcome Back!' : 'Join AfriCore'}
          </h2>
          <p className="text-gray-600 mb-8">
            {isLogin ? 'Sign in to your account' : 'Create your profile and connect with African youth'}
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select your country</option>
                    <option value="Algeria">Algeria</option>
                    <option value="Angola">Angola</option>
                    <option value="Benin">Benin</option>
                    <option value="Botswana">Botswana</option>
                    <option value="Burkina Faso">Burkina Faso</option>
                    <option value="Burundi">Burundi</option>
                    <option value="Cameroon">Cameroon</option>
                    <option value="Cape Verde">Cape Verde</option>
                    <option value="Central African Republic">Central African Republic</option>
                    <option value="Chad">Chad</option>
                    <option value="Comoros">Comoros</option>
                    <option value="Congo">Congo</option>
                    <option value="Democratic Republic of Congo">Democratic Republic of Congo</option>
                    <option value="Djibouti">Djibouti</option>
                    <option value="Egypt">Egypt</option>
                    <option value="Equatorial Guinea">Equatorial Guinea</option>
                    <option value="Eritrea">Eritrea</option>
                    <option value="Ethiopia">Ethiopia</option>
                    <option value="Gabon">Gabon</option>
                    <option value="Gambia">Gambia</option>
                    <option value="Ghana">Ghana</option>
                    <option value="Guinea">Guinea</option>
                    <option value="Guinea-Bissau">Guinea-Bissau</option>
                    <option value="Ivory Coast">Ivory Coast</option>
                    <option value="Kenya">Kenya</option>
                    <option value="Lesotho">Lesotho</option>
                    <option value="Liberia">Liberia</option>
                    <option value="Libya">Libya</option>
                    <option value="Madagascar">Madagascar</option>
                    <option value="Malawi">Malawi</option>
                    <option value="Mali">Mali</option>
                    <option value="Mauritania">Mauritania</option>
                    <option value="Mauritius">Mauritius</option>
                    <option value="Morocco">Morocco</option>
                    <option value="Mozambique">Mozambique</option>
                    <option value="Namibia">Namibia</option>
                    <option value="Niger">Niger</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="Rwanda">Rwanda</option>
                    <option value="Sao Tome and Principe">Sao Tome and Principe</option>
                    <option value="Senegal">Senegal</option>
                    <option value="Seychelles">Seychelles</option>
                    <option value="Sierra Leone">Sierra Leone</option>
                    <option value="Somalia">Somalia</option>
                    <option value="South Africa">South Africa</option>
                    <option value="South Sudan">South Sudan</option>
                    <option value="Sudan">Sudan</option>
                    <option value="Swaziland">Swaziland</option>
                    <option value="Tanzania">Tanzania</option>
                    <option value="Togo">Togo</option>
                    <option value="Tunisia">Tunisia</option>
                    <option value="Uganda">Uganda</option>
                    <option value="Zambia">Zambia</option>
                    <option value="Zimbabwe">Zimbabwe</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="25"
                    min="18"
                    max="35"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-orange-500 hover:text-orange-600 font-semibold"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Header Component
function Header({ user, logout, currentView, setCurrentView }) {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">AfriCore</h1>
            </div>
            
            <nav className="flex space-x-6">
              <button
                onClick={() => setCurrentView('home')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'home' ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:text-orange-600'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setCurrentView('discover')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'discover' ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:text-orange-600'
                }`}
              >
                Discover
              </button>
              <button
                onClick={() => setCurrentView('jobs')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'jobs' ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:text-orange-600'
                }`}
              >
                Jobs
              </button>
              <button
                onClick={() => setCurrentView('funding')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'funding' ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:text-orange-600'
                }`}
              >
                Funding
              </button>
              <button
                onClick={() => setCurrentView('civic')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'civic' ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:text-orange-600'
                }`}
              >
                Civic
              </button>
              <button
                onClick={() => setCurrentView('education')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'education' ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:text-orange-600'
                }`}
              >
                Education
              </button>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentView('connections')}
              className="p-2 text-gray-600 hover:text-orange-600 transition-colors"
            >
              <span className="text-lg">👥</span>
            </button>
            <div className="relative">
              <button
                onClick={() => setCurrentView('profile')}
                className="flex items-center space-x-2 p-2 text-gray-600 hover:text-orange-600 transition-colors"
              >
                <span className="text-lg">👤</span>
                <span className="font-medium">{user?.full_name || 'Profile'}</span>
              </button>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// Home View
function HomeView({ user, setCurrentView }) {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          Welcome to AfriCore, {user?.full_name}! 🌍
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your gateway to connecting with African youth, finding opportunities, and building the future of our continent.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Connect</h3>
            <p className="text-gray-600 mb-4">Build meaningful relationships with fellow African youth across the continent.</p>
            <button
              onClick={() => setCurrentView('discover')}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              Start Connecting
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-4xl mb-4">💼</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Opportunities</h3>
            <p className="text-gray-600 mb-4">Discover jobs, internships, and entrepreneurial opportunities designed for African youth.</p>
            <button
              onClick={() => setCurrentView('jobs')}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              Explore Jobs
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-4xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Impact</h3>
            <p className="text-gray-600 mb-4">Fund and support impactful projects that create positive change across Africa.</p>
            <button
              onClick={() => setCurrentView('funding')}
              className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              Make Impact
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-6 text-center">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setCurrentView('profile')}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 p-4 rounded-lg transition-colors"
          >
            <div className="text-2xl mb-2">👤</div>
            <div className="font-semibold">Update Profile</div>
          </button>
          <button
            onClick={() => setCurrentView('civic')}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 p-4 rounded-lg transition-colors"
          >
            <div className="text-2xl mb-2">🏛️</div>
            <div className="font-semibold">Civic Engagement</div>
          </button>
          <button
            onClick={() => setCurrentView('education')}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 p-4 rounded-lg transition-colors"
          >
            <div className="text-2xl mb-2">📚</div>
            <div className="font-semibold">Learn & Grow</div>
          </button>
          <button
            onClick={() => setCurrentView('create-project')}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 p-4 rounded-lg transition-colors"
          >
            <div className="text-2xl mb-2">🚀</div>
            <div className="font-semibold">Start Project</div>
          </button>
        </div>
      </div>
    </div>
  );
}

// Profile Management with Full CRUD
function ProfileView({ user, setUser, token }) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    country: user?.country || '',
    age: user?.age || '',
    bio: user?.bio || '',
    skills: user?.skills || [],
    interests: user?.interests || [],
    linkedin: user?.linkedin || '',
    github: user?.github || '',
    website: user?.website || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleArrayChange = (field, value) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData({
      ...formData,
      [field]: items
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/api/profile/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setEditMode(false);
        setMessage('Profile updated successfully!');
      } else {
        const error = await response.json();
        setMessage(error.detail || 'Failed to update profile');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (editMode) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">✏️ Edit Profile</h2>
        
        {message && (
          <div className={`p-4 rounded-lg mb-4 ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                min="18"
                max="35"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/yourprofile"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GitHub</label>
              <input
                type="url"
                name="github"
                value={formData.github}
                onChange={handleChange}
                placeholder="https://github.com/yourusername"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://yourwebsite.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              placeholder="Tell us about yourself..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Skills (comma-separated)</label>
            <input
              type="text"
              value={formData.skills.join(', ')}
              onChange={(e) => handleArrayChange('skills', e.target.value)}
              placeholder="JavaScript, Python, Leadership, Marketing"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Interests (comma-separated)</label>
            <input
              type="text"
              value={formData.interests.join(', ')}
              onChange={(e) => handleArrayChange('interests', e.target.value)}
              placeholder="Technology, Environment, Education, Arts"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">👤 My Profile</h2>
        <button
          onClick={() => setEditMode(true)}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
        >
          Edit Profile
        </button>
      </div>

      {message && (
        <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-4">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <p className="text-lg text-gray-900">{user?.full_name}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
          <p className="text-lg text-gray-900">{user?.country}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
          <p className="text-lg text-gray-900">{user?.age} years old</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <p className="text-lg text-gray-900">{user?.email}</p>
        </div>
      </div>

      {user?.bio && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
          <p className="text-gray-900">{user.bio}</p>
        </div>
      )}

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
        <div className="flex flex-wrap gap-2">
          {user?.skills?.length > 0 ? (
            user.skills.map((skill, index) => (
              <span key={index} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                {skill}
              </span>
            ))
          ) : (
            <span className="text-gray-500">No skills added yet. Edit your profile to add skills.</span>
          )}
        </div>
      </div>

      {user?.interests?.length > 0 && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
          <div className="flex flex-wrap gap-2">
            {user.interests.map((interest, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex space-x-4">
        {user?.linkedin && (
          <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
            LinkedIn
          </a>
        )}
        {user?.github && (
          <a href={user.github} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-800">
            GitHub
          </a>
        )}
        {user?.website && (
          <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-800">
            Website
          </a>
        )}
      </div>
    </div>
  );
}

// User Discovery with Full CRUD
function DiscoverView({ token, setCurrentView }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectWithUser = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/api/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ user_id: userId })
      });

      if (response.ok) {
        // Update the user's connection status
        setUsers(users.map(user => 
          user.user_id === userId 
            ? { ...user, connection_status: 'pending' }
            : user
        ));
      }
    } catch (error) {
      console.error('Error connecting with user:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesName = user.full_name.toLowerCase().includes(filter.toLowerCase());
    const matchesCountry = countryFilter === '' || user.country === countryFilter;
    return matchesName && matchesCountry;
  });

  const countries = [...new Set(users.map(user => user.country))].sort();

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading amazing African youth...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">🌍 Discover African Youth</h2>
        <button
          onClick={() => setCurrentView('connections')}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
        >
          View Connections
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex space-x-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="">All Countries</option>
          {countries.map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
      </div>

      {/* User Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map(user => (
          <div key={user.user_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-800">{user.full_name}</h3>
                <p className="text-sm text-gray-600">{user.country}</p>
                <p className="text-sm text-gray-500">{user.age} years old</p>
              </div>
              <span className="text-2xl">👤</span>
            </div>

            {user.bio && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{user.bio}</p>
            )}

            {user.skills && user.skills.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  {user.skills.slice(0, 3).map((skill, index) => (
                    <span key={index} className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                  {user.skills.length > 3 && (
                    <span className="text-xs text-gray-500">+{user.skills.length - 3} more</span>
                  )}
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              {user.connection_status === 'connected' ? (
                <button
                  disabled
                  className="flex-1 bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm font-medium"
                >
                  Connected ✓
                </button>
              ) : user.connection_status === 'pending' ? (
                <button
                  disabled
                  className="flex-1 bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg text-sm font-medium"
                >
                  Pending...
                </button>
              ) : (
                <button
                  onClick={() => connectWithUser(user.user_id)}
                  className="flex-1 bg-orange-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                >
                  Connect
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No users found</h3>
          <p className="text-gray-600">Try adjusting your search filters.</p>
        </div>
      )}
    </div>
  );
}

// Connections Management
function ConnectionsView({ token }) {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await fetch(`${API_URL}/api/connections`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConnections(data.connections || []);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeConnection = async (connectionId) => {
    try {
      const response = await fetch(`${API_URL}/api/connections/${connectionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setConnections(connections.filter(conn => conn.connection_id !== connectionId));
      }
    } catch (error) {
      console.error('Error removing connection:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">👥 My Connections</h2>

      {connections.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No connections yet</h3>
          <p className="text-gray-600">Start connecting with amazing African youth to build your network!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {connections.map(connection => (
            <div key={connection.connection_id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">{connection.full_name}</h3>
                  <p className="text-sm text-gray-600">{connection.country}</p>
                  <p className="text-sm text-gray-500">Connected {new Date(connection.created_at).toLocaleDateString()}</p>
                </div>
                <span className="text-2xl">🤝</span>
              </div>

              {connection.bio && (
                <p className="text-sm text-gray-600 mb-3">{connection.bio}</p>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={() => removeConnection(connection.connection_id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove Connection
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Jobs Platform with Full CRUD
function JobsView({ token, user, setCurrentView }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${API_URL}/api/jobs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyForJob = async (jobId) => {
    try {
      const response = await fetch(`${API_URL}/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cover_letter: 'I am interested in this position and would like to apply.',
          portfolio_links: ''
        })
      });

      if (response.ok) {
        // Update job application status
        setJobs(jobs.map(job => 
          job.job_id === jobId 
            ? { ...job, has_applied: true }
            : job
        ));
      }
    } catch (error) {
      console.error('Error applying for job:', error);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesTitle = job.title.toLowerCase().includes(filter.toLowerCase());
    const matchesType = typeFilter === '' || job.job_type === typeFilter;
    return matchesTitle && matchesType;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-4">💼 AfriWorkMesh</h1>
        <p className="text-xl mb-6">
          Discover amazing job opportunities across Africa. From tech startups to NGOs, find your perfect career match.
        </p>
        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentView('organization')}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Post a Job
          </button>
          <button
            onClick={() => setCurrentView('my-applications')}
            className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
          >
            My Applications
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        {/* Filters */}
        <div className="mb-6 flex space-x-4">
          <input
            type="text"
            placeholder="Search jobs..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="full_time">Full Time</option>
            <option value="part_time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>
        </div>

        {/* Job Listings */}
        <div className="space-y-4">
          {filteredJobs.map(job => (
            <div key={job.job_id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{job.title}</h3>
                  <p className="text-gray-600 mb-2">{job.organization_name}</p>
                  <div className="flex space-x-4 text-sm text-gray-500">
                    <span>{job.location}</span>
                    <span>{job.job_type}</span>
                    <span>{job.salary_range}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mb-2">
                    {job.job_category}
                  </span>
                  <p className="text-sm text-gray-500">Posted {new Date(job.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{job.description}</p>

              {job.skills_required && job.skills_required.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-800 mb-2">Required Skills:</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.skills_required.map((skill, index) => (
                      <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Experience: {job.experience_level}</span>
                {job.has_applied ? (
                  <button
                    disabled
                    className="bg-green-100 text-green-800 px-6 py-2 rounded-lg font-medium"
                  >
                    Applied ✓
                  </button>
                ) : (
                  <button
                    onClick={() => applyForJob(job.job_id)}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                  >
                    Apply Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💼</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No jobs found</h3>
            <p className="text-gray-600">Try adjusting your search filters or check back later for new opportunities.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// My Applications View
function MyApplicationsView({ token }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch(`${API_URL}/api/applications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📄 My Applications</h2>

      {applications.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No applications yet</h3>
          <p className="text-gray-600">Start applying for jobs to see your applications here!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map(application => (
            <div key={application.application_id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">{application.job_title}</h3>
                  <p className="text-sm text-gray-600">{application.organization_name}</p>
                  <p className="text-sm text-gray-500">Applied {new Date(application.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                  application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {application.status}
                </span>
              </div>

              {application.cover_letter && (
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Cover Letter:</strong> {application.cover_letter}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Organization Dashboard
function OrganizationDashboard({ token, user, setCurrentView }) {
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  useEffect(() => {
    checkOrganization();
  }, []);

  const checkOrganization = async () => {
    try {
      const response = await fetch(`${API_URL}/api/organizations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Check if user has an organization
        const userOrg = data.organizations.find(org => org.created_by === user.user_id);
        if (userOrg) {
          setOrganization(userOrg);
        } else {
          setShowRegistrationForm(true);
        }
      }
    } catch (error) {
      console.error('Error checking organization:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading organization details...</p>
        </div>
      </div>
    );
  }

  if (showRegistrationForm) {
    return <OrganizationRegistration token={token} onSuccess={checkOrganization} />;
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🏢 Organization Dashboard</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{organization?.name}</h3>
        <p className="text-gray-600">{organization?.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-2">Organization Details</h4>
          <div className="space-y-2 text-sm">
            <p><strong>Type:</strong> {organization?.organization_type}</p>
            <p><strong>Country:</strong> {organization?.country}</p>
            <p><strong>Size:</strong> {organization?.size}</p>
            <p><strong>Founded:</strong> {organization?.founded_year}</p>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-2">Quick Actions</h4>
          <div className="space-y-2">
            <button
              onClick={() => setCurrentView('post-job')}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Post New Job
            </button>
            <button
              onClick={() => setCurrentView('manage-applications')}
              className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Manage Applications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Organization Registration Component
function OrganizationRegistration({ token, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    organization_type: '',
    country: '',
    website: '',
    contact_email: '',
    contact_phone: '',
    size: '',
    founded_year: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/organization/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onSuccess();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to register organization');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🏢 Register Your Organization</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Organization Type</label>
            <select
              name="organization_type"
              value={formData.organization_type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Type</option>
              <option value="startup">Startup</option>
              <option value="ngo">NGO</option>
              <option value="government">Government</option>
              <option value="corporation">Corporation</option>
              <option value="non_profit">Non-Profit</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
            <select
              name="size"
              value={formData.size}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Size</option>
              <option value="1-10 employees">1-10 employees</option>
              <option value="11-50 employees">11-50 employees</option>
              <option value="51-200 employees">51-200 employees</option>
              <option value="201-1000 employees">201-1000 employees</option>
              <option value="1000+ employees">1000+ employees</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Founded Year</label>
            <input
              type="number"
              name="founded_year"
              value={formData.founded_year}
              onChange={handleChange}
              min="1900"
              max="2024"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
            <input
              type="email"
              name="contact_email"
              value={formData.contact_email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
            <input
              type="tel"
              name="contact_phone"
              value={formData.contact_phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Register Organization'}
        </button>
      </form>
    </div>
  );
}

export default App;

// Post Job Component
function PostJobView({ token, setCurrentView }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    job_type: '',
    job_category: '',
    location_type: '',
    location: '',
    salary_range: '',
    skills_required: '',
    experience_level: '',
    benefits: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const jobData = {
        ...formData,
        requirements: formData.requirements.split('\n').filter(req => req.trim()),
        skills_required: formData.skills_required.split(',').map(skill => skill.trim()).filter(skill => skill)
      };

      const response = await fetch(`${API_URL}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(jobData)
      });

      if (response.ok) {
        setMessage('Job posted successfully!');
        setTimeout(() => setCurrentView('jobs'), 2000);
      } else {
        const error = await response.json();
        setMessage(error.detail || 'Failed to post job');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📝 Post New Job</h2>
      
      {message && (
        <div className={`p-4 rounded-lg mb-4 ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Category</label>
            <select
              name="job_category"
              value={formData.job_category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Category</option>
              <option value="technology">Technology</option>
              <option value="healthcare">Healthcare</option>
              <option value="education">Education</option>
              <option value="finance">Finance</option>
              <option value="marketing">Marketing</option>
              <option value="design">Design</option>
              <option value="agriculture">Agriculture</option>
              <option value="environment">Environment</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
            <select
              name="job_type"
              value={formData.job_type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Type</option>
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location Type</label>
            <select
              name="location_type"
              value={formData.location_type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Location Type</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="on_site">On-site</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City, Country or 'Remote'"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
            <select
              name="experience_level"
              value={formData.experience_level}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Experience Level</option>
              <option value="Entry-level">Entry-level</option>
              <option value="Mid-level">Mid-level</option>
              <option value="Senior-level">Senior-level</option>
              <option value="Executive">Executive</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Requirements (one per line)</label>
          <textarea
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            rows="4"
            placeholder="Bachelor's degree in relevant field&#10;2+ years of experience&#10;Excellent communication skills"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Skills Required (comma-separated)</label>
            <input
              type="text"
              name="skills_required"
              value={formData.skills_required}
              onChange={handleChange}
              placeholder="JavaScript, Python, Communication"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
            <input
              type="text"
              name="salary_range"
              value={formData.salary_range}
              onChange={handleChange}
              placeholder="$50,000 - $70,000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Benefits</label>
          <textarea
            name="benefits"
            value={formData.benefits}
            onChange={handleChange}
            rows="3"
            placeholder="Health insurance, flexible working hours, professional development opportunities"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Post Job'}
          </button>
          <button
            type="button"
            onClick={() => setCurrentView('organization')}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// Projects/Crowdfunding with Full CRUD
function ProjectsView({ token, user, setCurrentView }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_URL}/api/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const contributeToProject = async (projectId, amount) => {
    try {
      const response = await fetch(`${API_URL}/api/contributions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          project_id: projectId,
          amount: amount,
          payment_method: 'online'
        })
      });

      if (response.ok) {
        // Refresh projects to get updated funding amounts
        fetchProjects();
      }
    } catch (error) {
      console.error('Error contributing to project:', error);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesTitle = project.title.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory = categoryFilter === '' || project.category === categoryFilter;
    return matchesTitle && matchesCategory;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading impactful projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-4">🌱 AfriFund DAO</h1>
        <p className="text-xl mb-6">
          Fund impactful projects across Africa. Support innovation, education, environment, and community development led by African youth.
        </p>
        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentView('create-project')}
            className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
          >
            Create Project
          </button>
          <button
            onClick={() => setCurrentView('my-projects')}
            className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
          >
            My Projects
          </button>
          <button
            onClick={() => setCurrentView('my-contributions')}
            className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
          >
            My Contributions
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        {/* Filters */}
        <div className="mb-6 flex space-x-4">
          <input
            type="text"
            placeholder="Search projects..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option value="education">Education</option>
            <option value="environment">Environment</option>
            <option value="technology">Technology</option>
            <option value="healthcare">Healthcare</option>
            <option value="agriculture">Agriculture</option>
            <option value="community">Community</option>
            <option value="arts">Arts & Culture</option>
          </select>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <ProjectCard key={project.project_id} project={project} onContribute={contributeToProject} />
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No projects found</h3>
            <p className="text-gray-600">Try adjusting your search filters or be the first to create a project!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project, onContribute }) {
  const [showContributeForm, setShowContributeForm] = useState(false);
  const [amount, setAmount] = useState('');

  const handleContribute = () => {
    if (amount && parseFloat(amount) > 0) {
      onContribute(project.project_id, parseFloat(amount));
      setShowContributeForm(false);
      setAmount('');
    }
  };

  const progressPercentage = project.funding_goal > 0 
    ? Math.min((project.current_funding / project.funding_goal) * 100, 100)
    : 0;

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{project.title}</h3>
          <p className="text-sm text-gray-600 mb-2">by {project.creator_name}</p>
          <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
            {project.category}
          </span>
        </div>
      </div>

      <p className="text-gray-700 mb-4 text-sm line-clamp-3">{project.description}</p>

      {/* Funding Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>${project.current_funding.toLocaleString()} raised</span>
          <span>Goal: ${project.funding_goal.toLocaleString()}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">{progressPercentage.toFixed(1)}% funded</p>
      </div>

      {!showContributeForm ? (
        <button
          onClick={() => setShowContributeForm(true)}
          className="w-full bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
        >
          Contribute Now
        </button>
      ) : (
        <div className="space-y-2">
          <input
            type="number"
            placeholder="Amount ($)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <div className="flex space-x-2">
            <button
              onClick={handleContribute}
              className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-600 transition-colors"
            >
              Contribute
            </button>
            <button
              onClick={() => setShowContributeForm(false)}
              className="flex-1 bg-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Create Project Component
function CreateProjectView({ token, setCurrentView }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    funding_goal: '',
    timeline: '',
    impact_goals: '',
    required_resources: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const projectData = {
        ...formData,
        funding_goal: parseFloat(formData.funding_goal),
        impact_goals: formData.impact_goals.split('\n').filter(goal => goal.trim()),
        required_resources: formData.required_resources.split('\n').filter(resource => resource.trim())
      };

      const response = await fetch(`${API_URL}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(projectData)
      });

      if (response.ok) {
        setMessage('Project created successfully!');
        setTimeout(() => setCurrentView('funding'), 2000);
      } else {
        const error = await response.json();
        setMessage(error.detail || 'Failed to create project');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🚀 Create Impact Project</h2>
      
      {message && (
        <div className={`p-4 rounded-lg mb-4 ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="">Select Category</option>
              <option value="education">Education</option>
              <option value="environment">Environment</option>
              <option value="technology">Technology</option>
              <option value="healthcare">Healthcare</option>
              <option value="agriculture">Agriculture</option>
              <option value="community">Community</option>
              <option value="arts">Arts & Culture</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Funding Goal ($)</label>
            <input
              type="number"
              name="funding_goal"
              value={formData.funding_goal}
              onChange={handleChange}
              min="100"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timeline</label>
            <input
              type="text"
              name="timeline"
              value={formData.timeline}
              onChange={handleChange}
              placeholder="e.g., 6 months"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Project Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Impact Goals (one per line)</label>
          <textarea
            name="impact_goals"
            value={formData.impact_goals}
            onChange={handleChange}
            rows="4"
            placeholder="Educate 500 youth in digital skills&#10;Create 50 sustainable jobs&#10;Reduce carbon footprint by 20%"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Required Resources (one per line)</label>
          <textarea
            name="required_resources"
            value={formData.required_resources}
            onChange={handleChange}
            rows="4"
            placeholder="Laptops and equipment&#10;Training materials&#10;Venue rental&#10;Expert facilitators"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
          <button
            type="button"
            onClick={() => setCurrentView('funding')}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// My Projects Component
function MyProjectsView({ token, setCurrentView }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyProjects();
  }, []);

  const fetchMyProjects = async () => {
    try {
      const response = await fetch(`${API_URL}/api/projects/my`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Error fetching my projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const response = await fetch(`${API_URL}/api/projects/${projectId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setProjects(projects.filter(project => project.project_id !== projectId));
        }
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">🚀 My Projects</h2>
        <button
          onClick={() => setCurrentView('create-project')}
          className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors"
        >
          Create New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚀</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No projects yet</h3>
          <p className="text-gray-600">Create your first impact project to start making a difference!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map(project => (
            <div key={project.project_id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{project.title}</h3>
                  <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    {project.category}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => deleteProject(project.project_id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{project.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-800">Funding Goal:</span>
                  <p className="text-gray-600">${project.funding_goal.toLocaleString()}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-800">Current Funding:</span>
                  <p className="text-gray-600">${project.current_funding.toLocaleString()}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-800">Timeline:</span>
                  <p className="text-gray-600">{project.timeline}</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>${project.current_funding.toLocaleString()} raised</span>
                  <span>{((project.current_funding / project.funding_goal) * 100).toFixed(1)}% funded</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((project.current_funding / project.funding_goal) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// My Contributions Component
function MyContributionsView({ token }) {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyContributions();
  }, []);

  const fetchMyContributions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/contributions/my`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setContributions(data.contributions || []);
      }
    } catch (error) {
      console.error('Error fetching contributions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your contributions...</p>
        </div>
      </div>
    );
  }

  const totalContributed = contributions.reduce((sum, contribution) => sum + contribution.amount, 0);

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">💝 My Contributions</h2>

      <div className="bg-green-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-green-800 mb-2">Total Impact</h3>
        <p className="text-2xl font-bold text-green-600">${totalContributed.toLocaleString()}</p>
        <p className="text-green-700">contributed to {contributions.length} projects</p>
      </div>

      {contributions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💝</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No contributions yet</h3>
          <p className="text-gray-600">Start contributing to impactful projects to see your impact here!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contributions.map(contribution => (
            <div key={contribution.contribution_id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">{contribution.project_title}</h3>
                  <p className="text-sm text-gray-600">Contributed ${contribution.amount.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">on {new Date(contribution.created_at).toLocaleDateString()}</p>
                </div>
                <span className="text-2xl">💚</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}