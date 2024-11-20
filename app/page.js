'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [repo, setRepo] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (repo.trim().length !== 0) {
      const req = await fetch('/api/clone-repo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repoLink: repo }),
      })
      const res = await req.json()
      setMessage(res.message)
      console.log("success")
    }
  }

  useEffect(() => {
    if (message.length !== 0) {
      console.log(message)
      console.log(message.trim().split(/\s+/).length)
    }
  }, [message])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-semibold text-center text-gray-700 mb-4">Repo URL</h1>

        <input
          type="text"
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
          placeholder="Enter Repo URL"
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        >
          Submit
        </button>
      </div>
    </div>
  );
}