import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Heart,
  MessageCircle,
  UserPlus,
  Zap,
  Target
} from 'lucide-react';

export default function Analytics() {
  const { api } = useAuth();
  const [overview, setOverview] = useState(null);
  const [hookPerformance, setHookPerformance] = useState([]);
  const [timeSeries, setTimeSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [overviewRes, hookPerfRes, timeSeriesRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/hook-performance'),
        api.get('/analytics/time-series?limit=10')
      ]);

      setOverview(overviewRes.data);
      setHookPerformance(hookPerfRes.data);
      setTimeSeries(timeSeriesRes.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-amber-400 text-lg">Betöltés...</div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, trend, color = 'amber' }) => (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-zinc-400">{title}</p>
          <div className={`p-2 bg-${color}-400/10 rounded-lg`}>
            <Icon className={`text-${color}-400`} size={20} />
          </div>
        </div>
        <h3 className="text-3xl font-bold text-white mb-1">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </h3>
        {trend !== undefined && (
          <div className="flex items-center text-xs">
            {trend >= 0 ? (
              <TrendingUp className="text-green-400 mr-1" size={14} />
            ) : (
              <TrendingDown className="text-red-400 mr-1" size={14} />
            )}
            <span className={trend >= 0 ? 'text-green-400' : 'text-red-400'}>
              {Math.abs(trend)}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-zinc-400">
          Performance metrikák és insights
        </p>
      </div>

      {/* Overview Stats */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Összes Megtekintés"
            value={overview.total_views || 0}
            icon={Eye}
            color="blue"
          />
          <StatCard
            title="Összes Like"
            value={overview.total_likes || 0}
            icon={Heart}
            color="red"
          />
          <StatCard
            title="Kommentek"
            value={overview.total_comments || 0}
            icon={MessageCircle}
            color="green"
          />
          <StatCard
            title="Új Feliratkozók"
            value={overview.total_subs || 0}
            icon={UserPlus}
            color="purple"
          />
        </div>
      )}

      {/* Key Metrics */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-green-400/10 to-green-600/5 border-green-400/20">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center">
                <Target size={20} className="mr-2" />
                Átlag Retention Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-5xl font-bold text-white mb-2">
                  {overview.avg_retention?.toFixed(1) || 0}%
                </p>
                <p className="text-sm text-zinc-400">
                  Script effectiveness (3-30s nézettség)
                </p>
                <div className="mt-4 pt-4 border-t border-green-400/20">
                  <div className="flex items-center justify-center space-x-2">
                    {overview.avg_retention >= 60 ? (
                      <>
                        <Badge className="bg-green-400/10 text-green-400">Kiváló</Badge>
                        <span className="text-xs text-zinc-500">60%+ = jó teljesítmény</span>
                      </>
                    ) : (
                      <>
                        <Badge className="bg-yellow-400/10 text-yellow-400">Fejleszthető</Badge>
                        <span className="text-xs text-zinc-500">Cél: 60%+</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-400/10 to-purple-600/5 border-purple-400/20">
            <CardHeader>
              <CardTitle className="text-purple-400 flex items-center">
                <Zap size={20} className="mr-2" />
                Átlag Swipe Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-5xl font-bold text-white mb-2">
                  {overview.avg_swipe_rate?.toFixed(1) || 0}%
                </p>
                <p className="text-sm text-zinc-400">
                  Hook effectiveness (0-3s megtartás)
                </p>
                <div className="mt-4 pt-4 border-t border-purple-400/20">
                  <div className="flex items-center justify-center space-x-2">
                    {overview.avg_swipe_rate >= 70 ? (
                      <>
                        <Badge className="bg-purple-400/10 text-purple-400">Kiváló</Badge>
                        <span className="text-xs text-zinc-500">70%+ = erős hook</span>
                      </>
                    ) : (
                      <>
                        <Badge className="bg-yellow-400/10 text-yellow-400">Fejleszthető</Badge>
                        <span className="text-xs text-zinc-500">Cél: 70%+</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hook Type Performance */}
      {hookPerformance.length > 0 && (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Hook Típus Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {hookPerformance.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge className="bg-amber-400/10 text-amber-400 text-xs">
                        {item.hook_type || 'Unknown'}
                      </Badge>
                      <span className="text-xs text-zinc-500">{item.count}× használva</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-xs text-zinc-500">Retention</p>
                        <p className="text-sm font-semibold text-white">{item.avg_retention?.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Views</p>
                        <p className="text-sm font-semibold text-white">{item.total_views?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="w-24 bg-zinc-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-600"
                      style={{ width: `${Math.min(item.avg_retention || 0, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Time Series */}
      {timeSeries.length > 0 && (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Legutóbbi Metrikák</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {timeSeries.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg text-sm">
                  <span className="text-zinc-400">
                    {new Date(item.created_at).toLocaleDateString('hu-HU')}
                  </span>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Eye size={14} className="text-blue-400" />
                      <span className="text-white">{item.views}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart size={14} className="text-red-400" />
                      <span className="text-white">{item.likes}</span>
                    </div>
                    <Badge className="bg-green-400/10 text-green-400 text-xs">
                      {item.retention_percent?.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!overview && (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="py-12 text-center">
            <TrendingUp className="mx-auto mb-4 text-zinc-600" size={64} />
            <h3 className="text-xl font-semibold text-white mb-2">
              Még nincs analytics adat
            </h3>
            <p className="text-zinc-400">
              Töltsd fel a Notion CSV-t vagy adj hozzá metrics-et
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
