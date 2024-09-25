import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { FormGroup, FileInput } from '@blueprintjs/core';
import styles from './fileUpload.module.css';

const MyFileInput = forwardRef((props: any, ref) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      props.onFileSelect && props.onFileSelect(file);
    }
      };

  useImperativeHandle(ref, () => ({
    clearInput() {
      setSelectedFile(null); 
      if (fileInputRef.current) {
        
        console.log("Clearing input");
        fileInputRef.current.value =''
        
      }
    }
  }));

  return (
    <FormGroup label={props.title} labelFor="file-input">
      <FileInput
        text={selectedFile ? selectedFile.name : 'Choose file...'}
        onInputChange={handleFileChange}
        fill={true}
        className={styles.fileInput}
        inputProps={{ ref: fileInputRef }}
      />
    </FormGroup>
  );
});

export default MyFileInput;