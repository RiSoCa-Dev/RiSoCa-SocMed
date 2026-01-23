import { format, formatDistanceToNow, isToday, isTomorrow } from 'date-fns';
import { 
  FaCalendarAlt, 
  FaRocket, 
  FaCheckCircle, 
  FaClock, 
  FaExclamationTriangle,
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaChartLine,
  FaArrowUp,
  FaEye,
  FaHeart,
  FaComment,
  FaShare
} from 'react-icons/fa';
import { FaTiktok } from 'react-icons/fa6';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  // Mockup data
  const stats = {
    totalPosts: 47,
    scheduled: 12,
    published: 32,
    failed: 3,
    totalReach: 125000,
    totalEngagement: 8500,
    engagementRate: 6.8
  };

  const upcomingPosts = [
    {
      id: 1,
      title: 'Product Launch Video',
      platforms: ['facebook', 'instagram'],
      scheduledDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      status: 'scheduled',
      mediaType: 'video'
    },
    {
      id: 2,
      title: 'Weekly Update',
      platforms: ['youtube', 'tiktok'],
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      status: 'scheduled',
      mediaType: 'video'
    },
    {
      id: 3,
      title: 'Behind the Scenes',
      platforms: ['instagram', 'facebook'],
      scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      status: 'scheduled',
      mediaType: 'image'
    },
    {
      id: 4,
      title: 'Tutorial Series Part 1',
      platforms: ['youtube'],
      scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      status: 'scheduled',
      mediaType: 'video'
    }
  ];

  const recentPosts = [
    {
      id: 1,
      title: 'New Feature Announcement',
      platforms: ['facebook', 'instagram', 'youtube'],
      publishedDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      status: 'published',
      metrics: {
        reach: 12500,
        engagement: 850,
        likes: 420,
        comments: 65,
        shares: 23
      }
    },
    {
      id: 2,
      title: 'Weekly Tips',
      platforms: ['tiktok', 'instagram'],
      publishedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      status: 'published',
      metrics: {
        reach: 8900,
        engagement: 620,
        likes: 380,
        comments: 45,
        shares: 18
      }
    },
    {
      id: 3,
      title: 'Product Demo',
      platforms: ['youtube'],
      publishedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      status: 'published',
      metrics: {
        reach: 15200,
        engagement: 1200,
        likes: 680,
        comments: 95,
        shares: 42
      }
    }
  ];

  const platformStats = [
    { platform: 'facebook', count: 18, color: 'bg-blue-600', icon: FaFacebook },
    { platform: 'instagram', count: 15, color: 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500', icon: FaInstagram },
    { platform: 'youtube', count: 8, color: 'bg-red-600', icon: FaYoutube },
    { platform: 'tiktok', count: 6, color: 'bg-black', icon: FaTiktok }
  ];

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return <FaFacebook className="text-blue-500" />;
      case 'instagram':
        return <FaInstagram className="text-pink-500" />;
      case 'youtube':
        return <FaYoutube className="text-red-500" />;
      case 'tiktok':
        return <FaTiktok className="text-white" />;
      default:
        return null;
    }
  };

  const formatScheduledTime = (date: Date) => {
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (isTomorrow(date)) {
      return `Tomorrow at ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, yyyy h:mm a');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-2">
            Dashboard
          </h1>
          <p className="text-gray-400">Overview of your social media scheduling activity</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <FaCalendarAlt className="text-blue-400 text-xl" />
              </div>
              <span className="text-green-400 text-sm font-medium">+12%</span>
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Total Posts</h3>
            <p className="text-white text-3xl font-bold">{stats.totalPosts}</p>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                <FaClock className="text-yellow-400 text-xl" />
              </div>
              <span className="text-yellow-400 text-sm font-medium">{stats.scheduled}</span>
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Scheduled</h3>
            <p className="text-white text-3xl font-bold">{stats.scheduled}</p>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                <FaCheckCircle className="text-green-400 text-xl" />
              </div>
              <span className="text-green-400 text-sm font-medium">+8%</span>
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Published</h3>
            <p className="text-white text-3xl font-bold">{stats.published}</p>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
                <FaExclamationTriangle className="text-red-400 text-xl" />
              </div>
              <span className="text-red-400 text-sm font-medium">{stats.failed}</span>
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Failed</h3>
            <p className="text-white text-3xl font-bold">{stats.failed}</p>
          </div>
        </div>

        {/* Engagement Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <FaEye className="text-purple-400" />
              </div>
              <div>
                <h3 className="text-gray-400 text-sm">Total Reach</h3>
                <p className="text-white text-2xl font-bold">{stats.totalReach.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <FaArrowUp />
              <span>+15.3% from last month</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-pink-600/20 rounded-lg flex items-center justify-center">
                <FaHeart className="text-pink-400" />
              </div>
              <div>
                <h3 className="text-gray-400 text-sm">Total Engagement</h3>
                <p className="text-white text-2xl font-bold">{stats.totalEngagement.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <FaArrowUp />
              <span>+22.1% from last month</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <FaChartLine className="text-primary" />
              </div>
              <div>
                <h3 className="text-gray-400 text-sm">Engagement Rate</h3>
                <p className="text-white text-2xl font-bold">{stats.engagementRate}%</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <FaArrowUp />
              <span>+1.2% from last month</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Upcoming Posts */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-semibold flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-primary to-purple-600 rounded-full"></span>
                Upcoming Posts
              </h2>
              <Link
                to="/scheduler"
                className="text-primary hover:text-blue-400 text-sm font-medium flex items-center gap-1"
              >
                View All
                <FaRocket className="text-xs" />
              </Link>
            </div>
            <div className="space-y-4">
              {upcomingPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 hover:border-primary/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-white font-medium mb-1">{post.title}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        {post.platforms.map((platform) => (
                          <div key={platform} className="w-6 h-6 flex items-center justify-center">
                            {getPlatformIcon(platform)}
                          </div>
                        ))}
                      </div>
                      <p className="text-gray-400 text-xs">
                        {formatScheduledTime(post.scheduledDate)}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 text-xs rounded">
                      {post.mediaType}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Distribution */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl">
            <h2 className="text-white text-xl font-semibold mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-primary to-purple-600 rounded-full"></span>
              Platform Distribution
            </h2>
            <div className="space-y-4">
              {platformStats.map((stat) => {
                const percentage = (stat.count / stats.totalPosts) * 100;
                const Icon = stat.icon;
                return (
                  <div key={stat.platform} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                          <Icon className="text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium capitalize">{stat.platform}</p>
                          <p className="text-gray-400 text-sm">{stat.count} posts</p>
                        </div>
                      </div>
                      <span className="text-gray-400 text-sm font-medium">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 ${stat.color} rounded-full transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Posts Performance */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-xl font-semibold flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-primary to-purple-600 rounded-full"></span>
              Recent Posts Performance
            </h2>
            <Link
              to="/scheduler"
              className="text-primary hover:text-blue-400 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <div
                key={post.id}
                className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 hover:border-primary/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-white font-medium mb-2">{post.title}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      {post.platforms.map((platform) => (
                        <div key={platform} className="w-6 h-6 flex items-center justify-center">
                          {getPlatformIcon(platform)}
                        </div>
                      ))}
                    </div>
                    <p className="text-gray-400 text-xs">
                      Published {formatDistanceToNow(post.publishedDate, { addSuffix: true })}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded">
                    {post.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-slate-700/50">
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Reach</p>
                    <p className="text-white font-semibold">{post.metrics.reach.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Engagement</p>
                    <p className="text-white font-semibold">{post.metrics.engagement.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaHeart className="text-red-400 text-xs" />
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Likes</p>
                      <p className="text-white font-semibold">{post.metrics.likes.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaComment className="text-blue-400 text-xs" />
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Comments</p>
                      <p className="text-white font-semibold">{post.metrics.comments.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaShare className="text-green-400 text-xs" />
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Shares</p>
                      <p className="text-white font-semibold">{post.metrics.shares.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            to="/scheduler"
            className="px-6 py-3 bg-gradient-to-r from-primary to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all flex items-center gap-2"
          >
            <FaRocket />
            <span>Schedule New Post</span>
          </Link>
          <Link
            to="/batch-scheduler"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-pink-600 hover:to-orange-600 transition-all flex items-center gap-2"
          >
            <FaCalendarAlt />
            <span>Batch Schedule</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
