

// import React, { useEffect, useRef, useState } from 'react';
// import { Sidebar } from './components/chat/Sidebar';
// import { ChatBox } from './components/chat/ChatBox';
// import { ChatInput } from "./components/chat/ChatInput";
// import styled from 'styled-components';
// import ReconnectingWebSocket from "reconnecting-websocket";
// import { Message } from "./data/Message";
// import { ChatMenu } from "./components/chat/debug/ChatMenu";
// import { DebugDrawer } from "./components/chat/debug/DebugDrawer";
// import { Login } from "./components/chat/Login"; // Import Login Component

// export const App = () => {
//   const [currentChatId, setCurrentChatId] = useState<string | null>(null);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const webSocket = useRef<ReconnectingWebSocket | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [debugMessage, setDebugMessage] = useState<string>("");
//   const [debugMode, setDebugMode] = useState<boolean>(false);
//   const [user, setUser] = useState<string | null>(localStorage.getItem("userEmail"));

//   useEffect(() => {
//     if (!user) return; // Prevents WebSocket setup before login

//     if (currentChatId) {
//       if (webSocket.current) {
//         webSocket.current.close(); // Close existing connection before creating a new one
//       }

//       webSocket.current = new ReconnectingWebSocket(`ws://localhost:8000/ws/chat/${currentChatId}/`);

//       webSocket.current.onopen = () => {
//         console.log(`✅ Connected to WebSocket: ws://localhost:8000/ws/chat/${currentChatId}/`);
//       };

//       webSocket.current.onmessage = (event) => {
//         try {
//           const data = JSON.parse(event.data);
//           if (data.type === "debug") {
//             setDebugMessage(prevMessage => prevMessage + data.message.replace(/\n/g, '<br />'));
//           } else {
//             setLoading(false);
//             const newMessage = { sender: 'AI', content: data.message };
//             setMessages(prevMessages => [...prevMessages, newMessage]);
//           }
//         } catch (error) {
//           console.error("❌ WebSocket message error:", error);
//         }
//       };

//       webSocket.current.onerror = (error) => {
//         console.error("❌ WebSocket error:", error);
//         setTimeout(() => {
//           console.log("🔄 Reconnecting WebSocket...");
//           setCurrentChatId(null);
//         }, 3000);
//       };

//       webSocket.current.onclose = (event) => {
//         console.warn("⚠️ Chat socket closed unexpectedly:", event.reason);
//       };

//       fetchMessages(currentChatId);
//     }

//     return () => {
//       webSocket.current?.close();
//     };
//   }, [currentChatId, user]);

//   const onChatSelected = (chatId: string | null) => {
//     if (currentChatId === chatId) return;
//     if (chatId == null) {
//       setMessages([])
//     }
//     setCurrentChatId(chatId);
//   };

//   const onNewUserMessage = (chatId: string, message: Message) => {
//     if (!webSocket.current || webSocket.current.readyState !== WebSocket.OPEN) {
//       console.warn("⚠️ WebSocket is not ready. Retrying...");
//       setTimeout(() => onNewUserMessage(chatId, message), 1000);
//       return;
//     }

//     webSocket.current.send(
//       JSON.stringify({
//         message: message.content,
//         chat_id: chatId,
//       })
//     );

//     setMessages(prevMessages => [...prevMessages, message]);
//     setLoading(true);
//   };

//   const fetchMessages = (currentChatId: string | null) => {
//     fetch(`http://localhost:8000/api/chats/${currentChatId}/messages/`)
//       .then(response => response.json())
//       .then(data => {
//         setMessages(data)
//       });
//   };

//   if (!user) {
//     return <Login setUser={setUser} />;
//   }

//   return (
//     <AppContainer>
//       <Sidebar onChatSelected={onChatSelected} selectedChatId={currentChatId} />
//       <ChatContainer debugMode={debugMode}>
//         <ChatMenu debugMode={debugMode} setDebugMode={setDebugMode} />
//         <ChatBox messages={messages} isLoading={loading} />
//         <ChatInput 
//           onNewUserMessage={onNewUserMessage} 
//           chatId={currentChatId} 
//           onNewChatCreated={() => {}} // Add empty function if not used
//         />

//       </ChatContainer>
//       {debugMode && <DebugDrawer message={debugMessage} debugMode={debugMode} />}
//     </AppContainer>
//   );
// };

// const AppContainer = styled.div`
//   display: flex;
//   height: 100vh;
// `;

// const ChatContainer = styled.div<{ debugMode: boolean }>`
//   display: flex;
//   flex-direction: column;
//   width: ${({ debugMode }) => (debugMode ? '70%' : '100%')};
//   transition: all 0.2s;
// `;
import React, { useEffect, useRef, useState } from 'react';
import { Sidebar } from './components/chat/Sidebar';
import { ChatBox } from './components/chat/ChatBox';
import { ChatInput } from "./components/chat/ChatInput";
import styled from 'styled-components';
import ReconnectingWebSocket from "reconnecting-websocket";
import { Message } from "./data/Message";
import { ChatMenu } from "./components/chat/debug/ChatMenu";
import { DebugDrawer } from "./components/chat/debug/DebugDrawer";
import { Login } from "./components/chat/Login";

