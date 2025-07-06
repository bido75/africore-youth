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
        {currentView === 'my-applications' && <MyApplicationsView token={token} />}
        {currentView === 'organization' && <OrganizationView token={token} user={user} setCurrentView={setCurrentView} />}
        {currentView === 'post-job' && <PostJobView token={token} setCurrentView={setCurrentView} />}
        {currentView === 'manage-applications' && <ManageApplicationsView token={token} />}
        {currentView === 'funding' && <FundingView token={token} user={user} setCurrentView={setCurrentView} />}
        {currentView === 'my-projects' && <MyProjectsView token={token} setCurrentView={setCurrentView} />}
        {currentView === 'create-project' && <CreateProjectView token={token} setCurrentView={setCurrentView} />}
        {currentView === 'my-contributions' && <MyContributionsView token={token} />}
        {currentView === 'civic' && <CivicView token={token} user={user} setCurrentView={setCurrentView} />}
        {currentView === 'my-civic' && <MyCivicParticipationView token={token} setCurrentView={setCurrentView} />}
        {currentView === 'create-policy' && <CreatePolicyView token={token} setCurrentView={setCurrentView} />}
        {currentView === 'civic-forums' && <CivicForumsView token={token} setCurrentView={setCurrentView} />}
        {currentView === 'education' && <EducationView token={token} user={user} setCurrentView={setCurrentView} />}
        {currentView === 'my-courses' && <MyCoursesView token={token} setCurrentView={setCurrentView} />}
        {currentView === 'create-course' && <CreateCourseView token={token} setCurrentView={setCurrentView} />}
        {currentView === 'mentorship' && <MentorshipView token={token} setCurrentView={setCurrentView} />}
      </main>
    </div>
  );
}

