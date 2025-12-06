
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
const SettingsPage = () => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const handleFeatureClick = () => {
    toast({
      title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };

  // Parse user metadata safely
  const displayName = user?.user_metadata?.name || 'Not set';
  const email = user?.email || 'Not set';
  const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown';
  return <>
      <Helmet>
        <title>Settings - AI Inventory Analyzer</title>
        <meta name="description" content="Manage your AI Inventory Analyzer account settings and preferences." />
      </Helmet>
      
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5
        }}>
            <div className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Settings</h1>
              <p className="text-slate-400">Manage your account and preferences for AI Inventory Analyzer</p>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Account Information</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <User className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-400">Full Name</p>
                      <p className="text-white font-medium">{displayName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <Mail className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-400">Email Address</p>
                      <p className="text-white font-medium">{email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-400">Member Since</p>
                      <p className="text-white font-medium">
                        {joinDate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-red-900/50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Account preference</h2>
                <Button onClick={handleFeatureClick} variant="destructive" className="w-full">
                  Delete Account
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>;
};
export default SettingsPage;
