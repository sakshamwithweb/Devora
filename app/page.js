'use client';

import DirectoryTree from '@/components/DirectoryTree';
import { useEffect, useState } from 'react';

export default function Home() {
  const [repo, setRepo] = useState('');
  const [message, setMessage] = useState('');
  const [ready, setReady] = useState(false)
  const [clonePath, setClonePath] = useState('')
  const [structure, setStructure] = useState([])
  const [userSelectTime, setUserSelectTime] = useState(false)
  const [ignoreThings, setIgnoreThings] = useState([])

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
      if (!res.success) {
        alert("Something went wrong")
        return;
      }
      setClonePath(res.clonePath)
      setStructure(res.structure)
    }
  }

  useEffect(() => {
    if (clonePath.trim().length !== 0 && structure.length !== 0) {
      setUserSelectTime(true)
    }
  }, [clonePath, structure])

  useEffect(() => {
    if (message.length !== 0) {
      console.log(message)
      console.log(message.trim().split(/\s+/).length)
      setReady(true)
    }
  }, [message])

  const handleFinalClick = async()=>{
    if(clonePath.length!==0 && ignoreThings.length!==0){
      const requestHandleFinalClick=await fetch("/api/getCode",{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({clonePath,ignoreThings}) 
      })
      const responseHandleFinalClick=await requestHandleFinalClick.json()
      if(!responseHandleFinalClick.success){
        alert("Something went wrong")
        return;
      }
      setMessage(responseHandleFinalClick.message)
    }
  }


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      {!ready ? (
        <div>
          {userSelectTime ? (
           <div className="max-w-4xl w-full bg-white p-6 rounded-lg shadow-lg">
           <h1 className="text-2xl font-semibold text-center text-gray-700 mb-4">
             Select Files and Folders to Ignore
           </h1>
           <DirectoryTree
             structure={structure}
             ignoreThings={ignoreThings}
             setIgnoreThings={setIgnoreThings}
           />
           <button onClick={handleFinalClick} className='p-2 bg-blue-700 rounded-md my-2'>Submit</button>
         </div>
          ) : (
            <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg">
              <h1 className="text-2xl font-semibold text-center text-gray-700 mb-4">
                Repo URL
              </h1>

              <input
                type="text"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                placeholder="Enter Repo URL"
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
              />

              <button
                onClick={handleSubmit}
                className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Submit
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-screen bg-gray-100 flex flex-col">
          <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-lg h-full flex flex-col mx-auto">
            <div className="flex-1 overflow-y-auto mb-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Chat with Devora AI</h2>
            </div>
            <div className="flex-none">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="bg-gray-200 text-gray-800 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type your message..."
                />
                <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );



}