export const App = () => {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const webSocket = useRef<ReconnectingWebSocket | null>(null);
  const [loading, setLoading] = useState(false);
  const [debugMessage, setDebugMessage] = useState<string>("");
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const [user, setUser] = useState<string | null>(localStorage.getItem("userEmail"));
  const [chats, setChats] = useState<any[]>([]);

  


  useEffect(() => {
    if (!user || !currentChatId) return;
  
    if (webSocket.current) {
      webSocket.current.close();
    }
  
    const wsUrl = `ws://127.0.0.1:8000/ws/chat/${currentChatId}/?email=${user}`;
    webSocket.current = new ReconnectingWebSocket(wsUrl);
  
    webSocket.current.onopen = () => {
      console.log(`✅ Connected to WebSocket: ${wsUrl}`);
    };
  
    webSocket.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📩 WebSocket received:", data); // ✅ Debugging log
    
        if (data.type === "debug") {
          setDebugMessage((prevMessage) => prevMessage + data.message.replace(/\n/g, '<br />'));
        } else if (data.message) {
          setLoading(false);
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'AI', content: data.message }, // ✅ Ensure correct format
          ]);
        }
      } catch (error) {
        console.error("❌ WebSocket message error:", error);
      }
    };
  
    webSocket.current.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
      setTimeout(() => {
        console.log("🔄 Reconnecting WebSocket...");
      }, 3000);
    };
  
    webSocket.current.onclose = (event) => {
      console.warn("⚠️ Chat socket closed unexpectedly:", event.reason);
    };
  
    fetchMessages(currentChatId); // ✅ Fetch messages for new chat ID
  
    return () => {
      webSocket.current?.close();
    };
  }, [currentChatId, user]); // ✅ Reconnect when `currentChatId` changes
  
  const handleNewChatCreated = (chatId: string) => {
    setCurrentChatId(chatId);  // Update state with the new chat ID
  };
  
  const onChatSelected = (chatId: string | null) => {
    if (currentChatId === chatId) return;
    setCurrentChatId(chatId);
    setMessages([]); // ✅ Clear messages before fetching new ones
  
    if (chatId) {
      fetchMessages(chatId); // ✅ Fetch messages for the selected chat
    }
  };
  

  const onNewUserMessage = (chatId: string, message: Message) => {
    if (!webSocket.current || webSocket.current.readyState !== WebSocket.OPEN) {
      console.warn("⚠️ WebSocket is not ready. Retrying...");
      setTimeout(() => onNewUserMessage(chatId, message), 1000);
      return;
    }

    webSocket.current.send(
      JSON.stringify({ message: message.content, chat_id: chatId })
    );

    setMessages(prevMessages => [...prevMessages, message]);
    setLoading(true);
  };

  // const fetchMessages = (chatId: string | null) => {
  //   if (!chatId || !user) return;  // ✅ Ensure user is available
  
  //   fetch(`http://127.0.0.1:8000/api/chats/?email=${user}`)  // ✅ Replace `userEmail` with `user`
  //     .then(response => response.json())
  //     .then(data => {
  //       if (Array.isArray(data.chats)) {
  //         setChats(data.chats); 
  //         setMessages(Array.isArray(response.data.messages) ? response.data.messages : []);
 
  //       } else {
  //         console.error("❌ Unexpected response format:", data);
  //         setChats([]);
  //         setMessages(Array.isArray(response.data.messages) ? response.data.messages : []);
  //       }
  //     })
  //     .catch(error => {
  //       console.error("Error fetching chats:", error);
  //       setChats([]);
  //       setMessages(Array.isArray(data.messages) ? data.messages : []);

  //     });
  // };
  const fetchMessages = (chatId: string | null) => {
    if (!chatId || !user) return; // ✅ Ensure user is available
  
    fetch(`http://127.0.0.1:8000/api/chats/?email=${user}`)
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data.chats)) {
          setChats(data.chats);
          setMessages(Array.isArray(data.messages) ? data.messages : []);
        } else {
          console.error("❌ Unexpected response format:", data);
          setChats([]);
          setMessages([]);
        }
      })
      .catch(error => {
        console.error("Error fetching chats:", error);
        setChats([]);
        setMessages([]); // ✅ Don't reference `data` here
      });
  };
  
  

  if (!user) {
    return <Login setUser={setUser} />;
  }

  return (
    <AppContainer>
      <Sidebar onChatSelected={onChatSelected}  onNewChatCreated={handleNewChatCreated} selectedChatId={currentChatId} />
      <ChatContainer debugMode={debugMode}>
        <ChatMenu debugMode={debugMode} setDebugMode={setDebugMode} />
        <ChatBox messages={messages} isLoading={loading} />
        <ChatInput 
          onNewUserMessage={onNewUserMessage} 
          chatId={currentChatId} 
          onNewChatCreated={setCurrentChatId} 
        />
      </ChatContainer>
      {debugMode && <DebugDrawer message={debugMessage} debugMode={debugMode} />}
    </AppContainer>
  );
};

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
`;

const ChatContainer = styled.div<{ debugMode: boolean }>`
  display: flex;
  flex-direction: column;
  width: ${({ debugMode }) => (debugMode ? '70%' : '100%')};
  transition: all 0.2s;
`;
