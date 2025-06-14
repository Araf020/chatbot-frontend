import React from 'react';
import ReactMarkdown from 'react-markdown';
import './ChatMessage.css';

const ChatMessage = ({ message }) => {
  const { role, content } = message;
  const isUser = role === 'user';

  return (
    <div className={`chat-message ${isUser ? 'user' : 'assistant'}`}>
      <div className="message-content">
        {isUser ? (
          // User messages as plain text
          <div className="user-text">{content}</div>
        ) : (
          // Assistant messages with markdown rendering
          <ReactMarkdown
            components={{
              // Custom styling for different elements
              h1: ({children}) => <h1 className="markdown-h1">{children}</h1>,
              h2: ({children}) => <h2 className="markdown-h2">{children}</h2>,
              h3: ({children}) => <h3 className="markdown-h3">{children}</h3>,
              p: ({children}) => <p className="markdown-p">{children}</p>,
              code: ({children, className}) => {
                // Inline code
                if (!className) {
                  return <code className="inline-code">{children}</code>;
                }
                // Block code
                return <pre className="code-block"><code>{children}</code></pre>;
              },
              ul: ({children}) => <ul className="markdown-ul">{children}</ul>,
              ol: ({children}) => <ol className="markdown-ol">{children}</ol>,
              li: ({children}) => <li className="markdown-li">{children}</li>,
              blockquote: ({children}) => <blockquote className="markdown-blockquote">{children}</blockquote>,
              strong: ({children}) => <strong className="markdown-strong">{children}</strong>,
              em: ({children}) => <em className="markdown-em">{children}</em>
            }}
          >
            {content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;