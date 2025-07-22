'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getServiceCategories, getServices } from '@/lib/services'
import { createServiceRequest } from '@/lib/service-requests'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface ServiceCategory {
  id: string
  name: string
  code: string
  description: string | null
}

interface Service {
  id: string
  category_id: string | null
  name: string
  description: string | null
  payment_method: 'prepaid' | 'postpaid' | 'free'
}

interface ServiceRequest {
  id: string
  service_name: string
  category_name: string
  status: string
  level: number
  max_approval_level: number
  created_at: string
  updated_at: string
}

export default function RequestServicePage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  
  // Form state
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [selectedServiceId, setSelectedServiceId] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)
  
  // Data state
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  
  // UI state
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState<'request' | 'my-requests'>('request')
  const [myRequests, setMyRequests] = useState<ServiceRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<ServiceRequest[]>([])
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'approved' | 'completed'>('all')
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  
  // Fetch categories and services on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        
        // Fetch categories and services in parallel
        const [categoriesData, servicesData] = await Promise.all([
          getServiceCategories(),
          getServices()
        ])
        
        setCategories(categoriesData)
        setServices(servicesData)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load services. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  // Filter services when category changes
  useEffect(() => {
    if (selectedCategoryId) {
      const filtered = services.filter(service => service.category_id === selectedCategoryId)
      setFilteredServices(filtered)
    } else {
      setFilteredServices([])
    }
    
    // Reset service selection when category changes
    setSelectedServiceId('')
    setSelectedService(null)
  }, [selectedCategoryId, services])
  
  // Update selected service when service ID changes
  useEffect(() => {
    if (selectedServiceId) {
      const service = services.find(service => service.id === selectedServiceId)
      setSelectedService(service || null)
    } else {
      setSelectedService(null)
    }
  }, [selectedServiceId, services])
  
  // Fetch user's requests when "My Requests" tab is active
  useEffect(() => {
    if (activeTab === 'my-requests' && user) {
      fetchMyRequests()
    }
  }, [activeTab, user])
  
  // Filter requests based on selected filter
  useEffect(() => {
    if (selectedFilter === 'all') {
      setFilteredRequests(myRequests)
    } else {
      const filtered = myRequests.filter(request => {
        if (selectedFilter === 'pending') {
          return request.status === 'pending'
        } else if (selectedFilter === 'approved') {
          return request.status === 'approved'
        } else if (selectedFilter === 'completed') {
          return request.status === 'completed'
        }
        return true
      })
      setFilteredRequests(filtered)
    }
  }, [selectedFilter, myRequests])
  
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategoryId(e.target.value)
  }
  
  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedServiceId(e.target.value)
  }
  
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value)
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedServiceId) {
      setError('Please select a service')
      return
    }
    
    if (!user) {
      setError('You must be logged in to submit a request')
      return
    }
    
      setIsSubmitting(true)
      setError(null)
      
    try {
      const result = await createServiceRequest({
        serviceId: selectedServiceId,
        userId: user.id,
        notes: notes.trim() || null,
        file: file || null
      })
      
      if (result.success) {
      setSuccess(true)
        // Reset form
      setSelectedCategoryId('')
      setSelectedServiceId('')
      setNotes('')
      setFile(null)
        // Reset file input
        const fileInput = document.getElementById('file') as HTMLInputElement
        if (fileInput) {
          fileInput.value = ''
        }
      
        // Hide success message after 5 seconds
      setTimeout(() => {
          setSuccess(false)
        }, 5000)
      } else {
        setError(result.error || 'Failed to submit request')
      }
    } catch (err) {
      console.error('Error submitting request:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const fetchMyRequests = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select(`
          id,
          notes,
          level,
          max_approval_level,
          status,
          created_at,
          updated_at,
          services!inner (
            name,
            service_categories!inner (
              name
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching requests:', error)
        return
      }

      const formattedRequests: ServiceRequest[] = data.map((request: any) => ({
        id: request.id,
        service_name: request.services.name,
        category_name: request.services.service_categories.name,
        status: request.status,
        level: request.level,
        max_approval_level: request.max_approval_level,
        created_at: request.created_at,
        updated_at: request.updated_at
      }))

      setMyRequests(formattedRequests)
    } catch (err) {
      console.error('Error fetching requests:', err)
    }
  }
  
  const handleView = (request: ServiceRequest) => {
    setSelectedRequest(request)
    setIsViewModalOpen(true)
  }

  const handleDownload = async (request: ServiceRequest) => {
    setIsDownloading(true)
    try {
      // TODO: Implement download functionality
      console.log('Downloading request:', request.id)
      // Simulate download delay
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (err) {
      console.error('Error downloading:', err)
    } finally {
      setIsDownloading(false)
    }
  }

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])
  
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  if (!user) {
    return null
  }
  
  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Student Portal</h1>
      
        {/* Mobile-Optimized Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm p-2">
          <div className="flex space-x-2">
          <button
              className={`flex-1 py-3 px-4 text-sm sm:text-base font-medium rounded-md transition-colors ${
              activeTab === 'request'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('request')}
          >
              Request Service
          </button>
          <button
              className={`flex-1 py-3 px-4 text-sm sm:text-base font-medium rounded-md transition-colors ${
              activeTab === 'my-requests'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('my-requests')}
          >
            My Requests
          </button>
          </div>
        </div>
      </div>
      
      {activeTab === 'request' ? (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Request a Service</h2>
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                Your service request has been submitted successfully!
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Service Category */}
              <div className="space-y-2">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Service Category *
                </label>
                <select
                  id="category"
                  value={selectedCategoryId}
                  onChange={handleCategoryChange}
                  className="w-full rounded-md border border-gray-300 py-3 px-4 shadow-sm focus:border-primary focus:outline-none focus:ring-primary text-base"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Service Type */}
              <div className="space-y-2">
                <label htmlFor="service" className="block text-sm font-medium text-gray-700">
                  Service Type *
                </label>
                <select
                  id="service"
                  value={selectedServiceId}
                  onChange={handleServiceChange}
                  className="w-full rounded-md border border-gray-300 py-3 px-4 shadow-sm focus:border-primary focus:outline-none focus:ring-primary text-base"
                  required
                  disabled={!selectedCategoryId}
                >
                  <option value="">Select a service</option>
                  {filteredServices.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Service Description */}
              {selectedService && (
                <div className="rounded-md bg-gray-50 p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Service Description</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {selectedService.description || 'No description available.'}
                  </p>
                  
                  {/* Payment Information */}
                  {selectedService.payment_method !== 'free' && (
                    <div className="inline-flex items-center rounded-md bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                        {selectedService.payment_method === 'prepaid' 
                          ? 'Requires payment before processing' 
                          : 'Requires payment after approval'}
                    </div>
                  )}
                </div>
              )}
              
              {/* Purpose / Notes */}
              <div className="space-y-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Purpose / Notes
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={handleNotesChange}
                  rows={4}
                  className="w-full rounded-md border border-gray-300 py-3 px-4 shadow-sm focus:border-primary focus:outline-none focus:ring-primary text-base"
                  placeholder="Please describe the purpose of your request..."
                />
              </div>
              
              {/* File Upload */}
              <div className="space-y-2">
                <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                  Supporting Documents (Optional)
                </label>
                <input
                  type="file"
                  id="file"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary/90 file:cursor-pointer"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <p className="text-xs text-gray-500">
                  Accepted formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                </p>
              </div>
              
              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedServiceId}
                  className="w-full sm:w-auto min-w-[200px] bg-primary text-white py-3 px-6 rounded-md font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            {/* Header with filters */}
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">My Service Requests</h2>
                
                {/* Mobile-friendly filter */}
                <div className="w-full sm:w-auto">
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value as 'all' | 'pending' | 'approved' | 'completed')}
                    className="w-full sm:w-auto rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-primary focus:outline-none focus:ring-primary"
                  >
                    <option value="all">All Requests</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Mobile-optimized table */}
            <div className="overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                        No requests found
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((request) => (
                      <tr key={request.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{request.service_name}</div>
                          <div className="text-sm text-gray-500">{request.category_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(request.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {request.status === 'pending' ? (
                            <span className="inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                              Pending Approval (Level {request.level}/{request.max_approval_level})
                            </span>
                          ) : request.status === 'completed' ? (
                            <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                              Completed
                            </span>
                          ) : request.status === 'rejected' ? (
                            <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
                              Rejected
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={() => handleView(request)}
                            className="text-primary hover:text-primary/80 mr-3"
                          >
                            View
                          </button>
                          {request.status === 'completed' && (
                            <button
                              onClick={() => handleDownload(request)}
                              disabled={isDownloading}
                              className="text-green-600 hover:text-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isDownloading ? 'Downloading...' : 'Download'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
              {/* Mobile Card View */}
              <div className="sm:hidden">
                {filteredRequests.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                    No requests found
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredRequests.map((request) => (
                      <div key={request.id} className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {request.service_name}
                            </h3>
                            <p className="text-sm text-gray-500 truncate">
                              {request.category_name}
                            </p>
                          </div>
                          <div className="ml-3 flex-shrink-0">
                            {request.status === 'pending' ? (
                              <span className="inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                                Pending ({request.level}/{request.max_approval_level})
                              </span>
                            ) : request.status === 'completed' ? (
                              <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                                Completed
                              </span>
                            ) : request.status === 'rejected' ? (
                              <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
                                Rejected
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {new Date(request.created_at).toLocaleDateString()}
                          </span>
                          <div className="flex space-x-3">
                            <button 
                              onClick={() => handleView(request)}
                              className="text-sm font-medium text-primary hover:text-primary/80"
                            >
                              View
                            </button>
                            {request.status === 'completed' && (
                <button
                                onClick={() => handleDownload(request)}
                                disabled={isDownloading}
                                className="text-sm font-medium text-green-600 hover:text-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isDownloading ? 'Downloading...' : 'Download'}
                </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-optimized Modal */}
      {isViewModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Request Details</h3>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 -m-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Service</label>
                  <p className="mt-1 text-sm">{selectedRequest.service_name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <p className="mt-1 text-sm">{selectedRequest.category_name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    {selectedRequest.status === 'pending' ? (
                      <span className="inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                        Pending Approval (Level {selectedRequest.level}/{selectedRequest.max_approval_level})
                      </span>
                    ) : selectedRequest.status === 'completed' ? (
                      <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                        Completed
                      </span>
                    ) : selectedRequest.status === 'rejected' ? (
                      <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
                        Rejected
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                        {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Submitted</label>
                  <p className="mt-1 text-sm">{new Date(selectedRequest.created_at).toLocaleString()}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="mt-1 text-sm">{new Date(selectedRequest.updated_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
