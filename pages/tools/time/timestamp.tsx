import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function Timestamp() {
  const router = useRouter()
  const [timestamp, setTimestamp] = useState('')
  const [dateTime, setDateTime] = useState('')
  const [isoDateTime, setIsoDateTime] = useState('')
  const [error, setError] = useState('')
  const [currentTime, setCurrentTime] = useState({ seconds: 0, milliseconds: 0, date: '', iso: '' })

  useEffect(() => {
    // 更新当前时间
    const updateCurrentTime = () => {
      const now = new Date()
      const seconds = Math.floor(now.getTime() / 1000)
      const milliseconds = now.getTime()
      
      setCurrentTime({
        seconds,
        milliseconds,
        date: now.toLocaleString('zh-CN', { 
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        iso: now.toISOString()
      })
    }

    updateCurrentTime()
    const interval = setInterval(updateCurrentTime, 1000) // 每秒更新

    return () => clearInterval(interval)
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
    setTimestamp(currentTime.seconds.toString())
    setDateTime(currentTime.date)
    setIsoDateTime(currentTime.iso)
    setError('')
  }

  const handleConvertSecondsToMs = () => {
    if (timestamp && /^\d+$/.test(timestamp)) {
      const ts = parseInt(timestamp)
      if (ts < 10000000000) {
        // 是秒，转为毫秒
        setTimestamp((ts * 1000).toString())
      }
    }
  }

  const handleConvertMsToSeconds = () => {
    if (timestamp && /^\d+$/.test(timestamp)) {
      const ts = parseInt(timestamp)
      if (ts >= 10000000000) {
        // 是毫秒，转为秒
        setTimestamp(Math.floor(ts / 1000).toString())
      }
    }
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

          {/* 实时当前时间显示 */}
          <div className="mb-6 p-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-white">
            <h2 className="text-xl font-bold mb-4">当前时间（实时更新）</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <div className="text-sm opacity-90">时间戳（秒）</div>
                <div className="text-2xl font-mono font-bold">{currentTime.seconds}</div>
              </div>
              <div>
                <div className="text-sm opacity-90">时间戳（毫秒）</div>
                <div className="text-2xl font-mono font-bold">{currentTime.milliseconds}</div>
              </div>
              <div>
                <div className="text-sm opacity-90">本地时间</div>
                <div className="text-lg font-mono">{currentTime.date}</div>
              </div>
              <div>
                <div className="text-sm opacity-90">ISO时间</div>
                <div className="text-sm font-mono">{currentTime.iso}</div>
              </div>
            </div>
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
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={handleConvertSecondsToMs}
                    className="text-xs px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    秒→毫秒
                  </button>
                  <button
                    onClick={handleConvertMsToSeconds}
                    className="text-xs px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    毫秒→秒
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
