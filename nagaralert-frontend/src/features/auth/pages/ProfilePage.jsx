import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { User, Mail, Phone, MapPin, Home, Edit, Save, Camera } from 'lucide-react'
import toast from 'react-hot-toast'
import { selectCurrentUser } from '../../../store/slices/authSlice'
import { useUpdateProfileMutation } from '../../../store/api/authApi'
import Button from '../../../components/atoms/Button/Button'
import Input from '../../../components/atoms/Input/Input'
import Card from '../../../components/atoms/Card/Card'

const ProfilePage = () => {
  const user = useSelector(selectCurrentUser)
  const [updateProfile, { isLoading }] = useUpdateProfileMutation()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    ward: user?.ward || '',
  })
  const [profileImage, setProfileImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(user?.profileImage || '')

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfileImage(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleSave = async () => {
    try {
      const formDataToSend = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value)
      })
      
      if (profileImage) {
        formDataToSend.append('profileImage', profileImage)
      }
      
      await updateProfile(formDataToSend).unwrap()
      toast.success('Profile updated successfully')
      setIsEditing(false)
    } catch (error) {
      toast.error(error.data?.message || 'Update failed')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          {!isEditing ? (
            <Button
              variant="primary"
              onClick={() => setIsEditing(true)}
              leftIcon={<Edit className="w-4 h-4" />}
            >
              Edit Profile
            </Button>
          ) : (
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                loading={isLoading}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Changes
              </Button>
            </div>
          )}
        </div>
        
        <Card className="p-6">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Column - Profile Image */}
            <div className="space-y-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <User className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors">
                      <Camera className="w-5 h-5 text-white" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
                
                <h2 className="mt-4 text-xl font-semibold text-gray-900">
                  {user?.name || 'User Name'}
                </h2>
                <p className="text-gray-600 capitalize">{user?.role}</p>
              </div>
              
              {/* Stats */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Reports Submitted</span>
                  <span className="font-semibold">24</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Points Earned</span>
                  <span className="font-semibold text-green-600">1,250</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-semibold">2024</span>
                </div>
              </div>
            </div>
            
            {/* Right Column - Profile Details */}
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  icon={<User className="w-5 h-5" />}
                  disabled={!isEditing}
                />
                
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  icon={<Mail className="w-5 h-5" />}
                  disabled={!isEditing}
                />
                
                <Input
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  icon={<Phone className="w-5 h-5" />}
                  disabled={!isEditing}
                />
                
                <Input
                  label="Ward Number"
                  name="ward"
                  value={formData.ward}
                  onChange={(e) => setFormData({...formData, ward: e.target.value})}
                  icon={<Home className="w-5 h-5" />}
                  disabled={!isEditing}
                />
                
                <div className="md:col-span-2">
                  <Input
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    icon={<MapPin className="w-5 h-5" />}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

export default ProfilePage