import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { FileText, Bookmark, TrendingUp, Play, ArrowRight } from 'lucide-react';

export default function DashboardOverview() {
  const { user, api } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    total_scripts: 0,
    total_hooks: 0,
    avg_retention: 0,
    total_videos: 0
  });
  const [recentScripts, setRecentScripts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const [scriptsRes, hooksRes, analyticsRes] = await Promise.all([
        api.get('/scripts?limit=5'),
        api.get('/hooks?limit=10'),
        api.get('/analytics/overview')
      ]);

      setStats({
        total_scripts: scriptsRes.data.length,
        total_hooks: hooksRes.data.length,
        avg_retention: analyticsRes.data.avg_retention || 0,
        total_videos: analyticsRes.data.total_metrics || 0
      });

      setRecentScripts(scriptsRes.data.slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, link }) => (
    <Link to={link}>
      <Card className="bg-zinc-900 border-zinc-800 hover:border-amber-400/50 transition-all cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400 mb-1">{title}</p>
              <h3 className="text-3xl font-bold text-white">{value}</h3>
            </div>
            <div className={`p-3 rounded-lg bg-${color}-400/10`}>
              <Icon className={`text-${color}-400`} size={28} />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-amber-400 text-lg">Betöltés...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
          {t('welcome')}, {user?.name}! 👋
        </h1>
        <p className="text-zinc-400">Készen állsz piacképes YouTube Shorts-okat készíteni?</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('total_scripts')}
          value={stats.total_scripts}
          icon={FileText}
          color="amber"
          link="/dashboard/scripts"
        />
        <StatCard
          title={t('total_hooks')}
          value={stats.total_hooks}
          icon={Bookmark}
          color="blue"
          link="/dashboard/hooks"
        />
        <StatCard
          title={t('avg_retention')}
          value={`${stats.avg_retention.toFixed(1)}%`}
          icon={TrendingUp}
          color="green"
          link="/dashboard/analytics"
        />
        <StatCard
          title="Videók"
          value={stats.total_videos}
          icon={Play}
          color="purple"
          link="/dashboard/videos"
        />
      </div>

      {/* Quick Actions */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            Gyors Műveletek
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/dashboard/scripts">
            <Button className="w-full bg-amber-400 hover:bg-amber-500 text-zinc-950 font-semibold">
              <FileText size={20} className="mr-2" />
              Új Script Generálás
            </Button>
          </Link>
          <Link to="/dashboard/videos">
            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold">
              <Play size={20} className="mr-2" />
              Videó Készítés
            </Button>
          </Link>
          <Link to="/dashboard/notion-analytics">
            <Button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold">
              <TrendingUp size={20} className="mr-2" />
              Analytics Feltöltés
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recent Scripts */}
      {recentScripts.length > 0 && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
              Legutóbbi Scriptek
            </CardTitle>
            <Link to="/dashboard/scripts">
              <Button variant="ghost" className="text-amber-400 hover:text-amber-300">
                Összes megtekintése
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentScripts.map((script) => (
              <div
                key={script.id}
                className="p-4 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-amber-400/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-white">{script.topic}</h4>
                  <span className="text-xs text-zinc-500">
                    {new Date(script.created_at).toLocaleDateString('hu-HU')}
                  </span>
                </div>
                <p className="text-sm text-zinc-400 line-clamp-2 mb-3">{script.script}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-amber-400/10 text-amber-400 text-xs rounded">
                      {script.hook_type}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {script.character_count} karakter
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Getting Started Guide */}
      <Card className="bg-gradient-to-br from-amber-400/10 to-amber-600/5 border-amber-400/20">
        <CardHeader>
          <CardTitle className="text-amber-400" style={{ fontFamily: 'Playfair Display, serif' }}>
            🚀 Kezdd el a Munkát!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-zinc-300">
          <p className="flex items-start">
            <span className="text-amber-400 mr-2">1.</span>
            <span>Generálj emotional faith-based scripteket AI-val</span>
          </p>
          <p className="flex items-start">
            <span className="text-amber-400 mr-2">2.</span>
            <span>Töltsd fel Notion analytics adataidat CSV-ből</span>
          </p>
          <p className="flex items-start">
            <span className="text-amber-400 mr-2">3.</span>
            <span>Használd az ML-optimalizált script generálást a top patterns alapján</span>
          </p>
          <p className="flex items-start">
            <span className="text-amber-400 mr-2">4.</span>
            <span>Készíts piacképes videókat TTS + B-roll + karaoke feliratokkal</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
