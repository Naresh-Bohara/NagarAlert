import React from 'react'
import { motion } from 'framer-motion'
import { Loader as LoaderIcon } from 'lucide-react'

const Loader = ({ size = 'md', message = 'Loading...', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={`${sizeClasses[size]} text-primary-600`}
      >
        <LoaderIcon className="w-full h-full" />
      </motion.div>
      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-sm text-gray-600"
        >
          {message}
        </motion.p>
      )}
    </div>
  )
}

export default Loader