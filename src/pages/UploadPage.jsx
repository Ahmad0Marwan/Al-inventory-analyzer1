
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, Image as ImageIcon, Trash2, Calendar, ScanEye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const UploadPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loadingImages, setLoadingImages] = useState(true);
  const [analyzingIds, setAnalyzingIds] = useState(new Set());

  useEffect(() => {
    if (user?.id) {
      loadImages();
    }
  }, [user?.id]);

  const loadImages = async () => {
    setLoadingImages(true);
    try {
      // Fetch images and check if they have detections
      const { data, error } = await supabase
        .from('images')
        .select(`
          *,
          detections (id)
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const imagesWithUrls = await Promise.all(data.map(async (img) => {
          const { data: urlData } = await supabase
            .storage
            .from('images')
            .createSignedUrl(img.storage_path, 3600); // 1 hour expiry

          return {
            ...img,
            url: urlData?.signedUrl,
            name: img.original_name || 'Untitled',
            uploadDate: img.created_at,
            hasAnalysis: img.detections && img.detections.length > 0
          };
      }));

      setImages(imagesWithUrls);
    } catch (error) {
      console.error('Error loading images:', error);
      // Keeping error notifications for critical failures, but can be removed if requested
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your images.",
      });
    } finally {
      setLoadingImages(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    let successCount = 0;
    let errors = [];

    try {
      for (const file of files) {
        // 1. Upload to Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, file);

        if (uploadError) {
          errors.push(`Failed to upload ${file.name}: ${uploadError.message}`);
          continue;
        }

        // 2. Create DB Record
        const { error: dbError } = await supabase
          .from('images')
          .insert([{
            owner_id: user.id,
            storage_path: filePath,
            original_name: file.name,
            status: 'uploaded',
            bytes: file.size
          }]);

        if (dbError) {
           errors.push(`Failed to save metadata for ${file.name}: ${dbError.message}`);
           continue;
        }

        successCount++;
      }

      if (successCount > 0) {
        // Notification disabled as requested
        // toast({
        //   title: "Upload Successful",
        //   description: `${successCount} image(s) uploaded successfully`,
        // });
        loadImages();
      }

      if (errors.length > 0) {
         toast({
           variant: "destructive",
           title: "Some uploads failed",
           description: errors[0],
         });
      }

    } catch (error) {
      console.error('Upload process error:', error);
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: "An unexpected error occurred during upload.",
      });
    } finally {
      setUploading(false);
      e.target.value = null; 
    }
  };

  const handleDelete = async (id, storagePath) => {
    try {
      const { error: storageError } = await supabase.storage
        .from('images')
        .remove([storagePath]);

      if (storageError) throw new Error(`Storage delete failed: ${storageError.message}`);

      const { error: dbError } = await supabase
        .from('images')
        .delete()
        .eq('id', id);

      if (dbError) throw new Error(`Database delete failed: ${dbError.message}`);

      setImages(images.filter(img => img.id !== id));
      
      // Keeping delete notification as it's a destructive action, but strictly interpreting "image upload events" as just uploads.
      toast({
        title: "Image Deleted",
        description: "Image has been removed from your AI Inventory Analyzer library",
      });
    } catch (error) {
       console.error('Delete error:', error);
       toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Could not delete the image.",
      });
    }
  };

  const handleAnalyze = async (image) => {
    if (analyzingIds.has(image.id)) return;

    try {
      setAnalyzingIds(prev => new Set(prev).add(image.id));
      // Notifications disabled as requested
      // toast({
      //   title: "Analysis Started",
      //   description: "AI is analyzing your shelf image...",
      // });

      const { data, error } = await supabase.functions.invoke('analyze-image', {
        body: {
          image_url: image.url,
          image_id: image.id
        }
      });

      if (error) throw error;

      // Notifications disabled as requested
      // toast({
      //   title: "Analysis Complete",
      //   description: "Products detected successfully!",
      // });

      navigate(`/results/${image.id}`);

    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error.message || "Failed to analyze image. Please try again.",
      });
    } finally {
      setAnalyzingIds(prev => {
        const next = new Set(prev);
        next.delete(image.id);
        return next;
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Upload Images - AI Inventory Analyzer</title>
        <meta name="description" content="Upload shelf and item images for AI-powered inventory analysis." />
      </Helmet>
      
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Upload Images</h1>
              <p className="text-slate-400">Upload shelf and item images for AI analysis</p>
            </div>

            <div className="mb-8">
              <label htmlFor="file-upload" className={`cursor-pointer block ${uploading ? 'pointer-events-none opacity-50' : ''}`}>
                <div className="border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-xl p-12 text-center transition-all duration-300 bg-gradient-to-br from-slate-900 to-slate-800 group">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      {uploading ? (
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                      ) : (
                        <Upload className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-white mb-2">
                        {uploading ? 'Uploading to Cloud...' : 'Click to upload images'}
                      </p>
                      <p className="text-slate-400">Supports JPG, PNG, WEBP up to 10MB</p>
                    </div>
                  </div>
                </div>
              </label>
              <input
                id="file-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </div>

            {loadingImages ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading your secure library...</p>
                </div>
            ) : images.length === 0 ? (
              <div className="text-center py-12 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl">
                <ImageIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No images uploaded yet</p>
                <p className="text-slate-500 text-sm">Start by uploading your first image</p>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Your Library ({images.length})
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {images.map((image, index) => (
                    <motion.div
                      key={image.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-blue-500 transition-all duration-300 flex flex-col"
                    >
                      <div className="aspect-video bg-slate-800 overflow-hidden relative">
                         {!image.url && (
                             <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                                 <ImageIcon className="w-8 h-8 text-slate-600" />
                             </div>
                         )}
                        <img
                          src={image.url}
                          alt={image.name}
                          loading="lazy"
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                        {image.hasAnalysis && (
                          <div className="absolute top-2 right-2 bg-green-500/90 text-white text-xs px-2 py-1 rounded-full font-medium backdrop-blur-sm shadow-sm flex items-center gap-1">
                            <ScanEye className="w-3 h-3" />
                            Analyzed
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <p className="text-white font-medium mb-1 truncate" title={image.name}>{image.name}</p>
                        <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(image.uploadDate).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="mt-auto flex gap-2">
                          {image.hasAnalysis ? (
                            <Link to={`/results/${image.id}`} className="flex-1">
                              <Button className="w-full bg-slate-700 hover:bg-slate-600 text-white">
                                View Results
                              </Button>
                            </Link>
                          ) : (
                            <Button 
                              onClick={() => handleAnalyze(image)}
                              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/20"
                              disabled={analyzingIds.has(image.id)}
                            >
                              {analyzingIds.has(image.id) ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Analyzing...
                                </>
                              ) : (
                                <>
                                  <ScanEye className="w-4 h-4 mr-2" />
                                  Analyze with AI
                                </>
                              )}
                            </Button>
                          )}
                          
                          <Button
                            onClick={() => handleDelete(image.id, image.storage_path)}
                            variant="destructive"
                            size="icon"
                            className="shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default UploadPage;
