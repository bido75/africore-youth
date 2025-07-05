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
        {currentView === 'messages' && <MessagesView token={token} user={user} />}
        {currentView === 'jobs' && <JobsView token={token} user={user} setCurrentView={setCurrentView} />}
        {currentView === 'my-applications' && <MyApplicationsView token={token} />}
        {currentView === 'organization' && <OrganizationView token={token} user={user} />}
        {currentView === 'post-job' && <PostJobView token={token} setCurrentView={setCurrentView} />}
        {currentView === 'manage-applications' && <ManageApplicationsView token={token} />}
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
                onClick={() => setCurrentView('my-applications')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'my-applications' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                My Applications
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
                Organization
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
      // This would be replaced with actual API calls
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
              Connect with African youth across the continent and discover amazing job opportunities. Build your network, share your goals, and create impact together.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setCurrentView('jobs')}
                className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
              >
                Browse Jobs
              </button>
              <button
                onClick={() => setCurrentView('discover')}
                className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
              >
                Discover Youth
              </button>
              <button
                onClick={() => setCurrentView('profile')}
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors"
              >
                Complete Profile
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-orange-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-medium">Your Country</p>
              <p className="text-2xl font-bold text-gray-800">{user?.country}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🌍</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-yellow-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-medium">Skills</p>
              <p className="text-2xl font-bold text-gray-800">{user?.skills?.length || 0}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-blue-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-medium">Job Matches</p>
              <p className="text-2xl font-bold text-gray-800">{stats.recommendedJobs}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💼</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-green-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-medium">Applications</p>
              <p className="text-2xl font-bold text-gray-800">{stats.applications}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📄</span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Opportunities */}
      <div className="bg-white rounded-xl p-8 shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">🚀 Ready to Take Your Career to the Next Level?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
            <h3 className="text-xl font-bold mb-2">AfriWorkMesh</h3>
            <p className="mb-4">Discover job opportunities across Africa. From tech startups to NGOs, find your perfect match.</p>
            <button
              onClick={() => setCurrentView('jobs')}
              className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Browse Jobs
            </button>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
            <h3 className="text-xl font-bold mb-2">Post Opportunities</h3>
            <p className="mb-4">Have a job to offer? Register your organization and connect with talented African youth.</p>
            <button
              onClick={() => setCurrentView('organization')}
              className="bg-white text-green-600 px-6 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-white rounded-xl p-8 shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Start Building Your Future Today</h2>
        <p className="text-gray-600 mb-6">
          Join thousands of African youth who are creating opportunities, building networks, and transforming their communities.
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setCurrentView('jobs')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-colors"
          >
            Find Jobs
          </button>
          <button
            onClick={() => setCurrentView('discover')}
            className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-yellow-600 transition-colors"
          >
            Connect with Youth
          </button>
          <button
            onClick={() => setCurrentView('organization')}
            className="border-2 border-green-500 text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
          >
            Post Jobs
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfileView({ user, setUser, token }) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    country: user?.country || '',
    age: user?.age || '',
    bio: user?.bio || '',
    skills: user?.skills?.join(', ') || '',
    interests: user?.interests?.join(', ') || '',
    education: user?.education || '',
    goals: user?.goals || '',
    current_projects: user?.current_projects || '',
    languages: user?.languages?.join(', ') || '',
    phone: user?.phone || '',
    linkedin: user?.linkedin || '',
    work_experience: user?.work_experience || '',
    portfolio_url: user?.portfolio_url || '',
    availability: user?.availability || ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        age: parseInt(formData.age),
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
        interests: formData.interests.split(',').map(s => s.trim()).filter(s => s),
        languages: formData.languages.split(',').map(s => s.trim()).filter(s => s)
      };

      const response = await fetch(`${API_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        setUser({ ...user, ...submitData });
        setEditing(false);
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 px-8 py-12">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-orange-600 text-4xl font-bold">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="text-white">
              <h1 className="text-3xl font-bold">{user?.full_name}</h1>
              <p className="text-xl opacity-90">{user?.country}</p>
              <p className="text-lg opacity-75">{user?.age} years old</p>
              {user?.availability && (
                <p className="text-sm opacity-75 mt-2">🟢 {user.availability}</p>
              )}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Profile Information</h2>
            <button
              onClick={() => setEditing(!editing)}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skills (comma-separated)</label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Web Development, Design, Leadership..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interests (comma-separated)</label>
                  <input
                    type="text"
                    name="interests"
                    value={formData.interests}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Technology, Environment, Education..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
                <input
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="University, Degree, etc..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Work Experience</label>
                <textarea
                  name="work_experience"
                  value={formData.work_experience}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Describe your work experience..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio URL</label>
                  <input
                    type="url"
                    name="portfolio_url"
                    value={formData.portfolio_url}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="https://yourportfolio.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                  <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select availability</option>
                    <option value="Available for work">Available for work</option>
                    <option value="Open to opportunities">Open to opportunities</option>
                    <option value="Currently employed">Currently employed</option>
                    <option value="Looking for internships">Looking for internships</option>
                    <option value="Available for freelance">Available for freelance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Goals & Aspirations</label>
                <textarea
                  name="goals"
                  value={formData.goals}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="What do you want to achieve?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Projects</label>
                <textarea
                  name="current_projects"
                  value={formData.current_projects}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="What are you working on?"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Languages (comma-separated)</label>
                  <input
                    type="text"
                    name="languages"
                    value={formData.languages}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="English, French, Swahili..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone (optional)</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn Profile (optional)</label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-yellow-600 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-8">
              {/* Profile Info Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Bio</h3>
                  <p className="text-gray-600">{user?.bio || 'No bio provided'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Education</h3>
                  <p className="text-gray-600">{user?.education || 'No education info provided'}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {user?.skills?.length > 0 ? (
                    user.skills.map((skill, index) => (
                      <span key={index} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">No skills added yet</span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {user?.interests?.length > 0 ? (
                    user.interests.map((interest, index) => (
                      <span key={index} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                        {interest}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">No interests added yet</span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Work Experience</h3>
                <p className="text-gray-600">{user?.work_experience || 'No work experience provided'}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Goals & Aspirations</h3>
                <p className="text-gray-600">{user?.goals || 'No goals specified'}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Current Projects</h3>
                <p className="text-gray-600">{user?.current_projects || 'No current projects'}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {user?.languages?.length > 0 ? (
                      user.languages.map((language, index) => (
                        <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          {language}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">No languages specified</span>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Contact & Links</h3>
                  <div className="space-y-2">
                    {user?.phone && (
                      <p className="text-gray-600">📞 {user.phone}</p>
                    )}
                    {user?.linkedin && (
                      <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-800 block">
                        🔗 LinkedIn Profile
                      </a>
                    )}
                    {user?.portfolio_url && (
                      <a href={user.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 block">
                        🌐 Portfolio
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DiscoverView({ token, setCurrentView }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    country: '',
    skill: ''
  });

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.country) queryParams.append('country', filters.country);
      if (filters.skill) queryParams.append('skill', filters.skill);

      const response = await fetch(`${API_URL}/api/users?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendConnectionRequest = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/api/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          target_user_id: userId,
          message: "Hi! I'd like to connect with you on AfriCore."
        })
      });

      if (response.ok) {
        alert('Connection request sent successfully!');
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to send connection request');
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
      alert('Network error. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Discover African Youth</h2>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Country</label>
            <input
              type="text"
              value={filters.country}
              onChange={(e) => setFilters({...filters, country: e.target.value})}
              placeholder="Enter country..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Skill</label>
            <input
              type="text"
              value={filters.skill}
              onChange={(e) => setFilters({...filters, skill: e.target.value})}
              placeholder="Enter skill..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Finding amazing African youth...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <UserCard key={user.user_id} user={user} onConnect={sendConnectionRequest} />
          ))}
        </div>
      )}

      {!loading && users.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <p className="text-gray-600 text-lg">No users found matching your criteria.</p>
          <p className="text-gray-500 mt-2">Try adjusting your filters or check back later.</p>
        </div>
      )}
    </div>
  );
}

