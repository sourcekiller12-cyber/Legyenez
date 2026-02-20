import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { FileText, Bookmark, TrendingUp, Play, Sparkles, Upload, BarChart } from 'lucide-react';

export default function DashboardOverview() {
  const { user, api } = useAuth();
  const [stats, setStats] = useState({
    total_scripts: 0,
    total_hooks: 0,
    avg_retention: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [scriptsRes, hooksRes, analyticsRes] = await Promise.all([
        api.get('/scripts?limit=10'),
        api.get('/hooks?limit=10'),
        api.get('/analytics/overview')
      ]);

      setStats({
        total_scripts: scriptsRes.data.length,
        total_hooks: hooksRes.data.length,
        avg_retention: analyticsRes.data.avg_retention || 0
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
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

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-2">
        <h1 className="text-5xl font-bold text-white">
          Üdv, {user?.name}! 👋
        </h1>
        <p className="text-xl text-zinc-400">
          Készen állsz piacképes YouTube Shorts-okat készíteni?
        </p>
      </div>

      {/* Stats Cards - Compact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 mb-1">Scriptek</p>
                <p className="text-4xl font-bold text-white">{stats.total_scripts}</p>
              </div>
              <div className="p-3 bg-amber-400/10 rounded-xl">
                <FileText className="text-amber-400" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 mb-1">Hookók</p>
                <p className="text-4xl font-bold text-white">{stats.total_hooks}</p>
              </div>
              <div className="p-3 bg-blue-400/10 rounded-xl">
                <Bookmark className="text-blue-400" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 mb-1">Átlag Retention</p>
                <p className="text-4xl font-bold text-white">{stats.avg_retention.toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-green-400/10 rounded-xl">
                <TrendingUp className="text-green-400" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Large Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/dashboard/scripts" className="group">
          <Card className="bg-gradient-to-br from-amber-400/10 to-amber-600/5 border-amber-400/20 hover:border-amber-400/50 transition-all cursor-pointer h-full">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
              <div className="p-4 bg-amber-400/10 rounded-full group-hover:scale-110 transition-transform">
                <Sparkles className="text-amber-400" size={32} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Script Generálás</h3>
                <p className="text-sm text-zinc-400">AI-powered német faith scriptek</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/dashboard/videos" className="group">
          <Card className="bg-gradient-to-br from-blue-400/10 to-blue-600/5 border-blue-400/20 hover:border-blue-400/50 transition-all cursor-pointer h-full">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
              <div className="p-4 bg-blue-400/10 rounded-full group-hover:scale-110 transition-transform">
                <Play className="text-blue-400" size={32} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Videó Készítés</h3>
                <p className="text-sm text-zinc-400">TTS + B-roll + karaoke</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/dashboard/notion-analytics" className="group">
          <Card className="bg-gradient-to-br from-green-400/10 to-green-600/5 border-green-400/20 hover:border-green-400/50 transition-all cursor-pointer h-full">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
              <div className="p-4 bg-green-400/10 rounded-full group-hover:scale-110 transition-transform">
                <Upload className="text-green-400" size={32} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Analytics Feltöltés</h3>
                <p className="text-sm text-zinc-400">CSV import Notion-ből</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Getting Started - Simplified */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-8">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-amber-400/10 rounded-xl shrink-0">
              <BarChart className="text-amber-400" size={28} />
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Hogyan kezdj neki?</h3>
                <p className="text-zinc-400">Kövesd ezeket a lépéseket a sikeres YouTube Shorts készítéséhez</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start space-x-3">
                  <span className="flex items-center justify-center w-6 h-6 bg-amber-400/10 text-amber-400 rounded-full font-semibold text-xs shrink-0">1</span>
                  <div>
                    <p className="text-white font-medium">Generálj AI scripteket</p>
                    <p className="text-zinc-500">Emotional faith-based tartalommal</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="flex items-center justify-center w-6 h-6 bg-amber-400/10 text-amber-400 rounded-full font-semibold text-xs shrink-0">2</span>
                  <div>
                    <p className="text-white font-medium">Töltsd fel analytics adatokat</p>
                    <p className="text-zinc-500">CSV-ből vagy Notion API-val</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="flex items-center justify-center w-6 h-6 bg-amber-400/10 text-amber-400 rounded-full font-semibold text-xs shrink-0">3</span>
                  <div>
                    <p className="text-white font-medium">ML-optimalizált generálás</p>
                    <p className="text-zinc-500">Top patterns alapján</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="flex items-center justify-center w-6 h-6 bg-amber-400/10 text-amber-400 rounded-full font-semibold text-xs shrink-0">4</span>
                  <div>
                    <p className="text-white font-medium">Készíts piacképes videót</p>
                    <p className="text-zinc-500">Teljes video pipeline</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
