import { useState, useEffect } from 'react';
import { 
  FaFacebook, 
  FaInstagram, 
  FaYoutube, 
  FaCheckCircle, 
  FaExclamationCircle,
  FaEye,
  FaEyeSlash,
  FaLink,
  FaKey,
  FaInfoCircle,
  FaSpinner,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import { FaTiktok } from 'react-icons/fa6';

interface PlatformConnection {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  status: 'connected' | 'disconnected' | 'testing';
  fields: {
    id: string;
    label: string;
    type: 'text' | 'password';
    placeholder: string;
    value: string;
    required: boolean;
    description?: string;
  }[];
  apiDocsUrl: string;
  instructions: string[];
}

const PlatformConnections = () => {
  const [connections, setConnections] = useState<PlatformConnection[]>([
    {
      id: 'facebook',
      name: 'Facebook',
      icon: <FaFacebook className="text-xl" />,
      color: 'bg-blue-600',
      gradient: 'from-blue-500 to-blue-700',
      status: 'disconnected',
      fields: [
        {
          id: 'app_id',
          label: 'App ID',
          type: 'text',
          placeholder: 'Enter your Facebook App ID',
          value: '',
          required: true,
          description: 'Your Facebook App ID from Facebook Developers'
        },
        {
          id: 'app_secret',
          label: 'App Secret',
          type: 'password',
          placeholder: 'Enter your Facebook App Secret',
          value: '',
          required: true,
          description: 'Your Facebook App Secret (keep this secure)'
        },
        {
          id: 'access_token',
          label: 'Access Token',
          type: 'password',
          placeholder: 'Enter your Access Token',
          value: '',
          required: true,
          description: 'Long-lived access token for posting'
        },
        {
          id: 'page_id',
          label: 'Page ID (Optional)',
          type: 'text',
          placeholder: 'Enter your Facebook Page ID',
          value: '',
          required: false,
          description: 'Required if posting to a Facebook Page'
        }
      ],
      apiDocsUrl: 'https://developers.facebook.com/docs/graph-api',
      instructions: [
        'Go to Facebook Developers (developers.facebook.com)',
        'Create a new app or select an existing one',
        'Add "Facebook Login" and "Pages" products',
        'Get your App ID and App Secret from Settings > Basic',
        'Generate a long-lived access token with required permissions'
      ]
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: <FaInstagram className="text-xl" />,
      color: 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500',
      gradient: 'from-purple-500 via-pink-500 to-orange-500',
      status: 'disconnected',
      fields: [
        {
          id: 'access_token',
          label: 'Access Token',
          type: 'password',
          placeholder: 'Enter your Instagram Access Token',
          value: '',
          required: true,
          description: 'Instagram Graph API access token'
        },
        {
          id: 'instagram_account_id',
          label: 'Instagram Business Account ID',
          type: 'text',
          placeholder: 'Enter your Instagram Account ID',
          value: '',
          required: true,
          description: 'Your Instagram Business Account ID'
        }
      ],
      apiDocsUrl: 'https://developers.facebook.com/docs/instagram-api',
      instructions: [
        'Connect your Instagram account to a Facebook Page',
        'Go to Facebook Developers and create an app',
        'Add "Instagram Basic Display" or "Instagram Graph API" product',
        'Get your Instagram Business Account ID',
        'Generate an access token with required permissions'
      ]
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: <FaYoutube className="text-xl" />,
      color: 'bg-red-600',
      gradient: 'from-red-500 to-red-700',
      status: 'disconnected',
      fields: [
        {
          id: 'client_id',
          label: 'Client ID',
          type: 'text',
          placeholder: 'Enter your YouTube Client ID',
          value: '',
          required: true,
          description: 'OAuth 2.0 Client ID from Google Cloud Console'
        },
        {
          id: 'client_secret',
          label: 'Client Secret',
          type: 'password',
          placeholder: 'Enter your YouTube Client Secret',
          value: '',
          required: true,
          description: 'OAuth 2.0 Client Secret (keep this secure)'
        },
        {
          id: 'refresh_token',
          label: 'Refresh Token',
          type: 'password',
          placeholder: 'Enter your Refresh Token',
          value: '',
          required: true,
          description: 'OAuth 2.0 refresh token for API access'
        }
      ],
      apiDocsUrl: 'https://developers.google.com/youtube/v3',
      instructions: [
        'Go to Google Cloud Console (console.cloud.google.com)',
        'Create a new project or select an existing one',
        'Enable YouTube Data API v3',
        'Create OAuth 2.0 credentials (Client ID and Secret)',
        'Authorize the app and get a refresh token'
      ]
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: <FaTiktok className="text-xl" />,
      color: 'bg-black',
      gradient: 'from-gray-800 to-black',
      status: 'disconnected',
      fields: [
        {
          id: 'client_key',
          label: 'Client Key',
          type: 'text',
          placeholder: 'Enter your TikTok Client Key',
          value: '',
          required: true,
          description: 'Your TikTok API Client Key'
        },
        {
          id: 'client_secret',
          label: 'Client Secret',
          type: 'password',
          placeholder: 'Enter your TikTok Client Secret',
          value: '',
          required: true,
          description: 'Your TikTok API Client Secret (keep this secure)'
        },
        {
          id: 'access_token',
          label: 'Access Token',
          type: 'password',
          placeholder: 'Enter your Access Token',
          value: '',
          required: true,
          description: 'TikTok API access token'
        }
      ],
      apiDocsUrl: 'https://developers.tiktok.com/doc/',
      instructions: [
        'Go to TikTok Developers Portal (developers.tiktok.com)',
        'Create a new app or select an existing one',
        'Get your Client Key and Client Secret',
        'Generate an access token with required scopes',
        'Ensure you have the necessary permissions'
      ]
    }
  ]);

  const [showPasswords, setShowPasswords] = useState<Record<string, Record<string, boolean>>>({});
  const [expandedPlatforms, setExpandedPlatforms] = useState<Set<string>>(new Set());

  const togglePlatform = (platformId: string) => {
    setExpandedPlatforms((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(platformId)) {
        newSet.delete(platformId);
      } else {
        newSet.add(platformId);
      }
      return newSet;
    });
  };

  // Load existing connections on mount
  useEffect(() => {
    const loadConnections = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/connections');
        if (response.ok) {
          const savedConnections = await response.json();
          // Update connection statuses based on saved data
          setConnections((prev) =>
            prev.map((conn) => {
              const saved = savedConnections.find((s: any) => s.platform === conn.id);
              return saved
                ? { ...conn, status: saved.status as 'connected' | 'disconnected' }
                : conn;
            })
          );
        }
      } catch (error) {
        console.error('Error loading connections:', error);
      }
    };

    loadConnections();
  }, []);

  const togglePasswordVisibility = (platformId: string, fieldId: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [platformId]: {
        ...prev[platformId],
        [fieldId]: !prev[platformId]?.[fieldId]
      }
    }));
  };

  const handleFieldChange = (platformId: string, fieldId: string, value: string) => {
    setConnections((prev) =>
      prev.map((conn) =>
        conn.id === platformId
          ? {
              ...conn,
              fields: conn.fields.map((field) =>
                field.id === fieldId ? { ...field, value } : field
              )
            }
          : conn
      )
    );
  };

  const handleTestConnection = async (platformId: string) => {
    const connection = connections.find((c) => c.id === platformId);
    if (!connection) return;

    // Update status to testing
    setConnections((prev) =>
      prev.map((conn) =>
        conn.id === platformId ? { ...conn, status: 'testing' as const } : conn
      )
    );

    try {
      // TODO: Implement actual API test
      // For now, simulate API test
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Check if all required fields are filled
      const allRequiredFilled = connection.fields
        .filter((f) => f.required)
        .every((f) => f.value.trim() !== '');

      if (allRequiredFilled) {
        setConnections((prev) =>
          prev.map((conn) =>
            conn.id === platformId ? { ...conn, status: 'connected' as const } : conn
          )
        );
      } else {
        setConnections((prev) =>
          prev.map((conn) =>
            conn.id === platformId ? { ...conn, status: 'disconnected' as const } : conn
          )
        );
        alert('Please fill in all required fields');
      }
    } catch (error) {
      setConnections((prev) =>
        prev.map((conn) =>
          conn.id === platformId ? { ...conn, status: 'disconnected' as const } : conn
        )
      );
      alert('Connection test failed. Please check your credentials.');
    }
  };

  const handleSave = async (platformId: string) => {
    const connection = connections.find((c) => c.id === platformId);
    if (!connection) return;

    // Validate required fields
    const missingFields = connection.fields
      .filter((f) => f.required && !f.value.trim())
      .map((f) => f.label);

    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      // TODO: Implement actual API save
      const credentials = connection.fields.reduce((acc, field) => {
        acc[field.id] = field.value;
        return acc;
      }, {} as Record<string, string>);

      const response = await fetch(`http://localhost:3001/api/connections/${platformId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      if (response.ok) {
        alert(`${connection.name} credentials saved successfully!`);
        setConnections((prev) =>
          prev.map((conn) =>
            conn.id === platformId ? { ...conn, status: 'connected' as const } : conn
          )
        );
      } else {
        throw new Error('Failed to save credentials');
      }
    } catch (error) {
      console.error('Error saving credentials:', error);
      alert('Failed to save credentials. Please try again.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <FaCheckCircle className="text-green-400" />;
      case 'testing':
        return <FaSpinner className="text-blue-400 animate-spin" />;
      default:
        return <FaExclamationCircle className="text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'testing':
        return 'Testing...';
      default:
        return 'Not Connected';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-2">
            Platform Connections
          </h1>
          <p className="text-gray-400">Connect your social media accounts to enable auto-posting</p>
        </div>

        {/* Connections Grid */}
        <div className="space-y-6">
          {connections.map((connection) => {
            const isExpanded = expandedPlatforms.has(connection.id);
            return (
              <div
                key={connection.id}
                className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-xl overflow-hidden"
              >
                {/* Platform Header - Clickable */}
                <button
                  type="button"
                  onClick={() => togglePlatform(connection.id)}
                  className={`w-full bg-gradient-to-r ${connection.gradient} p-6 text-left hover:opacity-90 transition-opacity`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white">
                        {connection.icon}
                      </div>
                      <div>
                        <h2 className="text-white text-2xl font-bold">{connection.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(connection.status)}
                          <span className="text-white/90 text-sm">{getStatusText(connection.status)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <a
                        href={connection.apiDocsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                      >
                        <FaLink />
                        <span>API Docs</span>
                      </a>
                      <div className="text-white">
                        {isExpanded ? (
                          <FaChevronUp className="text-xl" />
                        ) : (
                          <FaChevronDown className="text-xl" />
                        )}
                      </div>
                    </div>
                  </div>
                </button>

                {/* Collapsible Content */}
                {isExpanded && (
                  <div className="p-6 animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - API Fields */}
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <FaKey className="text-primary" />
                      API Credentials
                    </h3>
                    {connection.fields.map((field) => (
                      <div key={field.id}>
                        <label className="block text-white text-sm font-medium mb-2">
                          {field.label}
                          {field.required && <span className="text-red-400 ml-1">*</span>}
                        </label>
                        <div className="relative">
                          <input
                            type={field.type === 'password' && !showPasswords[connection.id]?.[field.id] ? 'password' : 'text'}
                            value={field.value}
                            onChange={(e) => handleFieldChange(connection.id, field.id, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all pr-10"
                          />
                          {field.type === 'password' && (
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(connection.id, field.id)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            >
                              {showPasswords[connection.id]?.[field.id] ? (
                                <FaEyeSlash />
                              ) : (
                                <FaEye />
                              )}
                            </button>
                          )}
                        </div>
                        {field.description && (
                          <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
                            <FaInfoCircle />
                            {field.description}
                          </p>
                        )}
                      </div>
                    ))}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => handleTestConnection(connection.id)}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                      >
                        <FaSpinner className={connection.status === 'testing' ? 'animate-spin' : ''} />
                        <span>Test Connection</span>
                      </button>
                      <button
                        onClick={() => handleSave(connection.id)}
                        className="px-6 py-3 bg-gradient-to-r from-primary to-purple-600 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all"
                      >
                        Save Credentials
                      </button>
                    </div>
                  </div>

                  {/* Right Column - Instructions */}
                  <div>
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <FaInfoCircle className="text-primary" />
                      Setup Instructions
                    </h3>
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                      <ol className="space-y-3">
                        {connection.instructions.map((instruction, index) => (
                          <li key={index} className="flex gap-3 text-gray-300 text-sm">
                            <span className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </span>
                            <span className="flex-1">{instruction}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
                </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Security Notice */}
        <div className="mt-8 bg-blue-500/20 border border-blue-500/50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <FaInfoCircle className="text-blue-400 text-xl flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-blue-200 font-semibold mb-1">Security Notice</h4>
              <p className="text-blue-300 text-sm">
                All API credentials are encrypted and stored securely. Never share your API keys or secrets with anyone.
                Make sure to use environment variables or secure storage in production.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformConnections;
