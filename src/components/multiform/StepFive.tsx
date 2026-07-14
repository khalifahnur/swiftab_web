import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { UploadCloud, Image as ImageIcon, CircleUser } from "lucide-react";
import imageCompression from 'browser-image-compression';

interface StepFiveProps {
  formik: {
    values: { logo: File | null; coverImage: File | null; };
    setFieldValue: (field: string, value: File | null) => void;
    errors: { logo?: string; coverImage?: string; };
    touched: { logo?: boolean; coverImage?: boolean; };
  };
}

export function StepFive({ formik }: StepFiveProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [dragState, setDragState] = useState({ logo: false, cover: false });

  const processFile = async (file: File, type: 'logo' | 'coverImage') => {
    try {
      const options = {
        maxSizeMB: type === 'logo' ? 0.1 : 0.4,
        maxWidthOrHeight: type === 'logo' ? 512 : 1920,
        useWebWorker: true,
      };

      const compressedBlob = await imageCompression(file, options);
      const compressedFile = new File([compressedBlob], file.name, {
        type: file.type,
        lastModified: Date.now(),
      });

      if (type === 'logo') {
        setLogoPreview(URL.createObjectURL(compressedFile));
        formik.setFieldValue("stepFive.logo", compressedFile);
      } else {
        setCoverPreview(URL.createObjectURL(compressedFile));
        formik.setFieldValue("stepFive.coverImage", compressedFile);
      }
    } catch (error) {
      console.error(`Error compressing ${type}:`, error);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, type: 'logo' | 'coverImage') => {
    e.preventDefault();
    setDragState(prev => ({ ...prev, [type]: false }));
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file, type);
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Branding & Assets</h3>
        <p className="text-sm text-gray-500 mb-2">Upload high-quality images to represent your restaurant.</p>
      </div>

      {/* Logo Upload Zone */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
        <div 
          className={`relative flex items-center justify-center w-28 h-28 rounded-full border-2 border-dashed transition-all duration-300 overflow-hidden cursor-pointer shrink-0
            ${dragState.logo ? "border-[#008080] bg-[#008080]/5" : "border-gray-300 bg-white hover:border-[#008080]/50"}`}
          onDragOver={(e) => { e.preventDefault(); setDragState(p => ({ ...p, logo: true })); }}
          onDragLeave={(e) => { e.preventDefault(); setDragState(p => ({ ...p, logo: false })); }}
          onDrop={(e) => handleDrop(e, 'logo')}
        >
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => { if (e.target.files?.[0]) processFile(e.target.files[0], 'logo'); }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          {!logoPreview ? (
            <CircleUser className="h-10 w-10 text-gray-300" />
          ) : (
            <Image src={logoPreview} alt="Logo" fill className="object-cover" />
          )}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <Label className="text-sm font-bold text-gray-900">Restaurant Logo</Label>
          <p className="text-xs text-gray-500 mt-1 mb-2">A square image works best (1:1 ratio). This will appear on receipts and the mobile app.</p>
          <p className="text-xs font-semibold text-gray-400">PNG or JPG, max 1MB.</p>
          {formik.touched.logo && formik.errors.logo && (
            <p className="text-red-500 text-xs font-bold mt-2">{formik.errors.logo}</p>
          )}
        </div>
      </div>

      {/* Cover Image Upload Zone */}
      <div className="space-y-3">
        <Label className="text-sm font-bold text-gray-900">Cover Image</Label>
        <p className="text-xs text-gray-500 mb-2">This is the wide banner image customers will see first.</p>
        
        <div
          className={`relative group flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-2xl transition-all duration-300 overflow-hidden cursor-pointer
            ${dragState.cover ? "border-[#008080] bg-[#008080]/5" : "border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300"}`}
          onDragOver={(e) => { e.preventDefault(); setDragState(p => ({ ...p, cover: true })); }}
          onDragLeave={(e) => { e.preventDefault(); setDragState(p => ({ ...p, cover: false })); }}
          onDrop={(e) => handleDrop(e, 'coverImage')}
        >
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => { if (e.target.files?.[0]) processFile(e.target.files[0], 'coverImage'); }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />

          {!coverPreview ? (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="h-14 w-14 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 border border-gray-100">
                <UploadCloud className="h-6 w-6 text-gray-400 group-hover:text-[#008080] transition-colors" />
              </div>
              <p className="text-sm font-bold text-gray-700">Click to upload or drag & drop</p>
              <p className="text-xs text-gray-500 mt-1">Recommended size: 1920x1080px</p>
            </div>
          ) : (
            <>
              <Image src={coverPreview} alt="Cover Preview" fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none z-10">
                <span className="text-white font-bold flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" /> Replace Image
                </span>
              </div>
            </>
          )}
        </div>
        {formik.touched.coverImage && formik.errors.coverImage && (
          <p className="text-red-500 text-xs font-bold mt-1">{formik.errors.coverImage}</p>
        )}
      </div>
    </div>
  );
}