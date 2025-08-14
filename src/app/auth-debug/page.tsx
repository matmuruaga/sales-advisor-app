'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export default function AuthDebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [testResults, setTestResults] = useState<string[]>([])
  const { user, session, loading } = useAuth()

  useEffect(() => {
    const collectDebugInfo = async () => {
      const info: any = {
        timestamp: new Date().toISOString(),
        environment: {
          nodeEnv: process.env.NODE_ENV,
          hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        },
        auth: {
          hasSession: !!session,
          hasUser: !!user,
          userId: user?.id,
          userEmail: user?.email,
          userProfile: !!user?.profile,
          userRole: user?.profile?.role,
          loading: loading
        }
      }

      // Test database connection
      try {
        const { data, error } = await supabase.from('users').select('count').limit(1)
        info.database = {
          connected: !error,
          error: error?.message,
          testQuery: !!data
        }
      } catch (err) {
        info.database = {
          connected: false,
          error: (err as Error).message,
          testQuery: false
        }
      }

      setDebugInfo(info)
    }

    collectDebugInfo()
  }, [user, session, loading])

  const runAuthTest = async () => {
    const results: string[] = []
    
    try {
      results.push('🧪 Starting authentication test...')

      // Test 1: Check environment variables
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        results.push('❌ NEXT_PUBLIC_SUPABASE_URL is missing')
      } else {
        results.push('✅ NEXT_PUBLIC_SUPABASE_URL is set')
      }

      if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        results.push('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing')
      } else {
        results.push('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY is set')
      }

      // Test 2: Test database connection
      results.push('🔍 Testing database connection...')
      const { data, error } = await supabase.from('users').select('id').limit(1)
      if (error) {
        results.push(`❌ Database connection failed: ${error.message}`)
      } else {
        results.push('✅ Database connection successful')
      }

      // Test 3: Test auth status
      results.push('🔐 Testing auth status...')
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        results.push(`❌ Session error: ${sessionError.message}`)
      } else if (session) {
        results.push(`✅ Active session found for: ${session.user.email}`)
      } else {
        results.push('ℹ️ No active session')
      }

      // Test 4: Test user profile loading
      if (session?.user) {
        results.push('👤 Testing user profile loading...')
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (profileError) {
          results.push(`❌ Profile loading failed: ${profileError.message}`)
        } else {
          results.push(`✅ Profile loaded: ${profile.email} (${profile.role})`)
        }
      }

      results.push('✨ Test completed!')
    } catch (err) {
      results.push(`💥 Test failed with error: ${(err as Error).message}`)
    }

    setTestResults(results)
  }

  const testLogin = async () => {
    const results: string[] = []
    
    try {
      results.push('🧪 Testing login with test credentials...')
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'matias@elevaitelabs.io',
        password: 'Matias123'
      })
      
      if (error) {
        results.push(`❌ Login failed: ${error.message}`)
      } else {
        results.push(`✅ Login successful for: ${data.user.email}`)
      }
    } catch (err) {
      results.push(`💥 Login test failed: ${(err as Error).message}`)
    }
    
    setTestResults(prev => [...prev, ...results])
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🔧 Supabase Authentication Debug
          </h1>

          <div className="space-y-6">
            {/* Environment Info */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Environment Information</h2>
              <div className="bg-gray-100 rounded-lg p-4">
                <pre className="text-sm overflow-x-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            </div>

            {/* Test Controls */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Tests</h2>
              <div className="flex space-x-4">
                <button
                  onClick={runAuthTest}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Run Auth Test
                </button>
                <button
                  onClick={testLogin}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Test Login
                </button>
                <button
                  onClick={() => setTestResults([])}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Clear Results
                </button>
              </div>
            </div>

            {/* Test Results */}
            {testResults.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">Test Results</h2>
                <div className="bg-black text-green-400 rounded-lg p-4 font-mono text-sm">
                  {testResults.map((result, index) => (
                    <div key={index}>{result}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
              <div className="space-y-2">
                <div>
                  <strong>Production Checklist:</strong>
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Environment variables are set in Vercel</li>
                  <li>Supabase project URL matches production domain</li>
                  <li>CORS settings allow your domain in Supabase</li>
                  <li>Auth redirect URLs are configured for production</li>
                  <li>RLS policies are enabled and configured</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}