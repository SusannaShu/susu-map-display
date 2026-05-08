import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import './MessagesPage.css';

/** Mock messages for display */
const MOCK_CONVERSATIONS = [
  {
    id: '1',
    username: 'Maria Chen',
    lastMessage: 'Is the ramen still available?',
    lastMessageDate: new Date(Date.now() - 15 * 60000).toISOString(),
    unread: true,
    color: '#7c3aed',
    messages: [
      { id: 1, text: 'Hey! I saw your free ramen post', isSender: false, time: '2:30 PM' },
      { id: 2, text: 'Is it still available?', isSender: false, time: '2:30 PM' },
      { id: 3, text: 'Yes! Come to Bobst lobby, ground floor', isSender: true, time: '2:32 PM' },
      { id: 4, text: 'Is the ramen still available?', isSender: false, time: '2:45 PM' },
    ],
  },
  {
    id: '2',
    username: 'Jake Wilson',
    lastMessage: 'See you at the study session!',
    lastMessageDate: new Date(Date.now() - 3 * 3600000).toISOString(),
    unread: false,
    color: '#0d9488',
    messages: [
      { id: 1, text: 'Want to join our study group at Bobst?', isSender: false, time: '11:00 AM' },
      { id: 2, text: 'Sure! What floor?', isSender: true, time: '11:05 AM' },
      { id: 3, text: '3rd floor, near the windows', isSender: false, time: '11:06 AM' },
      { id: 4, text: 'See you at the study session!', isSender: false, time: '11:10 AM' },
    ],
  },
  {
    id: '3',
    username: 'Priya Sharma',
    lastMessage: 'Thanks for the textbook!',
    lastMessageDate: new Date(Date.now() - 24 * 3600000).toISOString(),
    unread: false,
    color: '#e11d48',
    messages: [
      { id: 1, text: 'Hi, is the Calculus textbook still available?', isSender: false, time: 'Yesterday' },
      { id: 2, text: 'Yes! I left it by the front desk at Tisch', isSender: true, time: 'Yesterday' },
      { id: 3, text: 'Thanks for the textbook!', isSender: false, time: 'Yesterday' },
    ],
  },
];

function ChatView({ conversation, onBack }: { conversation: typeof MOCK_CONVERSATIONS[0]; onBack: () => void }) {
  const [text, setText] = useState('');
  const [localMessages, setLocalMessages] = useState(conversation.messages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (!text.trim()) return;
    setLocalMessages([...localMessages, {
      id: localMessages.length + 1,
      text: text.trim(),
      isSender: true,
      time: 'Just now',
    }]);
    setText('');
    toast.success('Message sent (display mode)');
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  return (
    <div className="chatView">
      <div className="chatViewHeader">
        <button className="chatViewBackBtn" onClick={onBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <h1 className="chatViewTitle">{conversation.username}</h1>
      </div>

      <div className="chatMessages">
        {localMessages.map((msg) => (
          <div key={msg.id} className={`chatMessageBubble ${msg.isSender ? 'isMe' : 'isThem'}`}>
            <div className="chatMessageText">{msg.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chatInputArea">
        <input
          className="chatInputBox"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
        />
        <button className="chatSendBtn" onClick={handleSend} disabled={!text.trim()}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  );
}

export function MessagesPage() {

  const [activeChat, setActiveChat] = useState<typeof MOCK_CONVERSATIONS[0] | null>(null);

  if (activeChat) {
    return (
      <div className="messagesPage" id="messages-page" style={{ display: 'flex', flexDirection: 'column' }}>
        <ChatView conversation={activeChat} onBack={() => setActiveChat(null)} />
      </div>
    );
  }

  return (
    <div className="messagesPage" id="messages-page">
      <div className="messagesHeader">
        <h1 className="messagesTitle">Messages</h1>
      </div>

      <div className="messagesList">
        {MOCK_CONVERSATIONS.map((conv) => (
          <div
            key={conv.id}
            className="messageItem"
            onClick={() => setActiveChat(conv)}
            style={{ cursor: 'pointer' }}
          >
            <div className="messageAvatar" style={{ backgroundColor: conv.color }}>
              {conv.username.charAt(0).toUpperCase()}
            </div>
            <div className="messageInfo">
              <div className="messageTop">
                <span className="messageName">{conv.username}</span>
                <span className="messageTime">
                  {new Date(conv.lastMessageDate).toLocaleDateString()}
                </span>
              </div>
              <div className={`messagePreview ${conv.unread ? 'unread' : ''}`}>
                {conv.lastMessage}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
