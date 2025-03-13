// ChatInput.tsx

import React, { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import styled from 'styled-components';
import { Message } from "../../data/Message";

type ChatInputProps = {
  onNewUserMessage: (chatId: string, message: Message) => void;
  onNewChatCreated: (chatId: string) => void;
  chatId: string | null;
};

export const ChatInput: React.FC<ChatInputProps> = ({onNewUserMessage, onNewChatCreated, chatId}) => {
    const [message, setMessage] = useState('');

    const handleSubmit = (event: React.FormEvent) => {
      event.preventDefault();

      if (message.trim() === '') return;

      if (chatId) {
        // If there is a chatId, just send the message.
        const newMessage = {sender: 'USER', content: message};
        onNewUserMessage(chatId, newMessage)
      } else {
        // If there is no chatId, create a new chat.
        createChat()
      }
      setMessage(''); // Clear the input message
    }

    // const createChat = () => {
    //   const userEmail = localStorage.getItem("userEmail"); // Retrieve email
    //   if (!userEmail) {
    //     console.error("❌ No user email found. Cannot create chat.");
    //     return;
    //   }
    
    //   const requestBody = {
    //     name: "New Chat", // Ensure 'name' is provided
    //     email: userEmail,  // Include user email if required by backend
    //   };
    
    //   console.log("🛠 Sending request to create chat with body:", requestBody);
    
    //   fetch("http://localhost:8000/api/chats/", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(requestBody),
    //   })
    //     .then(async (response) => {
    //       if (!response.ok) {
    //         const errorData = await response.json();
    //         throw new Error(`Failed to create chat: ${JSON.stringify(errorData)}`);
    //       }
    //       return response.json();
    //     })
    //     .then((newChat) => {
    //       console.log("✅ Chat created successfully:", newChat);
    //     })
    //     .catch((error) => {
    //       console.error("❌ Chat creation failed:", error);
    //     });
    // };
    const createChat = () => {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        console.error("❌ No user email found. Cannot create chat.");
        return;
      }
    
      const requestBody = {
        name: "New Chat",
        email: userEmail,
      };
    
      console.log("🛠 Sending request to create chat with body:", requestBody);
    
      fetch("http://localhost:8000/api/chats/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })
        .then(async (response) => {
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to create chat: ${JSON.stringify(errorData)}`);
          }
          return response.json();
        })
        .then((newChat) => {
          console.log("✅ Chat created successfully:", newChat);
    
          // ✅ Update current chat ID so WebSocket connects
          onNewChatCreated(newChat.id);
        })
        .catch((error) => {
          console.error("❌ Chat creation failed:", error);
        });
    };
    
    
    

    return (
      <Form onSubmit={handleSubmit}>
        <StyledTextareaAutosize
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          maxRows={10}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button type="submit">Send</Button>
      </Form>
    );
  }
;

const Form = styled.form`
  display: flex;
  align-items: flex-start;
  padding: 10px;
  border-top: 1px solid #eee;
`;

const StyledTextareaAutosize = styled(TextareaAutosize)`
  flex-grow: 1;
  border: 1px solid #eee;
  border-radius: 3px;
  padding: 10px;
  margin-right: 10px;
  resize: none;
  overflow: auto;
  font-family: inherit;
  font-size: 16px;
  min-height: 14px; // Initial height
  max-height: 500px; // Max height
  &:focus,
  &:active {
    border-color: #1C1C1C;
    outline: none;
  }
`;

const Button = styled.button`
  height: 40px;
  padding: 10px 20px;
  border: none;
  background-color: #1C1C1C;
  color: white;
  cursor: pointer;
  border-radius: 3px;
  font-size: 1em;
  align-self: flex-end;
  &:hover {
    background-color: #333333; /* Change this to the desired lighter shade */
  }
`;
