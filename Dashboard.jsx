import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [teamData, setTeamData] = useState(null);
  const [playersData, setPlayersData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch general FPL data
      const bootstrapResponse = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/');
      if (!bootstrapResponse.ok) {
        throw new Error('Failed to fetch FPL data');
      }
      const bootstrapData = await bootstrapResponse.json();
      setPlayersData(bootstrapData);

      // If user has team data, fetch it
      if (user.teamId) {
        const teamResponse = await fetch(`https://fantasy.premierleague.com/api/entry/${user.teamId}/`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        if (teamResponse.ok) {
          const teamData = await teamResponse.json();
          setTeamData(teamData);
        }
      }
    } catch (err) {
      setError(err.message);
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <h3 className="font-bold">Error Loading Dashboard</h3>
          <p>{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">FPL Dashboard</h1>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">Welcome, {user.email}</span>
          <button
            onClick={signOut}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Current Gameweek</h3>
          <p className="text-3xl font-bold text-blue-600">
            {playersData?.events?.find(event => event.is_current)?.id || 'N/A'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Total Players</h3>
          <p className="text-3xl font-bold text-green-600">
            {playersData?.elements?.length || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Premier League Teams</h3>
          <p className="text-3xl font-bold text-purple-600">
            {playersData?.teams?.length || 0}
          </p>
        </div>
      </div>

      {teamData && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-xl font-semibold mb-4">Your Team</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Team Name</p>
              <p className="font-semibold">{teamData.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Overall Points</p>
              <p className="font-semibold">{teamData.summary_overall_points}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Overall Rank</p>
              <p className="font-semibold">{teamData.summary_overall_rank?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Gameweek Points</p>
              <p className="font-semibold">{teamData.summary_event_points}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors">
            View Team
          </button>
          <button className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors">
            Make Transfers
          </button>
          <button className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors">
            View Leagues
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
