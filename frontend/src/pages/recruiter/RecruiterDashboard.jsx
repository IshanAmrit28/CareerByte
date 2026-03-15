import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { 
  Briefcase, 
  Users, 
  ClipboardCheck, 
  TrendingUp, 
  ArrowUpRight, 
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3
} from 'lucide-react';
import TeamMembers from '../../components/recruiter/TeamMembers';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 hover:border-indigo-500/50 transition-all duration-300 group">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10`}>
        <Icon className={color.replace('bg-', 'text-')} size={24} />
      </div>
      <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2 py-1 rounded-full">
        <ArrowUpRight size={12} />
        <span>Live</span>
      </div>
    </div>
    <div>
      <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
          {value}
        </span>
      </div>
      {subtitle && <p className="text-gray-500 text-xs mt-2">{subtitle}</p>}
    </div>
  </div>
);

const RecruiterDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/recruiter/stats');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (error) {
      toast.error("Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] pt-24 px-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] pt-24 pb-12 px-8 font-sans text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Recruiter Dashboard</h1>
          <p className="text-gray-400 text-lg">Performance overview and high-level hiring metrics.</p>
        </div>

        {/* Top Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard 
            title="Active Job Posts" 
            value={stats?.activeJobs || 0} 
            icon={Briefcase} 
            color="bg-indigo-500"
            subtitle={`${stats?.inactiveJobs || 0} Inactive positions`}
          />
          <StatCard 
            title="Total Applicants" 
            value={stats?.totalApplicants || 0} 
            icon={Users} 
            color="bg-blue-500"
            subtitle="Candidates applied across all jobs"
          />
          <StatCard 
            title="Active Assessments" 
            value={stats?.activeAssessments || 0} 
            icon={ClipboardCheck} 
            color="bg-emerald-500"
            subtitle={`${stats?.closedAssessments || 0} Recently concluded`}
          />
          <StatCard 
            title="Completed Tests" 
            value={stats?.candidatesGivenAssessment || 0} 
            icon={TrendingUp} 
            color="bg-purple-500"
            subtitle="Participants who submitted tests"
          />
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hiring Pipeline */}
          <div className="lg:col-span-2 bg-gray-900/40 border border-gray-800 rounded-3xl p-8 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BarChart3 className="text-indigo-400" size={20} />
                Recruitment Stream
              </h2>
              <span className="text-xs text-gray-500">Live analytics based on recent assessments</span>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/5 rounded-2xl p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                    <CheckCircle2 className="text-emerald-500" size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold">Assessment Success Rate</h4>
                    <p className="text-gray-500 text-sm">Candidates clearing the 60% technical cutoff</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-emerald-400">
                    {stats?.realtimeMetrics?.successRate || 0}%
                  </span>
                </div>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-2xl p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20">
                    <Clock className="text-indigo-500" size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold">Average Completion Time</h4>
                    <p className="text-gray-500 text-sm">Average minutes taken to submit assessments</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-indigo-400">
                    {stats?.realtimeMetrics?.avgCompletionTime || 0} Mins
                  </span>
                </div>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-2xl p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                    <XCircle className="text-red-500" size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold">Drop-off Rate</h4>
                    <p className="text-gray-500 text-sm">Candidates who started but didn't finish</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-red-400">
                    {stats?.realtimeMetrics?.dropOffRate || 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Post Job & Team Members */}
          <div className="flex flex-col gap-8 h-full">
            <button 
              onClick={() => window.location.href = '/recruiter/jobs/create'}
              className="bg-indigo-600 hover:bg-indigo-500 py-4 px-6 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 group"
            >
              <Briefcase size={20} className="group-hover:scale-110 transition-transform" />
              Post New Position
            </button>

            {/* Team Members scrollable Section */}
            <div className="bg-gray-900/40 border border-gray-800 rounded-3xl p-6 backdrop-blur-sm flex-1 flex flex-col min-h-0">
              <div className="overflow-y-auto pr-2 custom-scrollbar max-h-[400px]">
                <TeamMembers />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
