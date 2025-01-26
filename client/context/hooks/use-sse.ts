import { useEffect, useRef, useState } from 'react'

const useSSE = (url: string) => {
  const [isConnected, setIsConnected] = useState(false)
  // TODO: Use generic type for messages
  // Array to store messages received from the server
  const [messages, setMessages] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

  const connect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    const eventSource = new EventSource(url)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      setIsConnected(true)
      setError(null)
      reconnectAttemptsRef.current = 0
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        // Append new message to the array of messages
        setMessages((prev) => [...prev, data])
      } catch (err) {
        console.error('Failed to parse message:', err)
      }
    }

    eventSource.onerror = () => {
      setIsConnected(false)
      setError('Connection lost, attempting to reconnect...')
      eventSource.close()
      handleReconnect()
    }
  }

  const handleReconnect = () => {
    if (reconnectAttemptsRef.current < maxReconnectAttempts) {
      const retryTimeout = 1000 * 2 ** reconnectAttemptsRef.current // Exponential backoff
      setTimeout(() => {
        reconnectAttemptsRef.current += 1
        connect()
      }, retryTimeout)
    } else {
      setError('Maximum reconnect attempts reached.')
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: Connect on mount and cleanup on unmount
  useEffect(() => {
    connect()
    return () => {
      // Clean up connection on unmount
      eventSourceRef.current?.close()
    }
  }, [url])

  return { isConnected, messages, error }
}

export default useSSE
