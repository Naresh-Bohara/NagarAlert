import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, MapPin, Users, Bell, LogIn, UserPlus, Home } from 'lucide-react';

const AuthLayout = ({ 
  title, 
  subtitle, 
  children, 
  backLink, 
  backText,
  imageSide = 'right', // 'right' or 'left'
  illustrationType = 'default', // 'register', 'login', 'forgot-password', 'verify', 'default'
  showIllustration = true
}) => {
  const features = [
    { icon: <MapPin />, text: 'Report civic issues with location' },
    { icon: <Shield />, text: 'Secure & verified platform' },
    { icon: <Users />, text: 'Join your local community' },
    { icon: <Bell />, text: 'Real-time updates & notifications' }
  ];

  const getIllustration = () => {
    switch (illustrationType) {
      case 'register':
        return (
          <div className="relative w-full max-w-md">
            <div className="relative">
              <div className="flex items-end justify-center space-x-3 mb-6">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${60 + i * 15}px` }}
                    transition={{ delay: i * 0.1 }}
                    className="w-10 bg-white/25 rounded-t-lg relative"
                  >
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-white/40 rounded-full"></div>
                    <div className="absolute inset-2 grid grid-cols-2 gap-1">
                      {[...Array(4)].map((_, idx) => (
                        <div key={idx} className="bg-white/20 rounded"></div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="h-1.5 bg-white/30 rounded-full mb-6 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="h-0.5 bg-white/50 w-full"></div>
                </div>
                <motion.div 
                  className="absolute -top-1 left-1/4 w-3 h-3 bg-yellow-300 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
                <motion.div 
                  className="absolute -top-1 left-1/2 w-3 h-3 bg-green-300 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                />
                <motion.div 
                  className="absolute -top-1 left-3/4 w-3 h-3 bg-blue-300 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 1 }}
                />
              </div>
              
              <div className="flex justify-around items-start">
                {[
                  { icon: '📝', text: 'Sign Up', color: 'bg-blue-400/30' },
                  { icon: '✅', text: 'Verify', color: 'bg-green-400/30' },
                  { icon: '🏠', text: 'Join', color: 'bg-purple-400/30' }
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.2 }}
                    className="flex flex-col items-center"
                  >
                    <div className={`w-14 h-14 ${item.color} rounded-full flex items-center justify-center mb-2 text-2xl shadow-lg`}>
                      {item.icon}
                    </div>
                    <span className="text-xs text-white/90 font-medium">{item.text}</span>
                  </motion.div>
                ))}
              </div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute -top-4 left-1/4"
              >
                <div className="w-8 h-8 bg-white/25 rounded-full flex items-center justify-center text-lg">
                  👤
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="absolute -top-2 right-1/4"
              >
                <div className="w-6 h-6 bg-white/25 rounded-full flex items-center justify-center text-sm">
                  👤
                </div>
              </motion.div>
            </div>
          </div>
        );

      case 'login':
        return (
          <div className="relative w-full max-w-md">
            <div className="relative">
              <div className="flex justify-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="relative"
                >
                  <div className="w-48 h-32 border-4 border-white/40 rounded-t-full border-b-0 relative">
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-24 bg-white/20 rounded-t-lg">
                      <div className="absolute right-4 top-1/2 w-2 h-4 bg-white/60 rounded-full"></div>
                    </div>
                  </div>
                  
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                    className="absolute top-6 left-1/2 transform -translate-x-1/2 w-16 h-16 border-2 border-white/10 rounded-full"
                  />
                </motion.div>
              </div>
              
              <div className="flex justify-between items-center px-4">
                {[
                  { icon: '🔑', text: 'Credentials', pulse: true },
                  { icon: '→', text: 'Enter' },
                  { icon: '✅', text: 'Access', pulse: true }
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.3 }}
                    className="flex flex-col items-center"
                  >
                    <div className={`w-12 h-12 ${item.pulse ? 'bg-white/30' : 'bg-white/20'} rounded-full flex items-center justify-center mb-2 text-xl`}>
                      {item.icon}
                    </div>
                    <span className="text-xs text-white/80">{item.text}</span>
                  </motion.div>
                ))}
              </div>
              
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute top-4 left-1/2 transform -translate-x-1/2"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-white/30 to-transparent rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </motion.div>
            </div>
          </div>
        );

      case 'forgot-password':
        return (
          <div className="relative w-full max-w-md">
            <div className="relative">
              <div className="flex justify-center items-center space-x-8 mb-8">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="relative"
                >
                  <div className="w-20 h-24 bg-white/30 rounded-lg">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-white/40 rounded-full">
                      <div className="absolute inset-2 bg-white/60 rounded-full"></div>
                    </div>
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-6 border-4 border-white/50 rounded-t-full border-b-0"></div>
                  </div>
                </motion.div>
                
                <motion.div
                  animate={{ x: [-10, 10, -10] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="relative"
                >
                  <div className="w-16 h-4 bg-white/40 rounded-full"></div>
                  <div className="absolute -top-2 right-0 w-4 h-8 bg-white/50 rounded"></div>
                  <div className="absolute -top-1 left-4 w-2 h-2 bg-white/60 rounded"></div>
                  <div className="absolute top-2 left-6 w-1 h-1 bg-white/70 rounded"></div>
                </motion.div>
              </div>
              
              <div className="flex justify-around">
                {[
                  { icon: '📧', text: 'Email Sent', color: 'bg-blue-400/30' },
                  { icon: '🔢', text: 'Enter OTP', color: 'bg-yellow-400/30' },
                  { icon: '🔄', text: 'Reset', color: 'bg-green-400/30' }
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + idx * 0.2 }}
                    className="flex flex-col items-center"
                  >
                    <div className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center mb-2 text-xl`}>
                      {item.icon}
                    </div>
                    <span className="text-xs text-white/90">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'verify':
        return (
          <div className="relative w-full max-w-md">
            <div className="relative">
              <div className="flex justify-center mb-8">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="relative"
                >
                  <div className="w-32 h-32 bg-gradient-to-br from-white/30 to-white/10 rounded-full flex items-center justify-center">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-white rounded-full flex items-center justify-center">
                        <motion.div
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="w-8 h-8 border-b-4 border-r-4 border-white transform rotate-45 -translate-y-1 translate-x-1"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: '📱', text: 'Receive' },
                  { icon: '⌨️', text: 'Enter' },
                  { icon: '✅', text: 'Verified' }
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + idx * 0.2 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-1 text-lg">
                      {item.icon}
                    </div>
                    <span className="text-xs text-white/80">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="relative w-full max-w-md">
            <div className="relative">
              <div className="flex items-end justify-center space-x-4 mb-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${40 + i * 20}px` }}
                    transition={{ delay: i * 0.1 }}
                    className="w-12 bg-white/20 rounded-t-lg relative"
                  >
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-3 bg-primary-400 rounded-full"></div>
                  </motion.div>
                ))}
              </div>
              
              <div className="h-2 bg-white/30 rounded-full mb-4 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="h-1 bg-white/40 w-full"></div>
                </div>
              </div>
              
              <div className="flex justify-around">
                {[
                  { icon: '👤', text: 'Citizens' },
                  { icon: '🏢', text: 'Municipality' },
                  { icon: '🛠️', text: 'Field Staff' },
                  { icon: '💰', text: 'Sponsors' }
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2 text-2xl">
                      {item.icon}
                    </div>
                    <span className="text-xs text-white/80">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  const getSideTitle = () => {
    switch (illustrationType) {
      case 'register':
        return {
          title: 'Join Our Community',
          subtitle: 'Become part of the change in your city'
        };
      case 'login':
        return {
          title: 'Welcome Back',
          subtitle: 'Continue making a difference'
        };
      case 'forgot-password':
        return {
          title: 'Account Recovery',
          subtitle: 'Secure access to your account'
        };
      case 'verify':
        return {
          title: 'Account Verification',
          subtitle: 'Securing your digital identity'
        };
      default:
        return {
          title: 'NagarAlert',
          subtitle: 'Your city, your voice, better together'
        };
    }
  };

  const sideContent = getSideTitle();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-6xl mx-auto"
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
          <div className={`p-8 md:p-12 ${
            showIllustration ? 'w-full lg:w-1/2' : 'w-full'
          } ${imageSide === 'right' ? 'lg:order-1' : 'lg:order-2'}`}>
            
            {backLink && (
              <div className="mb-6">
                <Link
                  to={backLink}
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors group"
                >
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  {backText}
                </Link>
              </div>
            )}
            
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`p-2 ${illustrationType === 'login' ? 'bg-blue-100' : illustrationType === 'register' ? 'bg-green-100' : 'bg-primary-100'} rounded-lg`}>
                  {illustrationType === 'login' ? (
                    <LogIn className="w-6 h-6 text-blue-600" />
                  ) : illustrationType === 'register' ? (
                    <UserPlus className="w-6 h-6 text-green-600" />
                  ) : (
                    <Shield className="w-6 h-6 text-primary-600" />
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {title}
                </h1>
              </div>
              <p className="text-gray-600">{subtitle}</p>
            </div>

            <div className="relative">
              {children}
            </div>
          </div>

          {showIllustration && (
            <div className={`w-full lg:w-1/2 ${imageSide === 'right' ? 'lg:order-2' : 'lg:order-1'}`}>
              <div className={`h-full p-8 md:p-12 relative overflow-hidden ${
                illustrationType === 'login' 
                  ? 'bg-gradient-to-br from-blue-600 to-blue-800' 
                  : illustrationType === 'register' 
                  ? 'bg-gradient-to-br from-green-600 to-green-800'
                  : illustrationType === 'forgot-password'
                  ? 'bg-gradient-to-br from-orange-600 to-orange-800'
                  : illustrationType === 'verify'
                  ? 'bg-gradient-to-br from-purple-600 to-purple-800'
                  : 'bg-gradient-to-br from-primary-600 to-primary-800'
              }`}>
                
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-32 -translate-y-32"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-48 translate-y-48"></div>
                
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      {sideContent.title}
                    </h2>
                    <p className="text-white/90 text-lg">
                      {sideContent.subtitle}
                    </p>
                  </div>

                  <div className="flex-1 flex items-center justify-center mb-8">
                    {getIllustration()}
                  </div>

                  <div className="space-y-4">
                    {features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="flex items-center space-x-3"
                      >
                        <div className="p-2 bg-white/20 rounded-lg">
                          <div className="w-5 h-5 text-white">
                            {feature.icon}
                          </div>
                        </div>
                        <span className="text-white text-sm">{feature.text}</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/20">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <div className="text-2xl font-bold text-white">500+</div>
                        <div className="text-xs text-white/80">Issues Resolved</div>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                      >
                        <div className="text-2xl font-bold text-white">50+</div>
                        <div className="text-xs text-white/80">Municipalities</div>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                      >
                        <div className="text-2xl font-bold text-white">10K+</div>
                        <div className="text-xs text-white/80">Active Users</div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;