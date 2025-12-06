import React from 'react'
import { motion } from 'framer-motion'

const Card = ({
  children,
  className = '',
  hoverable = false,
  padding = true,
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hoverable ? { y: -2 } : {}}
      className={`
        bg-white rounded-xl shadow-card
        ${hoverable ? 'hover:shadow-lg transition-shadow duration-300' : ''}
        ${padding ? 'p-6' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default Card