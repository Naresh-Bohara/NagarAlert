import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useController } from 'react-hook-form';
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";

import { 
  Eye, EyeOff, Upload, X, 
  ChevronDown, Check, AlertCircle 
} from 'lucide-react';

// ============ FORM LABEL ============
export const FormLabel = ({ htmlFor, label, required = false }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
    {label} {required && <span className="text-red-500">*</span>}
  </label>
);

// ============ TEXT INPUT ============
export const TextInput = ({
  control,
  name,
  label = '',
  type = 'text',
  placeholder = '',
  required = false,
  icon: Icon,
  disabled = false,
  className = '',
  validation = {},
  showError = true
}) => {
  const { field, fieldState: { error } } = useController({
    name,
    control,
    rules: {
      required: required ? `${label} is required` : false,
      ...validation
    }
  });

  return (
    <div className={`mb-4 ${className}`}>
      {label && <FormLabel htmlFor={name} label={label} required={required} />}
      
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Icon size={18} />
          </div>
        )}
        
        <motion.input
          whileTap={{ scale: 0.995 }}
          type={type}
          id={name}
          {...field}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2
            ${Icon ? 'pl-10' : ''}
            ${error 
              ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-200' 
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            transition-all duration-200
          `}
        />
        
        {error && showError && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 flex items-center text-sm text-red-600"
          >
            <AlertCircle size={14} className="mr-1" />
            {error.message}
          </motion.div>
        )}
      </div>
    </div>
  );
};

// ============ PASSWORD INPUT ============
export const PasswordInput = ({
  control,
  name,
  label = 'Password',
  placeholder = 'Enter your password',
  required = false,
  showToggle = true,
  showStrength = false,
  ...props
}) => {
  const [visible, setVisible] = useState(false);
  const { field, fieldState: { error } } = useController({
    name,
    control,
    rules: {
      required: required ? `${label} is required` : false,
      minLength: { value: 6, message: 'Minimum 6 characters' }
    }
  });

  const calculateStrength = (password) => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return Math.min(score, 4);
  };

  const strength = calculateStrength(field.value);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-400', 'bg-green-600'];

  return (
    <div className="mb-4">
      {label && <FormLabel htmlFor={name} label={label} required={required} />}
      
      <div className="relative">
        <motion.input
          whileTap={{ scale: 0.995 }}
          type={visible ? 'text' : 'password'}
          id={name}
          {...field}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 
                   focus:border-primary-500 focus:ring-2 focus:ring-primary-200 
                   focus:outline-none transition-all duration-200"
          {...props}
        />
        
        {showToggle && (
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 
                     text-gray-400 hover:text-gray-600 transition-colors"
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      
      {showStrength && field.value && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex space-x-1 flex-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    i < strength ? strengthColors[i] : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-medium ml-2">{strengthLabels[strength]}</span>
          </div>
        </motion.div>
      )}
      
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-1 flex items-center text-sm text-red-600"
        >
          <AlertCircle size={14} className="mr-1" />
          {error.message}
        </motion.div>
      )}
    </div>
  );
};

// ============ SELECT INPUT ============
export const SelectInput = ({
  control,
  name,
  label = '',
  options = [],
  placeholder = 'Select option',
  required = false,
  defaultValue = '',
  ...props
}) => {
  const { field, fieldState: { error } } = useController({
    name,
    control,
    defaultValue,
    rules: {
      required: required ? `${label} is required` : false
    }
  });

  return (
    <div className="mb-4">
      {label && <FormLabel htmlFor={name} label={label} required={required} />}
      
      <div className="relative">
        <select
          id={name}
          {...field}
          className={`
            w-full px-4 py-3 pr-10 rounded-lg border appearance-none
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
            }
            focus:ring-2 focus:outline-none transition-all duration-200
            bg-white
          `}
          {...props}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <ChevronDown 
          size={18} 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
      
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-1 flex items-center text-sm text-red-600"
        >
          <AlertCircle size={14} className="mr-1" />
          {error.message}
        </motion.div>
      )}
    </div>
  );
};

// ============ TEXTAREA INPUT ============
export const TextAreaInput = ({
  control,
  name,
  label = '',
  placeholder = '',
  required = false,
  rows = 4,
  ...props
}) => {
  const { field, fieldState: { error } } = useController({
    name,
    control,
    rules: {
      required: required ? `${label} is required` : false
    }
  });

  return (
    <div className="mb-4">
      {label && <FormLabel htmlFor={name} label={label} required={required} />}
      
      <motion.textarea
        whileTap={{ scale: 0.995 }}
        id={name}
        {...field}
        rows={rows}
        placeholder={placeholder}
        className={`
          w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2
          ${error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
            : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
          }
          transition-all duration-200 resize-none
        `}
        {...props}
      />
      
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-1 flex items-center text-sm text-red-600"
        >
          <AlertCircle size={14} className="mr-1" />
          {error.message}
        </motion.div>
      )}
    </div>
  );
};

// ============ FILE UPLOAD ============
export const FileUpload = ({
  control,
  name,
  label = '',
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB
  required = false,
  preview = true,
  onFileChange,
  ...props
}) => {
  const [previewUrl, setPreviewUrl] = useState('');
  const { field, fieldState: { error } } = useController({
    name,
    control,
    rules: {
      required: required ? `${label} is required` : false,
      validate: {
        fileSize: (file) => 
          !file || file.size <= maxSize || `File must be less than ${maxSize/1024/1024}MB`,
        fileType: (file) =>
          !file || accept.split(',').some(type => file.type.match(type.replace('*', ''))) 
          || 'Invalid file type'
      }
    }
  });

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      field.onChange(file);
      
      // Create preview
      if (preview && file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
      
      if (onFileChange) onFileChange(file);
    }
  }, [field, preview, onFileChange]);

  const removeFile = useCallback(() => {
    field.onChange(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
  }, [field, previewUrl]);

  return (
    <div className="mb-4">
      {label && <FormLabel htmlFor={name} label={label} required={required} />}
      
      <input
        type="file"
        id={name}
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        {...props}
      />
      
      {!field.value ? (
        <motion.label
          htmlFor={name}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="block p-6 border-2 border-dashed border-gray-300 rounded-lg 
                   cursor-pointer hover:border-primary-500 transition-colors text-center"
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="p-3 rounded-full bg-gray-100">
              <Upload className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Click to upload or drag & drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Max file size: {maxSize/1024/1024}MB
              </p>
            </div>
          </div>
        </motion.label>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          {preview && previewUrl && (
            <div className="mb-3">
              <div className="relative w-24 h-24">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white 
                           rounded-full flex items-center justify-center"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700 truncate">
              {field.value.name}
            </span>
            <button
              type="button"
              onClick={removeFile}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        </motion.div>
      )}
      
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-1 flex items-center text-sm text-red-600"
        >
          <AlertCircle size={14} className="mr-1" />
          {error.message}
        </motion.div>
      )}
    </div>
  );
};

// ============ RICH TEXT EDITOR ============
export const RichTextEditor = ({
  control,
  name,
  label = '',
  required = false,
  ...props
}) => {
  const { field, fieldState: { error } } = useController({
    name,
    control,
    rules: {
      required: required ? `${label} is required` : false
    }
  });

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ]
  };

  return (
    <div className="mb-4">
      {label && <FormLabel htmlFor={name} label={label} required={required} />}
      
     <SimpleMDE
  value={field.value || ""}
  onChange={(value) => field.onChange(value)}
  onBlur={field.onBlur}
  options={{
    spellChecker: false,
    autofocus: false,
    placeholder: props.placeholder || "Write something...",
    status: false,
  }}
  className="border rounded-lg"
  {...props}
/>

      
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-1 flex items-center text-sm text-red-600"
        >
          <AlertCircle size={14} className="mr-1" />
          {error.message}
        </motion.div>
      )}
    </div>
  );
};

// ============ RADIO GROUP ============
export const RadioGroup = ({
  control,
  name,
  label = '',
  options = [],
  required = false,
  ...props
}) => {
  const { field, fieldState: { error } } = useController({
    name,
    control,
    rules: {
      required: required ? `${label} is required` : false
    }
  });

  return (
    <div className="mb-4">
      {label && <FormLabel htmlFor={name} label={label} required={required} />}
      
      <div className="flex flex-wrap gap-4">
        {options.map((option, index) => (
          <label
            key={index}
            htmlFor={`${name}-${option.value}`}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="radio"
              id={`${name}-${option.value}`}
              value={option.value}
              checked={field.value === option.value}
              onChange={(e) => field.onChange(e.target.value)}
              className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
              {...props}
            />
            <span className="text-sm text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
      
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-1 flex items-center text-sm text-red-600"
        >
          <AlertCircle size={14} className="mr-1" />
          {error.message}
        </motion.div>
      )}
    </div>
  );
};

export { LocationInput } from './LocationInput';