function UserCard({ user, onConnect }) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      <div className="bg-gradient-to-r from-orange-400 to-yellow-400 p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-orange-600 text-2xl font-bold">
            {user.full_name.charAt(0)}
          </div>
          <div className="text-white">
            <h3 className="text-xl font-bold">{user.full_name}</h3>
            <p className="opacity-90">{user.country}</p>
            <p className="opacity-75">{user.age} years old</p>
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        <div>
          <p className="text-gray-600 text-sm">{user.bio || 'No bio provided'}</p>
        </div>
        
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Skills</h4>
          <div className="flex flex-wrap gap-1">
            {user.skills?.slice(0, 3).map((skill, index) => (
              <span key={index} className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                {skill}
              </span>
            ))}
            {user.skills?.length > 3 && (
              <span className="text-orange-600 text-xs">+{user.skills.length - 3} more</span>
            )}
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Interests</h4>
          <div className="flex flex-wrap gap-1">
            {user.interests?.slice(0, 3).map((interest, index) => (
              <span key={index} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                {interest}
              </span>
            ))}
            {user.interests?.length > 3 && (
              <span className="text-yellow-600 text-xs">+{user.interests.length - 3} more</span>
            )}
          </div>
        </div>
        
        <button
          onClick={() => onConnect(user.user_id)}
          className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-yellow-600 transition-colors"
        >
          Connect
        </button>
      </div>
    </div>
  );
}

