import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function Timestamp() {
  const router = useRouter()
  const [timestamp, setTimestamp] = useState('')
  const [dateTime, setDateTime] = useState('')
  const [isoDateTime, setIsoDateTime] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    // 默认显示当前时间
    const now = new Date()
    setTimestamp(Math.floor(now.getTime() / 1000).toString())
    setDateTime(now.toLocaleString('zh-CN', { 
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }))
    setIsoDateTime(now.toISOString())
  }, [])

  const handleTimestampToDate = () => {
    try {
      setError('')
      if (!timestamp.trim()) {
        setDateTime('')
        setIsoDateTime('')
        return
      }
      
      const ts = parseInt(timestamp)
      if (isNaN(ts)) {
        throw new Error('时间戳格式错误')
      }
      
      // 判断是秒还是毫秒
      const date = ts < 10000000000 ? new Date(ts * 1000) : new Date(ts)
      
      setDateTime(date.toLocaleString('zh-CN', { 
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }))
      setIsoDateTime(date.toISOString())
    } catch (err: any) {
      setError(err.message)
      setDateTime('')
      setIsoDateTime('')
    }
  }

  const handleDateToTimestamp = () => {
    try {
      setError('')
      if (!dateTime.trim()) {
        setTimestamp('')
        return
      }
      
      const date = new Date(dateTime)
      if (isNaN(date.getTime())) {
        throw new Error('日期格式错误')
      }
      
      setTimestamp(Math.floor(date.getTime() / 1000).toString())
      setIsoDateTime(date.toISOString())
    } catch (err: any) {
      setError(err.message)
      setTimestamp('')
    }
  }

  const handleIsoToTimestamp = () => {
    try {
      setError('')
      if (!isoDateTime.trim()) {
        setTimestamp('')
        setDateTime('')
        return
      }
      
      const date = new Date(isoDateTime)
      if (isNaN(date.getTime())) {
        throw new Error('ISO格式错误')
      }
      
      setTimestamp(Math.floor(date.getTime() / 1000).toString())
      setDateTime(date.toLocaleString('zh-CN', { 
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }))
    } catch (err: any) {
      setError(err.message)
      setTimestamp('')
      setDateTime('')
    }
  }

  const handleCurrentTime = () => {
    const now = new Date()
    setTimestamp(Math.floor(now.getTime() / 1000).toString())
    setDateTime(now.toLocaleString('zh-CN', { 
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }))
    setIsoDateTime(now.toISOString())
    setError('')
  }

  return (
    <>
      <Head>
        <title>时间戳转换 - 在线工具</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 hover:text-blue-800 mb-4"
            >
              ← 返回首页
            </button>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              时间戳转换工具
            </h1>
            <p className="text-gray-600">
              支持时间戳（秒/毫秒）、本地时间和ISO时间格式之间的转换
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  时间戳（秒）
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={timestamp}
                    onChange={(e) => setTimestamp(e.target.value)}
                    placeholder="输入时间戳"
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleTimestampToDate}
                    className="px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    转换
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  本地时间
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    placeholder="输入日期时间"
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleDateToTimestamp}
                    className="px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    转换
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ISO时间格式
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={isoDateTime}
                    onChange={(e) => setIsoDateTime(e.target.value)}
                    placeholder="输入ISO格式时间"
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleIsoToTimestamp}
                    className="px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    转换
                  </button>
                </div>
              </div>

              <button
                onClick={handleCurrentTime}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                获取当前时间
              </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">转换结果</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    时间戳（秒）
                  </label>
                  <div className="p-3 bg-gray-50 rounded border font-mono">
                    {timestamp || '-'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    本地时间
                  </label>
                  <div className="p-3 bg-gray-50 rounded border font-mono">
                    {dateTime || '-'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ISO时间
                  </label>
                  <div className="p-3 bg-gray-50 rounded border font-mono text-sm">
                    {isoDateTime || '-'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

