function OrganizationDashboard({ organization, token, setCurrentView }) {
  return (
    <div className="space-y-6">
      {/* Organization Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-8 text-white">
        <div className="flex items-center space-x-6">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-green-600 text-2xl font-bold">
            {organization.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{organization.name}</h1>
            <p className="text-xl opacity-90">{organization.organization_type} • {organization.country}</p>
            {organization.verified && (
              <span className="inline-flex items-center mt-2 px-3 py-1 bg-white/20 rounded-full text-sm">
                ✅ Verified Organization
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 Post New Job</h3>
          <p className="text-gray-600 mb-4">Create a new job opportunity for African youth.</p>
          <button 
            onClick={() => setCurrentView('post-job')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors w-full"
          >
            Post Job
          </button>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📄 Manage Applications</h3>
          <p className="text-gray-600 mb-4">Review and manage job applications.</p>
          <button 
            onClick={() => setCurrentView('manage-applications')}
            className="bg-purple-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-600 transition-colors w-full"
          >
            View Applications
          </button>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Analytics</h3>
          <p className="text-gray-600 mb-4">View job posting performance and metrics.</p>
          <button className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors w-full">
            View Analytics
          </button>
        </div>
      </div>

      {/* Organization Details */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Organization Details</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
            <p className="text-gray-600">{organization.description}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Contact Information</h3>
              <div className="space-y-1 text-gray-600">
                <p>📧 {organization.contact_email}</p>
                {organization.contact_phone && <p>📞 {organization.contact_phone}</p>}
                {organization.website && (
                  <a href={organization.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                    🌐 {organization.website}
                  </a>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Organization Info</h3>
              <div className="space-y-1 text-gray-600">
                {organization.size && <p>👥 {organization.size}</p>}
                {organization.founded_year && <p>📅 Founded in {organization.founded_year}</p>}
                <p>📍 {organization.country}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrganizationDashboard;