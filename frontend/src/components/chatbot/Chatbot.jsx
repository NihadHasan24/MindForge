import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { server } from '../../main';
import './chatbot.css';

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        `${server}/api/ai/chat`,
        { message: text, history: messages },
        { headers: { token } }
      );
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }]);
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', content: 'Unable to reach AI service.' }]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  // Initialize position and keep within viewport
  useEffect(() => {
    const saved = localStorage.getItem('chatbotPos');
    if (saved) {
      try {
        const pos = JSON.parse(saved);
        setPosition(pos);
      } catch {}
    } else {
      const panelWidth = 340;
      const panelHeight = 420;
      const x = Math.max(12, window.innerWidth - panelWidth - 20);
      const y = Math.max(12, window.innerHeight - panelHeight - 20);
      setPosition({ x, y });
    }

    const onResize = () => {
      setPosition((pos) => {
        const panelWidth = 340;
        const panelHeight = 420;
        const maxX = Math.max(0, window.innerWidth - panelWidth - 12);
        const maxY = Math.max(0, window.innerHeight - panelHeight - 12);
        return {
          x: Math.min(Math.max(12, pos.x), maxX),
          y: Math.min(Math.max(12, pos.y), maxY),
        };
      });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Allow external toggle/open commands from navbar
  useEffect(() => {
    const toggle = () => setOpen((o) => !o);
    const openCmd = () => setOpen(true);
    window.addEventListener('toggle-chatbot', toggle);
    window.addEventListener('open-chatbot', openCmd);
    return () => {
      window.removeEventListener('toggle-chatbot', toggle);
      window.removeEventListener('open-chatbot', openCmd);
    };
  }, []);

  // Drag handlers
  const startDrag = (clientX, clientY) => {
    setIsDragging(true);
    dragOffset.current = { x: clientX - position.x, y: clientY - position.y };
  };
  const onMouseDown = (e) => {
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
  };
  const onTouchStart = (e) => {
    const t = e.touches[0];
    startDrag(t.clientX, t.clientY);
  };
  useEffect(() => {
    const onMove = (clientX, clientY) => {
      if (!isDragging) return;
      const panelWidth = 340;
      const panelHeight = 420;
      const maxX = Math.max(0, window.innerWidth - panelWidth - 12);
      const maxY = Math.max(0, window.innerHeight - panelHeight - 12);
      const newX = Math.min(Math.max(12, clientX - dragOffset.current.x), maxX);
      const newY = Math.min(Math.max(12, clientY - dragOffset.current.y), maxY);
      setPosition({ x: newX, y: newY });
    };
    const handleMouseMove = (e) => onMove(e.clientX, e.clientY);
    const handleTouchMove = (e) => {
      const t = e.touches[0];
      onMove(t.clientX, t.clientY);
    };
    const stop = () => {
      if (isDragging) {
        setIsDragging(false);
        try { localStorage.setItem('chatbotPos', JSON.stringify(position)); } catch {}
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchend', stop);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('touchend', stop);
    };
  }, [isDragging, position]);

  return (
    <div
      className={`chatbot ${open ? 'open' : ''}`}
      style={{ left: position.x, top: position.y }}
    >
      <button
        className={`chatbot-toggle ${isDragging ? 'dragging' : ''}`}
        onClick={() => !isDragging && setOpen(!open)}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        {open ? '💬 Close' : '💬 Ask AI'}
      </button>
      {open && (
        <div className="chatbot-panel">
          <div className="chatbot-messages">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role}`}>{m.content}</div>
            ))}
            {loading && <div className="msg assistant">Thinking…</div>}
          </div>
          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Ask any educational question…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <button className="common-btn" onClick={sendMessage} disabled={loading}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;


