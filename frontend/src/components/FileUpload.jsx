import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';


const UploadIcon = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="3em" width="3em" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"></path>
  </svg>
);

function FileUpload({ onFileUpload, loading }) {
  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpeg', '.jpg'],
    }
  });

  const getBorderColor = () => {
    if (isDragAccept) return '#00e676';
    if (isDragReject) return '#ff1744';
    if (isDragActive) return '#2196f3';
    return '#eeeeee';
  };

  return (
    <div
      {...getRootProps()}
      className="dropzone"
      style={{ borderColor: getBorderColor() }}
    >
      <input {...getInputProps()} disabled={loading} />
      <div className="dropzone-content">
        <UploadIcon />
        {isDragActive ? (
          <p>Drop the file to summarize!</p>
        ) : (
          <p>Drag & drop a document here, or click to select a file</p>
        )}
        <em>(PDF or Image files only)</em>
      </div>
    </div>
  );
}

export default FileUpload;