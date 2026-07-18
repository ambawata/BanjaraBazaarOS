import React from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { IconUpload } from '@tabler/icons-react';

export default function FileDropzone({ onDrop, accept }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple: false,
  });

  return (
    <motion.div
      {...getRootProps()}
      className={`relative flex flex-col items-center justify-center w-full h-64 p-8 text-center bg-accent-secondary/50 border-2 border-dashed rounded-3xl cursor-pointer transition-colors duration-300 ease-in-out`}
      whileHover={{ scale: 1.02, borderColor: 'var(--accent)' }}
      variants={{
        active: {
          backgroundColor: 'var(--accent-secondary)',
          borderColor: 'var(--accent)',
        },
        inactive: {
          backgroundColor: 'rgba(245, 243, 255, 0.5)',
          borderColor: 'rgba(109, 74, 255, 0.3)',
        },
      }}
      animate={isDragActive ? 'active' : 'inactive'}
    >
      <input {...getInputProps()} />

      <motion.div
        className="flex flex-col items-center justify-center"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <IconUpload size={48} strokeWidth={1.5} className="text-accent mb-4" />
        <h3 className="text-lg font-semibold text-gray-800">
          {isDragActive ? "Drop the file here..." : "Drag & drop your floor plan"}
        </h3>
        <p className="text-gray-500 mt-1">or click to select a file</p>
        <p className="text-xs text-gray-400 mt-4">Supports: PNG, JPG, GIF</p>
      </motion.div>
    </motion.div>
  );
}