function ConnectionsView({ token }) {
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
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
        setConnections(data.connections);
        setPendingRequests(data.pending_requests);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptConnection = async (connectionId) => {
    try {
      const response = await fetch(`${API_URL}/api/connection/${connectionId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchConnections(); // Refresh the data
      }
    } catch (error) {
      console.error('Error accepting connection:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading connections...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Pending Connection Requests</h2>
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.connection_id} className="border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full flex items-center justify-center text-white font-bold">
                    {request.requester_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{request.requester_name}</h3>
                    <p className="text-gray-600">{request.requester_country}</p>
                    {request.message && (
                      <p className="text-sm text-gray-500 mt-1">"{request.message}"</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => acceptConnection(request.connection_id)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                >
                  Accept
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connections */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Connections</h2>
        {connections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connections.map((connection) => (
              <div key={connection.connection_id} className="border rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full flex items-center justify-center text-white font-bold">
                    {connection.other_user_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{connection.other_user_name}</h3>
                    <p className="text-gray-600">{connection.other_user_country}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <button className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">You don't have any connections yet. Start by discovering other African youth!</p>
        )}
      </div>
    </div>
  );
}

function MessagesView({ token, user }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, just show placeholder
    setLoading(false);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Messages</h2>
      <div className="text-center py-12">
        <div className="text-6xl mb-4">💬</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Coming Soon!</h3>
        <p className="text-gray-600">Messaging feature will be available soon. Stay tuned!</p>
      </div>
    </div>
  );
}

function JobsView({ token, user, setCurrentView }) {
  const [jobs, setJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    job_type: '',
    job_category: '',
    location: '',
    skills: ''
  });

  useEffect(() => {
    fetchJobs();
    fetchRecommendedJobs();
  }, [filters]);

  const fetchJobs = async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key]);
      });

      const response = await fetch(`${API_URL}/api/jobs?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedJobs = async () => {
    try {
      const response = await fetch(`${API_URL}/api/jobs/recommended`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecommendedJobs(data.jobs);
      }
    } catch (error) {
      console.error('Error fetching recommended jobs:', error);
    }
  };

  const applyToJob = async (jobId) => {
    try {
      const response = await fetch(`${API_URL}/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          job_id: jobId,
          cover_letter: "I am interested in this position and believe my skills are a great match.",
          portfolio_links: user?.portfolio_url || ""
        })
      });

      if (response.ok) {
        alert('Application submitted successfully!');
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error applying to job:', error);
      alert('Network error. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-8 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-2/3">
            <h1 className="text-4xl font-bold mb-4">🚀 AfriWorkMesh</h1>
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
          <div className="md:w-1/3 mt-6 md:mt-0">
            <img 
              src="https://images.pexels.com/photos/7616608/pexels-photo-7616608.jpeg" 
              alt="African professionals" 
              className="rounded-lg shadow-lg w-full h-48 object-cover"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-4 font-medium transition-colors ${
              activeTab === 'all' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            All Jobs ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab('recommended')}
            className={`px-6 py-4 font-medium transition-colors ${
              activeTab === 'recommended' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Recommended ({recommendedJobs.length})
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
              <select
                value={filters.job_type}
                onChange={(e) => setFilters({...filters, job_type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="internship">Internship</option>
                <option value="gig_work">Gig Work</option>
                <option value="project">Project</option>
                <option value="volunteer">Volunteer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.job_category}
                onChange={(e) => setFilters({...filters, job_category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="technology">Technology</option>
                <option value="agriculture">Agriculture</option>
                <option value="education">Education</option>
                <option value="health">Health</option>
                <option value="environment">Environment</option>
                <option value="finance">Finance</option>
                <option value="arts">Arts</option>
                <option value="business">Business</option>
                <option value="engineering">Engineering</option>
                <option value="social_work">Social Work</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
                placeholder="Enter location..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
              <input
                type="text"
                value={filters.skills}
                onChange={(e) => setFilters({...filters, skills: e.target.value})}
                placeholder="Enter skills..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading amazing opportunities...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {(activeTab === 'all' ? jobs : recommendedJobs).map((job) => (
                <JobCard key={job.job_id} job={job} onApply={applyToJob} />
              ))}
            </div>
          )}

          {!loading && (activeTab === 'all' ? jobs : recommendedJobs).length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No jobs found</h3>
              <p className="text-gray-600">Try adjusting your filters or check back later for new opportunities.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
        setApplications(data.applications);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'applied': 'bg-blue-100 text-blue-800',
      'reviewed': 'bg-yellow-100 text-yellow-800',
      'shortlisted': 'bg-purple-100 text-purple-800',
      'interviewed': 'bg-orange-100 text-orange-800',
      'accepted': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatStatus = (status) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">📄 My Job Applications</h2>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your applications...</p>
          </div>
        ) : applications.length > 0 ? (
          <div className="space-y-6">
            {applications.map((application) => (
              <div key={application.application_id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{application.job_title}</h3>
                    <p className="text-gray-600 mb-2">{application.organization_name}</p>
                    <p className="text-sm text-gray-500">Applied on {new Date(application.applied_at).toLocaleDateString()}</p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                      {formatStatus(application.status)}
                    </span>
                  </div>
                </div>
                
                {application.cover_letter && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Cover Letter</h4>
                    <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">{application.cover_letter}</p>
                  </div>
                )}
                
                {application.portfolio_links && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Portfolio Links</h4>
                    <a 
                      href={application.portfolio_links} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      🔗 {application.portfolio_links}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Applications Yet</h3>
            <p className="text-gray-600 mb-6">You haven't applied to any jobs yet. Start exploring opportunities!</p>
            <button className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors">
              Browse Jobs
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function OrganizationView({ token, user }) {
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    organization_type: '',
    country: user?.country || '',
    website: '',
    contact_email: user?.email || '',
    contact_phone: '',
    size: '',
    founded_year: ''
  });

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
        // Find user's organization (simplified - in real app would have proper endpoint)
        setOrganization(data.organizations.length > 0 ? data.organizations[0] : null);
      }
    } catch (error) {
      console.error('Error checking organization:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/organization/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          founded_year: formData.founded_year ? parseInt(formData.founded_year) : null
        })
      });

      if (response.ok) {
        alert('Organization registered successfully!');
        setShowRegisterForm(false);
        checkOrganization();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to register organization');
      }
    } catch (error) {
      console.error('Error registering organization:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading organization info...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!organization ? (
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🏢</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Register Your Organization</h2>
            <p className="text-gray-600 mb-6">
              Create job opportunities for African youth. Register your organization to start posting jobs.
            </p>
            {!showRegisterForm && (
              <button
                onClick={() => setShowRegisterForm(true)}
                className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
              >
                Get Started
              </button>
            )}
          </div>

          {showRegisterForm && (
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Your Organization Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organization Type</label>
                  <select
                    name="organization_type"
                    value={formData.organization_type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select type</option>
                    <option value="startup">Startup</option>
                    <option value="ngo">NGO</option>
                    <option value="government">Government</option>
                    <option value="corporation">Corporation</option>
                    <option value="university">University</option>
                    <option value="cooperative">Cooperative</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Describe your organization and mission..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website (optional)</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                  <input
                    type="email"
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone (optional)</label>
                  <input
                    type="tel"
                    name="contact_phone"
                    value={formData.contact_phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organization Size (optional)</label>
                  <select
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-1000">201-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Founded Year (optional)</label>
                  <input
                    type="number"
                    name="founded_year"
                    value={formData.founded_year}
                    onChange={handleChange}
                    min="1900"
                    max={new Date().getFullYear()}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="2020"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                >
                  Register Organization
                </button>
                <button
                  type="button"
                  onClick={() => setShowRegisterForm(false)}
                  className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <OrganizationDashboard organization={organization} token={token} setCurrentView={setCurrentView} />
      )}
    </div>
  );
}

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
    deadline: '',
    skills_required: '',
    experience_level: '',
    benefits: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        requirements: formData.requirements.split('\n').filter(req => req.trim()),
        skills_required: formData.skills_required.split(',').map(s => s.trim()).filter(s => s),
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null
      };

      const response = await fetch(`${API_URL}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        alert('Job posted successfully!');
        setCurrentView('organization');
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to post job');
      }
    } catch (error) {
      console.error('Error posting job:', error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">📝 Post New Job Opportunity</h2>
          <p className="text-gray-600">Create an amazing opportunity for African youth to discover and apply.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Frontend Developer, Marketing Manager"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="6"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Requirements (one per line) *</label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              required
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Bachelor's degree in relevant field&#10;2+ years of experience&#10;Strong communication skills"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Type *</label>
              <select
                name="job_type"
                value={formData.job_type}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select type</option>
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="internship">Internship</option>
                <option value="gig_work">Gig Work</option>
                <option value="project">Project</option>
                <option value="volunteer">Volunteer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                name="job_category"
                value={formData.job_category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select category</option>
                <option value="technology">Technology</option>
                <option value="agriculture">Agriculture</option>
                <option value="education">Education</option>
                <option value="health">Health</option>
                <option value="environment">Environment</option>
                <option value="finance">Finance</option>
                <option value="arts">Arts</option>
                <option value="business">Business</option>
                <option value="engineering">Engineering</option>
                <option value="social_work">Social Work</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location Type *</label>
              <select
                name="location_type"
                value={formData.location_type}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select type</option>
                <option value="remote">Remote</option>
                <option value="on_site">On Site</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Lagos, Nigeria or Remote"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range (optional)</label>
              <input
                type="text"
                name="salary_range"
                value={formData.salary_range}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., $30,000 - $50,000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Required Skills (comma-separated) *</label>
            <input
              type="text"
              name="skills_required"
              value={formData.skills_required}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="React, JavaScript, Communication, Leadership"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level (optional)</label>
              <select
                name="experience_level"
                value={formData.experience_level}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select level</option>
                <option value="Entry Level">Entry Level</option>
                <option value="Mid Level">Mid Level</option>
                <option value="Senior Level">Senior Level</option>
                <option value="Executive">Executive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Application Deadline (optional)</label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Benefits & Perks (optional)</label>
            <textarea
              name="benefits"
              value={formData.benefits}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Health insurance, flexible hours, remote work, professional development..."
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Posting Job...' : 'Post Job'}
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('organization')}
              className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ManageApplicationsView({ token }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch(`${API_URL}/api/organization/applications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      const response = await fetch(`${API_URL}/api/applications/${applicationId}/status?status=${status}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert(`Application status updated to ${status}`);
        fetchApplications(); // Refresh the list
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to update application status');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Network error. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'applied': 'bg-blue-100 text-blue-800',
      'reviewed': 'bg-yellow-100 text-yellow-800',
      'shortlisted': 'bg-purple-100 text-purple-800',
      'interviewed': 'bg-orange-100 text-orange-800',
      'accepted': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatStatus = (status) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">📄 Manage Applications</h2>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading applications...</p>
          </div>
        ) : applications.length > 0 ? (
          <div className="space-y-6">
            {applications.map((application) => (
              <div key={application.application_id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{application.job_title}</h3>
                        <p className="text-lg font-semibold text-gray-700">{application.applicant_name}</p>
                        <p className="text-gray-600">{application.applicant_email} • {application.applicant_country}</p>
                        <p className="text-sm text-gray-500">Applied on {new Date(application.applied_at).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                        {formatStatus(application.status)}
                      </span>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Applicant Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {application.applicant_skills?.slice(0, 8).map((skill, index) => (
                          <span key={index} className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                            {skill}
                          </span>
                        ))}
                        {application.applicant_skills?.length > 8 && (
                          <span className="text-orange-600 text-xs">+{application.applicant_skills.length - 8} more</span>
                        )}
                      </div>
                    </div>

                    {application.cover_letter && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2">Cover Letter</h4>
                        <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">{application.cover_letter}</p>
                      </div>
                    )}

                    {application.portfolio_links && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2">Portfolio</h4>
                        <a 
                          href={application.portfolio_links} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          🔗 {application.portfolio_links}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => updateApplicationStatus(application.application_id, 'reviewed')}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-600 transition-colors"
                  >
                    Mark as Reviewed
                  </button>
                  <button
                    onClick={() => updateApplicationStatus(application.application_id, 'shortlisted')}
                    className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-600 transition-colors"
                  >
                    Shortlist
                  </button>
                  <button
                    onClick={() => updateApplicationStatus(application.application_id, 'interviewed')}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors"
                  >
                    Interviewed
                  </button>
                  <button
                    onClick={() => updateApplicationStatus(application.application_id, 'accepted')}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => updateApplicationStatus(application.application_id, 'rejected')}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📥</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Applications Yet</h3>
            <p className="text-gray-600">Applications will appear here once youth start applying to your job postings.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function JobCard({ job, onApply }) {
  const formatJobType = (type) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatCategory = (category) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const getJobTypeColor = (type) => {
    const colors = {
      'full_time': 'bg-green-100 text-green-800',
      'part_time': 'bg-blue-100 text-blue-800',
      'internship': 'bg-purple-100 text-purple-800',
      'gig_work': 'bg-orange-100 text-orange-800',
      'project': 'bg-yellow-100 text-yellow-800',
      'volunteer': 'bg-red-100 text-red-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-bold text-gray-800">{job.title}</h3>
            {job.match_score && (
              <span className="ml-4 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                {job.match_score}% match
              </span>
            )}
          </div>
          <p className="text-gray-600 mb-2">{job.organization_name}</p>
          <p className="text-sm text-gray-500 mb-3">{job.location}</p>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getJobTypeColor(job.job_type)}`}>
              {formatJobType(job.job_type)}
            </span>
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
              {formatCategory(job.job_category)}
            </span>
            {job.salary_range && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {job.salary_range}
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-3">{job.description}</p>

      <div className="mb-4">
        <h4 className="font-semibold text-gray-800 mb-2">Required Skills</h4>
        <div className="flex flex-wrap gap-2">
          {job.skills_required?.slice(0, 5).map((skill, index) => (
            <span key={index} className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
              {skill}
            </span>
          ))}
          {job.skills_required?.length > 5 && (
            <span className="text-orange-600 text-xs">+{job.skills_required.length - 5} more</span>
          )}
        </div>
        {job.matching_skills && job.matching_skills.length > 0 && (
          <div className="mt-2">
            <p className="text-sm text-green-600 font-medium">
              ✅ You have: {job.matching_skills.join(', ')}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Posted {new Date(job.created_at).toLocaleDateString()}
          {job.deadline && (
            <span className="ml-2">• Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
          )}
        </div>
        <button
          onClick={() => onApply(job.job_id)}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
        >
          Apply Now
        </button>
      </div>
    </div>
  );
}

export default App;