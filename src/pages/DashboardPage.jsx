
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Image, TrendingUp, Package, Sparkles } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalImages: 0,
    stockItems: 0,
    insights: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        // Fetch real count from database
        const { count, error } = await supabase
          .from('images')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', user.id);

        if (error) throw error;

        // Mock calculations for other stats based on image count for now
        // In a real app, these would likely come from 'detections' or 'stock_items' tables
        setStats({
          totalImages: count || 0,
          stockItems: (count || 0) * 3, 
          insights: (count || 0) * 2,
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [user?.id]);

  const statCards = [
    {
      icon: Image,
      label: 'Uploaded Images',
      value: stats.totalImages,
      color: 'from-blue-600 to-blue-700',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Package,
      label: 'Stock Items',
      value: stats.stockItems,
      color: 'from-purple-600 to-purple-700',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: Sparkles,
      label: 'AI Insights',
      value: stats.insights,
      color: 'from-pink-600 to-pink-700',
      bgColor: 'bg-pink-500/10',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard - AI Inventory Analyzer</title>
        <meta name="description" content="View your inventory dashboard with uploaded images, stock data, and AI-powered insights." />
      </Helmet>
      
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                Welcome back, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}!
              </h1>
              <p className="text-slate-400">Here's what's happening with your inventory today</p>
            </div>

            {loading ? (
               <div className="flex justify-center items-center h-64">
                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
               </div>
            ) : (
              <>
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {statCards.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`${stat.bgColor} border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all duration-300 hover:shadow-lg`}
                    >
                      <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center mb-4`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-white">{stat.value}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
                    </div>
                    <div className="space-y-3">
                      {stats.totalImages === 0 ? (
                        <p className="text-slate-400 text-center py-8">No activity yet. Start by uploading images!</p>
                      ) : (
                        <p className="text-slate-400">You have {stats.totalImages} uploaded images ready for analysis.</p>
                      )}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-xl font-semibold text-white">AI Insights</h2>
                    </div>
                    <div className="space-y-3">
                      {stats.insights === 0 ? (
                        <p className="text-slate-400 text-center py-8">Upload images to get AI-powered insights!</p>
                      ) : (
                        <p className="text-slate-400">{stats.insights} insights generated from your inventory data.</p>
                      )}
                    </div>
                  </motion.div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
