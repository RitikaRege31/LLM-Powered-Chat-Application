import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import SettingsModal from "./SettingsModal";
import { formatDate } from "../../utils/DateFormatter";
import { Chat } from "../../types/chat";

type SidebarProps = {
  onChatSelected: (chatId: string | null) => void;
  selectedChatId: string | null;
  onNewChatCreated?: (chatId: string) => void;  // Add this prop
};

export const Sidebar: React.FC<SidebarProps> = ({onChatSelected, selectedChatId, onNewChatCreated}) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Fetch chats when the selectedChatId changes
  useEffect(() => {
    fetchChats();
  }, [selectedChatId]);

  // const fetchChats = () => {
  //   fetch('http://localhost:8000/api/chats/')
  //     .then((response) => response.json())
  //     .then((data) => {
  //       const sortedChats = sortChats(data.chats)
  //       setChats(sortedChats);
  //     });
  // };
  const fetchChats = () => {
    fetch("http://localhost:8000/api/chats/")
      .then((response) => response.json())
      .then((data) => {
        console.log("📩 Received chat data:", data); // Debugging log
  
        // If API returns an array directly
        const chatsArray = Array.isArray(data) ? data : data.chats;
  
        if (!Array.isArray(chatsArray)) {
          console.error("❌ Unexpected chat data format:", data);
          setChats([]);
          return;
        }
  
        const sortedChats = sortChats(chatsArray);
        setChats(sortedChats);
      })
      .catch((error) => {
        console.error("❌ Error fetching chats:", error);
        setChats([]);
      });
  };
  

  // const sortChats = (chats: Chat[]) => {
  //   return chats.sort((a, b) => {
  //     const dateA = new Date(a.created_at);
  //     const dateB = new Date(b.created_at);

  //     // sort in descending order
  //     return dateB.getTime() - dateA.getTime();
  //   })
  // }
  const sortChats = (chats: Chat[]) => {
    return chats.sort((a, b) => {
      const dateA = new Date(a.created_at || "1970-01-01");
      const dateB = new Date(b.created_at || "1970-01-01");
      return dateB.getTime() - dateA.getTime();
    });
  };


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
      headers: { "Content-Type": "application/json" },
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
        if (onNewChatCreated) {
        onNewChatCreated(newChat.id);  // Ensure function exists before calling
      } fetchChats();
      })
      .catch((error) => {
        console.error("❌ Chat creation failed:", error);
      });
  };

  const onDeleteChat = (chatId: string) => {
    fetch(`http://localhost:8000/api/chats/${chatId}/`, {
      method: 'DELETE'
    })
      .then(() => {
        // Update the state to remove the deleted chat
        setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));
        // If the deleted chat was the currently selected one, nullify the selection
        if (chatId === selectedChatId) {
          onChatSelected(null);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const handleSettingsClick = () => {
    setShowSettingsModal(true);
  };

  return (
    <SidebarContainer>
      <ChatListContainer>
        <Button onClick={createChat}>+ New Chat</Button>
        {chats.map((chat) => (
          <ChatRow
            key={chat.id}
            onClick={() => onChatSelected(chat.id)}
            isSelected={chat.id === selectedChatId}
          >
            <span>{formatDate(chat.created_at)}</span>
            <FontAwesomeIcon
              icon={faTrash}
              onClick={(e) => {
                e.stopPropagation(); // Prevent the chat row's onClick event from firing.
                onDeleteChat(chat.id);
              }}
            />
          </ChatRow>
        ))}
      </ChatListContainer>
      <Button onClick={() => { 
         localStorage.removeItem("userEmail"); 
         window.location.reload(); 
        }}>
           Logout
      </Button>
      <SettingsRow onClick={handleSettingsClick}>Settings</SettingsRow>
      {showSettingsModal && (
        <SettingsModal setShowSettingsModal={setShowSettingsModal}/>
      )}
    </SidebarContainer>
  );
};

const SidebarContainer = styled.div`
  width: 250px;
  background-color: #1c1c1c;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh; // Adjust the height to fit your layout
`;

const ChatListContainer = styled.div`
  overflow-y: auto;
`;

const ChatRow = styled.div<{ isSelected?: boolean }>`
  padding: 10px;
  cursor: pointer;
  background-color: ${(props) => (props.isSelected ? '#4c4c4c' : 'transparent')};
  &:hover {
    background-color: #3f3f3f;
  }
  color: white;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center; // ensure text and icon are aligned
  overflow: hidden; // add overflow handling

  & > span { // add a span tag around the text inside ChatRow
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 10px;
  }
`;

const Button = styled.button`
  padding: 20px;
  border: none;
  background-color: #1c1c1c;
  width: 100%;
  color: white;
  cursor: pointer;
  border-radius: 3px;
  border-color: #fff;
  font-size: 14px;
  &:hover {
    background-color: #3f3f3f;
  }
`;

const SettingsRow = styled.div`
  padding: 10px;
  margin: 10px;
  cursor: pointer;
  background-color: transparent;
  &:hover {
    background-color: #3f3f3f;
  }
  border-top: 1px solid #3f3f3f;
  color: white;
  font-size: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
