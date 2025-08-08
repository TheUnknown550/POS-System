import { useState, useEffect } from 'react'
import axios from 'axios'

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

function App() {
  const [count, setCount] = useState(0)
  const [backendStatus, setBackendStatus] = useState<string>('Checking...')
  const [backendData, setBackendData] = useState<any>(null)

  // Test backend connection on component mount
  useEffect(() => {
    testBackendConnection()
  }, [])

  const testBackendConnection = async () => {
    try {
      setBackendStatus('Connecting...')
      const response = await axios.get(`${API_BASE_URL}/`)
      console.log('Backend response:', response.data)
      setBackendData(response.data)
      setBackendStatus('Connected ✅')
    } catch (error) {
      console.error('Backend connection failed:', error)
      setBackendStatus('Failed ❌')
      setBackendData(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            POS System
          </h1>
          <p className="text-gray-600">
            Tailwind CSS Test Interface
          </p>
        </div>

        {/* Test Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Sales</h3>
            <p className="text-2xl font-bold text-blue-600">$1,234</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2">Orders</h3>
            <p className="text-2xl font-bold text-green-600">42</p>
          </div>
        </div>

        {/* Backend Connection Status */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">Backend Connection:</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status:</span>
              <span className="text-sm font-medium">{backendStatus}</span>
            </div>
            {backendData && (
              <div className="text-xs text-gray-500 bg-white p-2 rounded border">
                <pre>{JSON.stringify(backendData, null, 2)}</pre>
              </div>
            )}
            <button 
              onClick={testBackendConnection}
              className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              Test Connection
            </button>
          </div>
        </div>

        {/* Counter Test */}
        <div className="text-center space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 mb-2">Counter Test:</p>
            <p className="text-4xl font-bold text-purple-600">{count}</p>
          </div>
          
          <div className="flex gap-2 justify-center">
            <button 
              onClick={() => setCount(count - 1)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              Decrease
            </button>
            <button 
              onClick={() => setCount(0)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Reset
            </button>
            <button 
              onClick={() => setCount(count + 1)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              Increase
            </button>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-800 mb-3">Tailwind CSS Status:</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Colors ✓</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Layout ✓</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Typography ✓</span>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500">
          If you can see styled colors, rounded corners, and proper spacing, 
          Tailwind CSS is working! 🎉
        </div>
      </div>
    </div>
  )
}

export default App
