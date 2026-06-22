import React, { useRef, useState } from 'react';
import { Button, Typography } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';

interface UploadPdfProps {
  label?: string;
  onFileSelected: (file: File) => void;
}

export default function UploadPdf({
  label = 'Cargar Plano PDF',
  onFileSelected,
}: UploadPdfProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setFileName(file.name);
      onFileSelected(file);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        style={{ display: 'none' }}
        onChange={handleChange}
      />
      <Button
        variant="outlined"
        startIcon={<UploadFileIcon />}
        onClick={() => inputRef.current?.click()}
      >
        {label}
      </Button>
      {fileName && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          {fileName}
        </Typography>
      )}
    </div>
  );
}
