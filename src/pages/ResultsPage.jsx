
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { 
  ArrowLeft, 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Calendar, 
  FileText,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ResultsPage = () => {
  const { imageId } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    image: null,
    detections: null
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user?.id && imageId) {
      fetchResults();
    }
  }, [user?.id, imageId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Image Details
      const { data: imageData, error: imageError } = await supabase
        .from('images')
        .select('*')
        .eq('id', imageId)
        .single();

      if (imageError) throw imageError;

      // 2. Create Signed URL
      const { data: urlData } = await supabase
        .storage
        .from('images')
        .createSignedUrl(imageData.storage_path, 3600);

      // 3. Fetch Detections
      const { data: detectionData, error: detectionError } = await supabase
        .from('detections')
        .select('*')
        .eq('image_id', imageId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Note: It's possible there are no detections yet if user navigated here manually 
      // but usually they come from UploadPage after analysis.
      
      setData({
        image: {
          ...imageData,
          url: urlData?.signedUrl
        },
        detections: detectionData ? detectionData.labels : null
      });

    } catch (err) {
      console.error('Error fetching results:', err);
      setError('Failed to load analysis results.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status?.toLowerCase().includes('low')) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    return 'text-green-400 bg-green-400/10 border-green-400/20';
  };

  const getStatusIcon = (status) => {
    if (status?.toLowerCase().includes('low')) return <AlertTriangle className="w-4 h-4" />;
    return <CheckCircle2 className="w-4 h-4" />;
  };

  const filteredProducts = data.detections?.products?.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.details.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const totalItems = data.detections?.products?.reduce((acc, curr) => acc + (curr.count || 0), 0) || 0;
  const lowStockCount = data.detections?.products?.filter(p => p.status?.toLowerCase().includes('low')).length || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-slate-400">Loading analysis results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
        <p className="text-slate-400 mb-6">{error}</p>
        <Link to="/upload">
          <Button>Back to Uploads</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Analysis Results - AI Inventory Analyzer</title>
      </Helmet>

      <div className="min-h-screen bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
            <div>
              <Link to="/upload" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Uploads
              </Link>
              <h1 className="text-3xl font-bold text-white">Analysis Results</h1>
              <div className="flex items-center gap-4 mt-2 text-slate-400 text-sm">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(data.image?.created_at).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {data.image?.original_name}
                </span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 flex flex-col items-center">
                <span className="text-slate-400 text-xs uppercase font-bold">Total Items</span>
                <span className="text-white text-xl font-bold">{totalItems}</span>
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 flex flex-col items-center">
                <span className="text-slate-400 text-xs uppercase font-bold">Product Types</span>
                <span className="text-white text-xl font-bold">{data.detections?.products?.length || 0}</span>
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 flex flex-col items-center">
                <span className="text-yellow-500/80 text-xs uppercase font-bold">Low Stock</span>
                <span className="text-white text-xl font-bold">{lowStockCount}</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Image Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden sticky top-6">
                <img 
                  src={data.image?.url} 
                  alt="Analyzed Shelf" 
                  className="w-full h-auto object-contain max-h-[70vh]"
                />
              </div>
            </motion.div>

            {/* Results List Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-400" />
                    Detected Products
                  </h2>
                </div>
                
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-slate-800/50 border-slate-700 text-white focus:border-blue-500"
                  />
                </div>

                {!data.detections ? (
                  <div className="text-center py-12 text-slate-400">
                    <p>No analysis data found for this image.</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                   <div className="text-center py-12 text-slate-400">
                    <p>No products match your search.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    {filteredProducts.map((product, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-blue-500/50 transition-all duration-200"
                      >
                        <div className="flex justify-between items-start gap-4 mb-2">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0 mt-1">
                              <Package className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                              <h3 className="text-white font-medium text-lg">{product.name}</h3>
                              <p className="text-slate-400 text-sm leading-relaxed">{product.details}</p>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 whitespace-nowrap ${getStatusColor(product.status)}`}>
                            {getStatusIcon(product.status)}
                            {product.status}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-11 mt-3">
                          <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Count</div>
                          <div className="h-px flex-1 bg-slate-700/50"></div>
                          <div className="text-white font-mono font-bold">{product.count}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResultsPage;
