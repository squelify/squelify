import { useState } from 'react'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="container">
      <h1>Nitro Start</h1>
      <div className="card">
        <button type="button" onClick={() => setCount((count) => count + 1)}>
          Count: {count}
        </button>
      </div>
      <p className="read-the-docs">See an example API route below</p>
      <a href="/api">See API Routes</a>
    </div>
  )
}
