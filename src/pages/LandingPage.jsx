
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Sparkles, Camera, BarChart3, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LandingPage = () => {
  const features = [
    {
      icon: Camera,
      title: 'Smart Image Upload',
      description: 'Upload shelf and item images with secure cloud storage',
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Insights',
      description: 'Get intelligent inventory analysis and recommendations',
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Track stock levels and trends with interactive dashboards',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Enterprise-grade security for your inventory data',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Instant image processing and data synchronization',
    },
    {
      icon: Package,
      title: 'Complete Tracking',
      description: 'Monitor every item from upload to insights',
    },
  ];

  return (
    <>
      <Helmet>
        <title>AI Inventory Analyzer - AI-Powered Inventory Management</title>
        <meta name="description" content="Transform your inventory management with AI-powered insights, smart image upload, and real-time analytics." />
      </Helmet>
      
      <div className="min-h-screen bg-black">
        <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">AI Inventory Analyzer</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" className="text-white hover:bg-slate-800">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/20">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </nav>

        <section className="container mx-auto px-4 py-20 lg:py-32 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-300 font-medium">AI-Powered Inventory Management</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Revolutionize Your Inventory
            </h1>
            
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              Leverage advanced AI to effortlessly analyze images, gain deep insights, and optimize your stock.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl shadow-blue-500/30 px-8 py-6 text-lg">
                  Start Analyzing Now
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

        <section className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Key Features
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Powerful tools designed to elevate your inventory workflow
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group p-6 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Enhance Your Inventory?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join businesses transforming their inventory with AI-powered analysis
            </p>
            <Link to="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 px-8 py-6 text-lg shadow-xl">
                Create Account
              </Button>
            </Link>
          </motion.div>
        </section>

        <footer className="border-t border-slate-800 bg-slate-900/50 py-8">
          <div className="container mx-auto px-4 text-center text-slate-400">
            <p>&copy; 2025 AI Inventory Analyzer. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;
