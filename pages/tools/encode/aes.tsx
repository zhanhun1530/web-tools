import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

// 简单的AES加解密实现（使用Web Crypto API）
export default function AES() {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [key, setKey] = useState('')
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt')
  const [error, setError] = useState('')

  // 生成密钥
  const getKey = async (password: string): Promise<CryptoKey> => {
    const encoder = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    )

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('salt'),
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    )
  }

  const handleEncrypt = async () => {
    try {
      setError('')
      if (!input.trim() || !key.trim()) {
        setError('请输入要加密的内容和密钥')
        return
      }

      const cryptoKey = await getKey(key)
      const encoder = new TextEncoder()
      const data = encoder.encode(input)

      const iv = crypto.getRandomValues(new Uint8Array(12))
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        data
      )

      // 将IV和加密数据组合
      const combined = new Uint8Array(iv.length + encrypted.byteLength)
      combined.set(iv)
      combined.set(new Uint8Array(encrypted), iv.length)

      // 转换为Base64（兼容es5，不使用展开运算符）
      const chars: string[] = []
      for (let i = 0; i < combined.length; i++) {
        chars.push(String.fromCharCode(combined[i]))
      }
      const base64 = btoa(chars.join(''))
      setOutput(base64)
    } catch (err: any) {
      setError(`加密错误: ${err.message}`)
      setOutput('')
    }
  }

  const handleDecrypt = async () => {
    try {
      setError('')
      if (!input.trim() || !key.trim()) {
        setError('请输入要解密的内容和密钥')
        return
      }

      const cryptoKey = await getKey(key)
      
      // 从Base64解码
      const combined = Uint8Array.from(atob(input), c => c.charCodeAt(0))
      
      const iv = combined.slice(0, 12)
      const encrypted = combined.slice(12)

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        encrypted
      )

      const decoder = new TextDecoder()
      setOutput(decoder.decode(decrypted))
    } catch (err: any) {
      setError(`解密错误: ${err.message}`)
      setOutput('')
    }
  }

  const handleConvert = () => {
    if (mode === 'encrypt') {
      handleEncrypt()
    } else {
      handleDecrypt()
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    alert('已复制到剪贴板')
  }

  return (
    <>
      <Head>
        <title>AES加解密 - 在线工具</title>
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
              AES加解密工具
            </h1>
            <p className="text-gray-600">
              使用AES-GCM算法进行数据加密和解密
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="mb-4 flex gap-4">
            <button
              onClick={() => setMode('encrypt')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                mode === 'encrypt'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              加密
            </button>
            <button
              onClick={() => setMode('decrypt')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                mode === 'decrypt'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              解密
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              密钥
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="输入加密密钥"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {mode === 'encrypt' ? '输入要加密的内容' : '输入要解密的内容'}
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'encrypt' ? '输入要加密的文本' : '输入要解密的Base64字符串'}
                className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleConvert}
                className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {mode === 'encrypt' ? '加密' : '解密'}
              </button>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">
                  {mode === 'encrypt' ? '加密结果' : '解密结果'}
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
                placeholder={mode === 'encrypt' ? '加密结果将显示在这里' : '解密结果将显示在这里'}
                className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