function AuthScreen({ setToken, setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    country: '',
    age: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/login' : '/api/register';
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(isLogin ? 
          { email: formData.email, password: formData.password } : 
          { ...formData, age: parseInt(formData.age) }
        ),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        setToken(data.access_token);
        
        // Fetch profile after login/register
        const profileResponse = await fetch(`${API_URL}/api/profile`, {
          headers: {
            'Authorization': `Bearer ${data.access_token}`
          }
        });
        if (profileResponse.ok) {
          const profile = await profileResponse.json();
          setUser(profile);
        }
      } else {
        const error = await response.json();
        alert(error.detail || 'Authentication failed');
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert('Network error. Please try again.');
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
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-yellow-400 to-orange-500 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Left side - Hero */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-orange-500 to-yellow-500 p-12 flex-col justify-center items-center text-white">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome to AfriCore</h1>
            <p className="text-xl mb-8">Pan-African Youth Development & Innovation Network</p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <img 
                src="https://images.pexels.com/photos/11153505/pexels-photo-11153505.jpeg" 
                alt="African youth collaboration" 
                className="rounded-lg shadow-lg h-24 w-full object-cover"
              />
              <img 
                src="https://images.unsplash.com/photo-1527203561188-dae1bc1a417f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwzfHxBZnJpY2FuJTIweW91dGh8ZW58MHx8fG9yYW5nZXwxNzUxNzU1MjQ5fDA&ixlib=rb-4.1.0&q=85" 
                alt="African youth" 
                className="rounded-lg shadow-lg h-24 w-full object-cover"
              />
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3">Connect • Collaborate • Create</h3>
              <p className="text-sm">Join thousands of African youth building the future of our continent together</p>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="w-full md:w-1/2 p-8">
          <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {isLogin ? 'Welcome Back!' : 'Join AfriCore'}
            </h2>
            <p className="text-gray-600 mb-8">
              {isLogin ? 'Sign in to your account' : 'Create your profile and connect with African youth'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="••••••••"
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
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Select your country</option>
                      <option value="Nigeria">Nigeria</option>
                      <option value="Kenya">Kenya</option>
                      <option value="Ghana">Ghana</option>
                      <option value="South Africa">South Africa</option>
                      <option value="Ethiopia">Ethiopia</option>
                      <option value="Egypt">Egypt</option>
                      <option value="Morocco">Morocco</option>
                      <option value="Uganda">Uganda</option>
                      <option value="Tanzania">Tanzania</option>
                      <option value="Algeria">Algeria</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      required
                      min="16"
                      max="35"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="25"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-orange-600 hover:to-yellow-600 transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            <p className="text-center text-gray-600 mt-6">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-orange-500 hover:text-orange-600 font-medium"
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

function Header({ user, logout, currentView, setCurrentView }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-lg border-b-4 border-orange-400">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold text-orange-600">AfriCore</div>
            <div className="hidden md:flex space-x-4">
              <button
                onClick={() => setCurrentView('home')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'home' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:text-orange-600'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setCurrentView('discover')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'discover' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:text-orange-600'
                }`}
              >
                Discover
              </button>
              <button
                onClick={() => setCurrentView('jobs')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'jobs' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Jobs
              </button>
              <button
                onClick={() => setCurrentView('funding')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'funding' ? 'bg-green-500 text-white' : 'text-gray-600 hover:text-green-600'
                }`}
              >
                Funding
              </button>
              <button
                onClick={() => setCurrentView('civic')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'civic' ? 'bg-purple-500 text-white' : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                Civic
              </button>
              <button
                onClick={() => setCurrentView('education')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'education' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Education
              </button>
              <button
                onClick={() => setCurrentView('connections')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'connections' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:text-orange-600'
                }`}
              >
                Connections
              </button>
              <button
                onClick={() => setCurrentView('organization')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'organization' ? 'bg-green-500 text-white' : 'text-gray-600 hover:text-green-600'
                }`}
              >
                Employer
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentView('profile')}
              className="flex items-center space-x-2 bg-orange-100 hover:bg-orange-200 px-4 py-2 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full flex items-center justify-center text-white font-bold">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <span className="hidden md:block font-medium text-gray-700">{user?.full_name}</span>
            </button>
            <button
              onClick={logout}
              className="text-gray-600 hover:text-red-600 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function HomeView({ user, setCurrentView }) {
  const [stats, setStats] = useState({
    totalJobs: 0,
    recommendedJobs: 0,
    applications: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setStats({
        totalJobs: 150,
        recommendedJobs: 8,
        applications: 3
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-2/3">
            <h1 className="text-4xl font-bold mb-4">Welcome back, {user?.full_name}!</h1>
            <p className="text-xl mb-6">
              Connect with African youth across the continent and discover amazing opportunities. Build your network, learn new skills, fund projects, and engage in civic activities together.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setCurrentView('jobs')}
                className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
              >
                Find Jobs
              </button>
              <button
                onClick={() => setCurrentView('funding')}
                className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
              >
                Fund Projects
              </button>
              <button
                onClick={() => setCurrentView('education')}
                className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
              >
                Learn Skills
              </button>
              <button
                onClick={() => setCurrentView('civic')}
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors"
              >
                Civic Engagement
              </button>
            </div>
          </div>
          <div className="md:w-1/3 mt-6 md:mt-0">
            <img 
              src="https://images.pexels.com/photos/14973290/pexels-photo-14973290.jpeg" 
              alt="African youth collaboration" 
              className="rounded-lg shadow-lg w-full h-48 object-cover"
            />
          </div>
        </div>
      </div>

      {/* Platform Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-orange-400 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 font-medium">Youth Network</p>
              <p className="text-2xl font-bold text-gray-800">{user?.country}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🤝</span>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('discover')}
            className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Connect
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-blue-400 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 font-medium">Jobs & Opportunities</p>
              <p className="text-2xl font-bold text-gray-800">{stats.recommendedJobs}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💼</span>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('jobs')}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Explore Jobs
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-green-400 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 font-medium">Fund Projects</p>
              <p className="text-2xl font-bold text-gray-800">$125K+</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('funding')}
            className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            Fund Impact
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-purple-400 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 font-medium">Civic Engagement</p>
              <p className="text-2xl font-bold text-gray-800">45</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🗳️</span>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('civic')}
            className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition-colors"
          >
            Get Involved
          </button>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-white rounded-xl p-8 shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">🚀 Your Journey Starts Here</h2>
        <p className="text-gray-600 mb-6">
          AfriCore is your all-in-one platform for networking, career development, project funding, civic engagement, and learning. Join thousands of African youth creating positive change.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
            <h3 className="text-xl font-bold mb-2">🎓 EduNations</h3>
            <p className="mb-4">Learn new skills, earn certifications, and advance your career with expert-led courses.</p>
            <button
              onClick={() => setCurrentView('education')}
              className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Start Learning
            </button>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
            <h3 className="text-xl font-bold mb-2">🗳️ AfriVoice</h3>
            <p className="mb-4">Participate in governance, shape policies, and make your voice heard in democratic processes.</p>
            <button
              onClick={() => setCurrentView('civic')}
              className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
            >
              Engage Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Placeholder components for all features - these would be expanded with full functionality
function ProfileView({ user, setUser, token }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">👤 My Profile</h2>
      <div className="space-y-4">
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
        <div>
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
      </div>
    </div>
  );
}

function DiscoverView({ token, setCurrentView }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">🌍 Discover African Youth</h2>
      <p className="text-gray-600 mb-6">Connect with amazing young people across Africa. Build your network and collaborate on projects.</p>
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🤝</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Youth Discovery Coming Soon!</h3>
        <p className="text-gray-600">We're building an amazing way for you to connect with fellow African youth.</p>
      </div>
    </div>
  );
}

function ConnectionsView({ token }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">👥 My Connections</h2>
      <p className="text-gray-600 mb-6">Manage your connections and build meaningful relationships.</p>
      <div className="text-center py-12">
        <div className="text-6xl mb-4">👥</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Connections Coming Soon!</h3>
        <p className="text-gray-600">Your network will appear here once you start connecting with other youth.</p>
      </div>
    </div>
  );
}

function JobsView({ token, user, setCurrentView }) {
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
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💼</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Job Platform Coming Soon!</h3>
          <p className="text-gray-600">We're building an amazing job marketplace for African youth.</p>
        </div>
      </div>
    </div>
  );
}

function MyApplicationsView({ token }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">📄 My Applications</h2>
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📄</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Applications Yet</h3>
        <p className="text-gray-600">Your job applications will appear here.</p>
      </div>
    </div>
  );
}

function OrganizationView({ token, user, setCurrentView }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">🏢 Organization Portal</h2>
      <p className="text-gray-600 mb-6">Register your organization to post jobs and connect with talented African youth.</p>
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏢</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Organization Portal Coming Soon!</h3>
        <p className="text-gray-600">Post jobs and find amazing talent across Africa.</p>
      </div>
    </div>
  );
}

function PostJobView({ token, setCurrentView }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">📝 Post Job</h2>
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Job Posting Coming Soon!</h3>
        <p className="text-gray-600">Create job opportunities for African youth.</p>
      </div>
    </div>
  );
}

function ManageApplicationsView({ token }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Manage Applications</h2>
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Application Management Coming Soon!</h3>
        <p className="text-gray-600">Review and manage job applications from talented youth.</p>
      </div>
    </div>
  );
}

function FundingView({ token, user, setCurrentView }) {
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
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🌱</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Crowdfunding Platform Coming Soon!</h3>
          <p className="text-gray-600">Fund amazing projects that create positive impact across Africa.</p>
        </div>
      </div>
    </div>
  );
}

function MyProjectsView({ token, setCurrentView }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 My Projects</h2>
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Projects Yet</h3>
        <p className="text-gray-600">Create your first impactful project to get started.</p>
      </div>
    </div>
  );
}

function CreateProjectView({ token, setCurrentView }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">🌱 Create Project</h2>
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🌱</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Project Creation Coming Soon!</h3>
        <p className="text-gray-600">Create impactful projects that can change communities.</p>
      </div>
    </div>
  );
}

function MyContributionsView({ token }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">💰 My Contributions</h2>
      <div className="text-center py-12">
        <div className="text-6xl mb-4">💰</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Contributions Yet</h3>
        <p className="text-gray-600">Start supporting amazing projects to track your impact here.</p>
      </div>
    </div>
  );
}

function CivicView({ token, user, setCurrentView }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-4">🗳️ AfriVoice</h1>
        <p className="text-xl mb-6">
          Your voice matters! Engage in policy discussions, provide feedback on governance, and help shape the future of Africa through democratic participation.
        </p>
        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentView('create-policy')}
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
          >
            Propose Policy
          </button>
          <button
            onClick={() => setCurrentView('my-civic')}
            className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors"
          >
            My Participation
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🗳️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Civic Engagement Platform Coming Soon!</h3>
          <p className="text-gray-600">Participate in governance and shape policies that affect African youth.</p>
        </div>
      </div>
    </div>
  );
}

function MyCivicParticipationView({ token, setCurrentView }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">🏆 My Civic Participation</h2>
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏆</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Civic Activity Yet</h3>
        <p className="text-gray-600">Start participating in civic discussions to track your engagement.</p>
      </div>
    </div>
  );
}

function CreatePolicyView({ token, setCurrentView }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">🗳️ Create Policy</h2>
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🗳️</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Policy Creation Coming Soon!</h3>
        <p className="text-gray-600">Propose policies that can improve governance and society.</p>
      </div>
    </div>
  );
}

function CivicForumsView({ token, setCurrentView }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">💬 Civic Forums</h2>
      <div className="text-center py-12">
        <div className="text-6xl mb-4">💬</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Civic Forums Coming Soon!</h3>
        <p className="text-gray-600">Engage in discussions about civic issues and governance.</p>
      </div>
    </div>
  );
}

function EducationView({ token, user, setCurrentView }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-4">🎓 EduNations</h1>
        <p className="text-xl mb-6">
          Unlock your potential with world-class education. Learn new skills, earn certifications, and build your career with courses designed for African youth.
        </p>
        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentView('create-course')}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Teach a Course
          </button>
          <button
            onClick={() => setCurrentView('my-courses')}
            className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
          >
            My Learning
          </button>
          <button
            onClick={() => setCurrentView('mentorship')}
            className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
          >
            Find Mentor
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎓</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Learning Platform Coming Soon!</h3>
          <p className="text-gray-600">Access world-class education and skill development programs.</p>
        </div>
      </div>
    </div>
  );
}

function MyCoursesView({ token, setCurrentView }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">📚 My Learning</h2>
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Courses Yet</h3>
        <p className="text-gray-600">Enroll in courses to start your learning journey.</p>
      </div>
    </div>
  );
}

function CreateCourseView({ token, setCurrentView }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">🎓 Create Course</h2>
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎓</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Course Creation Coming Soon!</h3>
        <p className="text-gray-600">Share your knowledge by creating educational courses.</p>
      </div>
    </div>
  );
}

function MentorshipView({ token, setCurrentView }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">🎯 Mentorship</h2>
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎯</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Mentorship Platform Coming Soon!</h3>
        <p className="text-gray-600">Connect with mentors and accelerate your growth.</p>
      </div>
    </div>
  );
}

export default App;