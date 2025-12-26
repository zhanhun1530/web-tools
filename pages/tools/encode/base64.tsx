import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function Base64() {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [imagePreview, setImagePreview] = useState('')

  const handleEncode = () => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(input)))
      setOutput(encoded)
      setImagePreview('')
    } catch (err: any) {
      setOutput(`编码错误: ${err.message}`)
    }
  }

  const handleDecode = () => {
    try {
      const decoded = decodeURIComponent(escape(atob(input)))
      setOutput(decoded)
      
      // 检查是否是图片
      if (input.startsWith('data:image/') || /^[A-Za-z0-9+/=]+$/.test(input)) {
        try {
          // 尝试作为图片显示
          const imgData = input.startsWith('data:') ? input : `data:image/png;base64,${input}`
          setImagePreview(imgData)
        } catch {
          setImagePreview('')
        }
      } else {
        setImagePreview('')
      }
    } catch (err: any) {
      setOutput(`解码错误: ${err.message}`)
      setImagePreview('')
    }
  }

  const handleConvert = () => {
    if (mode === 'encode') {
      handleEncode()
    } else {
      handleDecode()
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    alert('已复制到剪贴板')
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      // result 是 data:image/...;base64,xxx 格式
      if (result.startsWith('data:')) {
        // 提取base64部分
        const base64Part = result.split(',')[1]
        setInput(base64Part)
        setMode('decode')
        // 延迟执行，确保input已更新
        setTimeout(() => {
          const decoded = decodeURIComponent(escape(atob(base64Part)))
          setOutput(decoded)
          setImagePreview(result)
        }, 0)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <>
      <Head>
        <title>Base64加解密 - 在线工具</title>
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
              Base64加解密工具
            </h1>
            <p className="text-gray-600">
              支持文本编码/解码和图片Base64转换
            </p>
          </div>

          <div className="mb-4 flex gap-4">
            <button
              onClick={() => setMode('encode')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                mode === 'encode'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              编码
            </button>
            <button
              onClick={() => setMode('decode')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                mode === 'decode'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              解码
            </button>
            <label className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 cursor-pointer">
              上传图片
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {mode === 'encode' ? '输入文本' : '输入Base64'}
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'encode' ? '输入要编码的文本' : '输入要解码的Base64字符串'}
                className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleConvert}
                className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {mode === 'encode' ? '编码' : '解码'}
              </button>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">
                  {mode === 'encode' ? 'Base64编码结果' : '解码结果'}
                </label>
                <button
                  onClick={handleCopy}
                  disabled={!output}
                  className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                >
                  复制
                </button>
              </div>
              <textarea
                value={output}
                readOnly
                placeholder={mode === 'encode' ? '编码结果将显示在这里' : '解码结果将显示在这里'}
                className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50 focus:outline-none"
              />
              {imagePreview && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    图片预览
                  </label>
                  <img
                    src={imagePreview}
                    alt="Base64图片预览"
                    className="max-w-full h-auto border border-gray-300 rounded"
                    onError={() => setImagePreview('')}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

