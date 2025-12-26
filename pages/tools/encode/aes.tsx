import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import CryptoJS from 'crypto-js'

export default function AES() {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [key, setKey] = useState('')
  const [iv, setIv] = useState('')
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt')
  const [cipherMode, setCipherMode] = useState<string>('CBC')
  const [padding, setPadding] = useState<string>('Pkcs7')
  const [keySize, setKeySize] = useState<number>(256)
  const [outputFormat, setOutputFormat] = useState<'base64' | 'hex'>('base64')
  const [inputEncoding, setInputEncoding] = useState<'utf8' | 'base64' | 'hex'>('utf8')
  const [error, setError] = useState('')

  const getCipherMode = () => {
    const modes: any = {
      'CBC': CryptoJS.mode.CBC,
      'ECB': CryptoJS.mode.ECB,
      'CFB': CryptoJS.mode.CFB,
      'OFB': CryptoJS.mode.OFB,
      'CTR': CryptoJS.mode.CTR,
    }
    return modes[cipherMode] || CryptoJS.mode.CBC
  }

  const getPadding = () => {
    const paddings: any = {
      'Pkcs7': CryptoJS.pad.Pkcs7,
      'ZeroPadding': CryptoJS.pad.ZeroPadding,
      'NoPadding': CryptoJS.pad.NoPadding,
      'Iso97971': CryptoJS.pad.Iso97971,
      'Iso10126': CryptoJS.pad.Iso10126,
    }
    return paddings[padding] || CryptoJS.pad.Pkcs7
  }

  const handleEncrypt = () => {
    try {
      setError('')
      if (!input.trim() || !key.trim()) {
        setError('请输入要加密的内容和密钥')
        return
      }

      // 处理输入编码
      let inputData: CryptoJS.lib.WordArray
      if (inputEncoding === 'utf8') {
        inputData = CryptoJS.enc.Utf8.parse(input)
      } else if (inputEncoding === 'base64') {
        inputData = CryptoJS.enc.Base64.parse(input)
      } else {
        inputData = CryptoJS.enc.Hex.parse(input)
      }

      // 处理密钥
      const keyData = CryptoJS.enc.Utf8.parse(key)
      
      // 处理IV
      let ivData: CryptoJS.lib.WordArray | undefined
      if (cipherMode !== 'ECB' && iv.trim()) {
        ivData = CryptoJS.enc.Utf8.parse(iv)
      }

      // 加密配置
      const config: any = {
        mode: getCipherMode(),
        padding: getPadding(),
      }
      if (ivData) {
        config.iv = ivData
      }

      // 执行加密
      const encrypted = CryptoJS.AES.encrypt(inputData, keyData, config)

      // 输出格式
      if (outputFormat === 'base64') {
        setOutput(encrypted.toString())
      } else {
        setOutput(encrypted.ciphertext.toString(CryptoJS.enc.Hex))
      }
    } catch (err: any) {
      setError(`加密错误: ${err.message}`)
      setOutput('')
    }
  }

  const handleDecrypt = () => {
    try {
      setError('')
      if (!input.trim() || !key.trim()) {
        setError('请输入要解密的内容和密钥')
        return
      }

      // 处理输入编码
      let encryptedData: CryptoJS.lib.CipherParams
      if (inputEncoding === 'base64') {
        encryptedData = CryptoJS.lib.CipherParams.create({
          ciphertext: CryptoJS.enc.Base64.parse(input)
        })
      } else if (inputEncoding === 'hex') {
        encryptedData = CryptoJS.lib.CipherParams.create({
          ciphertext: CryptoJS.enc.Hex.parse(input)
        })
      } else {
        // 尝试base64
        encryptedData = CryptoJS.lib.CipherParams.create({
          ciphertext: CryptoJS.enc.Base64.parse(input)
        })
      }

      // 处理密钥
      const keyData = CryptoJS.enc.Utf8.parse(key)
      
      // 处理IV
      let ivData: CryptoJS.lib.WordArray | undefined
      if (cipherMode !== 'ECB' && iv.trim()) {
        ivData = CryptoJS.enc.Utf8.parse(iv)
      }

      // 解密配置
      const config: any = {
        mode: getCipherMode(),
        padding: getPadding(),
      }
      if (ivData) {
        config.iv = ivData
      }

      // 执行解密
      const decrypted = CryptoJS.AES.decrypt(encryptedData, keyData, config)
      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8)
      
      if (!decryptedText) {
        throw new Error('解密失败，请检查密钥、IV和输入格式是否正确')
      }

      setOutput(decryptedText)
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

  const generateRandomKey = () => {
    const randomKey = CryptoJS.lib.WordArray.random(32).toString()
    setKey(randomKey)
  }

  const generateRandomIV = () => {
    const randomIV = CryptoJS.lib.WordArray.random(16).toString()
    setIv(randomIV)
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
              支持多种运算模式、填充模式和编码格式
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密钥
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="输入加密密钥"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={generateRandomKey}
                  className="px-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                >
                  随机
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                偏移量（IV）
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={iv}
                  onChange={(e) => setIv(e.target.value)}
                  placeholder="输入IV（ECB模式不需要）"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={cipherMode === 'ECB'}
                />
                <button
                  onClick={generateRandomIV}
                  className="px-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                  disabled={cipherMode === 'ECB'}
                >
                  随机
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                运算模式
              </label>
              <select
                value={cipherMode}
                onChange={(e) => setCipherMode(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="CBC">CBC</option>
                <option value="ECB">ECB</option>
                <option value="CFB">CFB</option>
                <option value="OFB">OFB</option>
                <option value="CTR">CTR</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                填充模式
              </label>
              <select
                value={padding}
                onChange={(e) => setPadding(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Pkcs7">Pkcs7</option>
                <option value="ZeroPadding">ZeroPadding</option>
                <option value="NoPadding">NoPadding</option>
                <option value="Iso97971">Iso97971</option>
                <option value="Iso10126">Iso10126</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密钥长度
              </label>
              <select
                value={keySize}
                onChange={(e) => setKeySize(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={128}>128位</option>
                <option value={192}>192位</option>
                <option value={256}>256位</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                输入编码
              </label>
              <select
                value={inputEncoding}
                onChange={(e) => setInputEncoding(e.target.value as 'utf8' | 'base64' | 'hex')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="utf8">UTF-8</option>
                <option value="base64">Base64</option>
                <option value="hex">Hex</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                输出格式
              </label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as 'base64' | 'hex')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="base64">Base64</option>
                <option value="hex">Hex</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {mode === 'encrypt' ? '输入要加密的内容' : '输入要解密的内容'}
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'encrypt' ? '输入要加密的文本' : '输入要解密的字符串'}
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
