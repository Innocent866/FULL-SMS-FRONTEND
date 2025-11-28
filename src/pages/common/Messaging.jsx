import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import apiClient from '../../services/apiClient.js';

const MessagingPage = () => {
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      const res = await apiClient.get('/messages');
      setThreads(res.data.data || []);
      setActiveThread(res.data.data?.[0] || null);
    };
    load();
  }, []);

  const sendMessage = async () => {
    if (!message.trim()) return;
    await apiClient.post('/messages', { threadId: activeThread?.threadId, body: message });
    setMessage('');
  };

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      <Card className="lg:col-span-1">
        <h2 className="mb-4 text-lg font-semibold">Threads</h2>
        <div className="space-y-2">
          {threads.map((thread) => (
            <button
              key={thread._id}
              onClick={() => setActiveThread(thread)}
              className={`w-full rounded-xl px-4 py-3 text-left ${activeThread?._id === thread._id ? 'bg-softGrey' : 'bg-milk'}`}
            >
              <p className="font-semibold">{thread.subject}</p>
              <p className="text-xs text-gray-500">{thread.participants?.join(', ')}</p>
            </button>
          ))}
        </div>
      </Card>
      <Card className="lg:col-span-3">
        {activeThread ? (
          <div className="flex h-full flex-col">
            <div className="mb-4 border-b border-softGrey pb-2">
              <h2 className="text-xl font-semibold">{activeThread.subject}</h2>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto">
              {activeThread.messages?.map((msg) => (
                <div key={msg._id} className="rounded-2xl bg-milk px-4 py-2">
                  <p className="text-sm font-semibold">{msg.senderName}</p>
                  <p className="text-sm">{msg.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <textarea
                className="flex-1 rounded-2xl border border-softGrey px-4 py-2"
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <Button onClick={sendMessage}>Send</Button>
            </div>
          </div>
        ) : (
          <p>Select a thread to begin.</p>
        )}
      </Card>
    </div>
  );
};

export default MessagingPage;
