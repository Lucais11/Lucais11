import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { UserIcon, CogIcon } from '@heroicons/react/solid';

export default function Chatbot() {
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async () => {
        if (!userInput.trim()) return;

        setMessages(prevMessages => [...prevMessages, { type: 'user', text: userInput }]);
        setUserInput('');

        setIsLoading(true);

        try {
            const response = await axios.post('/api/chatbot', { question: userInput });
            setMessages(prevMessages => [...prevMessages, { type: 'bot', text: response.data }]);
        } catch (error) {
            console.error("Error when sending message:", error.message);
            setMessages(prevMessages => [...prevMessages, { type: 'bot', text: "Sorry, I couldn't process that." }]);
        }

        setIsLoading(false);
    };

    return (
      <div className="h-screen flex justify-center items-center bg-gradient-to-r from-pink-300 via-orange-200 to-purple-300">
          <div className="chatbot-container bg-gray-800 p-8 rounded-lg shadow-2xl max-w-6xl w-full">
              <div className="chatbot-header mb-4 text-2xl font-semibold text-center bg-gradient-to-l from-purple-600 to-orange-500 bg-clip-text text-transparent">Ask ChatGPT</div>
              <div className="chatbot-messages mb-6 overflow-y-auto h-96 border border-gray-700 p-4 rounded" ref={chatContainerRef}>
                  {messages.map((message, index) => (
                      <div key={index} className={`message ${message.type} mb-2 flex items-center rounded px-3 py-2 ${message.type === 'user' ? 'bg-gradient-to-r from-purple-600 to-orange-400 text-white' : 'bg-gradient-to-r from-gray-700 to-purple-700 text-white'}`}>
                          {message.type === 'user' ? 
                              <UserIcon className="h-6 w-6 mr-2 text-white" /> : 
                              <CogIcon className="h-6 w-6 mr-2 text-white" />
                          }
                          {message.text}
                      </div>
                  ))}
                  {isLoading && (
                      <div className="message bot mb-2 text-gray-300 animate-pulse">
                          ChatGPT is typing...
                      </div>
                  )}
              </div>
              <div className="chatbot-input flex items-center">
                  <textarea 
                      value={userInput}
                      onChange={e => setUserInput(e.target.value)}
                      onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              sendMessage();
                          }
                      }}
                      placeholder="Ask a question..."
                      rows="2"
                      className="text-black bg-gray-300 placeholder-gray-700 py-2 px-4 border border-gray-700 rounded w-full mr-2 resize-y flex-1"
                  />
                  <button onClick={sendMessage} className="bg-gradient-to-r from-purple-600 to-orange-500 text-gray-200 py-2 px-6 rounded transition duration-300">Send</button>
              </div>
          </div>
      </div>
  );
  
  
}
