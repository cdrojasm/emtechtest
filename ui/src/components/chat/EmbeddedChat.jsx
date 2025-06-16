import { useEffect, useState, useRef } from 'react';
import Container from './Container.jsx';
import Header from './Header.jsx';
import Body from './Body.jsx';
import ChatInput from './ChatInput.jsx';
import { v4 as uuidv4 } from 'uuid';
import {
  createUser,
  getUser,
  createChat,
  connectToChat,
  checkChatService
} from '../../services/chat.js';
import '../../index.css';
import RegistrationForm from './RegistrationForm.jsx';

function EmbeddedChat({
  apiBaseURL = null,
  assetsRoutesURL = null,
}) {

  const APIBaseURL = apiBaseURL;
  const chataiAttributes = {
    "data-chat-ai-theme": "light",
  }
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [enabledConnection, setEnabledConnection] = useState(false);
  const [enableRegistrationForm, setEnableRegistrationForm] = useState(true);
  const [user, setUser] = useState(null);
  const [ws, setWs] = useState(null);
  const [error, setError] = useState({ status: false, message: null });
  const [generalLoading, setGeneralLoading] = useState(false);
  const [typingNotification, setTypingNotification] = useState(false);
  const [typingNotificationMessage, setTypingNotificationMessage] = useState("");
  const [collapsedChat, setCollapsedChat] = useState(false);
  const isFirstRun = useRef(true);

  const handleGetUserRequest = async (userID) => {
    return await getUser(userID, APIBaseURL);
  }

  const handleCreateChatRequest = async (userID) => {
    return await createChat(APIBaseURL, userID);
  }

  const handleCreateUserRequest = async (username, email, userID, phone) => {
    return await createUser(APIBaseURL, username, email, userID, phone);
  }

  const handleCheckChatService = async () => {
    return await checkChatService(APIBaseURL);
  }

  const handleGetUser = async (userID) => {
    setGeneralLoading(true);
    try {
      let { data, msg } = await handleGetUserRequest(userID);
      setUser(data);
      setGeneralLoading(false);
      setEnableRegistrationForm(false);
    } catch (error) {
      setError({ status: true, message: `Error loading user. ${error}` });
      setGeneralLoading(false);
      return;
    }
  }

  const handleCreateUser = async ({
    username,
    email,
    userID,
    phone
  }) => {
    /* e.preventDefault(); */
    setGeneralLoading(true);
    try {
      try {
        const { data, msg } = await handleGetUserRequest(userID);
        if (data) {
          console.log("User already exists, loading user data.");
          alert("Usuario ya existe, cargando datos de usuario.");
          setUser(data);
          localStorage.setItem("USER", JSON.stringify(data));
          setGeneralLoading(false);
          return;
        }
      }catch (error) {
        if (error.response && error.response.status === 404) {
          console.log("User not found, creating new user.");
        } 
      }
      const { data, msg } = await handleCreateUserRequest(
        username,
        email,
        userID,
        phone
      );
      setUser(data);
      localStorage.setItem("USER", JSON.stringify(data));
    } catch (error) {
      setError({ status: true, message: `Error creating user. ${error}` });
      setGeneralLoading(false);
      return;
    }
  }

  const handleCreateChat = async (user) => {
    setGeneralLoading(true);
    try {
      let { data, msg } = await handleCreateChatRequest(user.id);
      setChat(data);
      setGeneralLoading(false); 
    } catch (error) {
      setError({ status: true, message: `Error creating chat. ${error}` });
      setGeneralLoading(false);
      return;
    }
  }

  /* chat elements events */
  const handleCloseChat = (ws) => {
    setEnabledConnection(false);
    if (ws != null && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
    setWs(null);
    setTypingNotification(false);
    setTypingNotificationMessage("Chat Finalizado");
  }

  const resetError = () => { setError({ status: false, message: null }) }

  const handleConnectToChat = () => {
    const ws = connectToChat({
      "baseURL": apiBaseURL,
      "chatID": chat.id,
      "onMessage": (event) => {
        const receivedMessage = JSON.parse(event.data);
        if (receivedMessage
          .hasOwnProperty("is_notification") &&
          receivedMessage.is_notification &&
          receivedMessage.hasOwnProperty("notification_type")) {
          let notificationType = receivedMessage["notification_type"];
          if (notificationType === "chat_closed") {
            setEnabledConnection(false);
            handleCloseChat(ws);
            setTypingNotification(true);
            setTypingNotificationMessage("Chat cerrado");
          } else if (notificationType === "ia_thinking") {
            setTypingNotification(true);
            setTypingNotificationMessage("Generando respuesta")
          } else if (notificationType === "content_filtering") {
            setTypingNotification(true);
            setTypingNotificationMessage("Filtrando contenido")
          } else if (notificationType === "inactivity_warning") {
            setTypingNotification(true);
            setTypingNotificationMessage(`Advertencia de inactividad - ${receivedMessage.inactivity_warning_time} segundos para cierre`);
          } else if (notificationType === "inactivity_close") {
            setEnabledConnection(false);
            setTypingNotification(false);
            handleCloseChat(ws);
            setMessages((prevMsgs) => {
              return [...prevMsgs, {
                "id": uuidv4(),
                "type": "chat_announcement",
                "content": "Chat finalizado por inactividad",
              }]
            })
          }
          return;
        }
        setTypingNotification(false);
        setTypingNotificationMessage("");
        console.log("receiving message", receivedMessage);
        setMessages((prevMessages) => [...prevMessages, receivedMessage]);
      },
      "onError": (error) => {
        console.error("WebSocket error:", error);
      },
      "onClose": (event) => {
        console.log("WebSocket connection closed:", event.reason);
      }
    });
    setWs(ws);
    return () => {
      handleCloseChat(ws);
    };
  }

  const handleInitializeChat = async () => {
    const backendReady = await handleCheckChatService(APIBaseURL)
    if (!backendReady) {
      setError({ status: true, message: "Chat service is not available. Please try again later." });
      return;
    }
    const storedUser = localStorage.getItem("USER");
    if (storedUser) {
      await handleGetUser(JSON.parse(storedUser).id);
    } else {
      setEnableRegistrationForm(true);
    }
  }

  /* use effects */
  useEffect(() => {
    if (isFirstRun.current) { return; }
    if (error.status === true && error.message !== null) {
      console.error("Error loading chat", error);
      resetError();
    }
  }, [error])

  useEffect(() => {
    handleInitializeChat();
  }, [])

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    if (user === null || user === undefined) {
      setEnableRegistrationForm(true);
      return;
    }
    handleCreateChat(user)
  }, [user]);

  useEffect(() => {
    if (chat === null || chat === undefined) {
      return;
    }
    setEnabledConnection(true);
    handleConnectToChat();
    setEnableRegistrationForm(false);
  }, [chat]);

  console.log("chat", chat);
  console.log("messages", messages);
  console.log("user", user);
  console.log("ws", ws);
  return (
    <Container
      attributes={chataiAttributes}
      collapsedChat={collapsedChat}
      setCollapsedChat={setCollapsedChat}
      HeaderComponent={
        <Header
          attributes={chataiAttributes}
          loadingHeader={generalLoading}
          user={user}
          title={"New Conversation"}
          minimizeChat={() => { setCollapsedChat(true) }}
          closeChat={handleCloseChat}
          assetRoutes={assetsRoutesURL}
          typingNotification={typingNotification}
          typingNotificationMessage={typingNotificationMessage}
        />
      }
      body={
        <Body
          loadingBody={false}
          messageListObjects={messages}
          attributes={chataiAttributes}
        />
      }
      input={
        <ChatInput
          attributes={chataiAttributes}
          user={user}
          chat={chat}
          inputActive={enabledConnection}
          ws={ws}
        />
      }
      registrationForm={
        <RegistrationForm
          attributes={chataiAttributes}
          handleCreateUser={handleCreateUser}
        />
      }
      enableRegistrationForm={enableRegistrationForm}
      generalError={error}
      generalLoading={generalLoading}
    />
  )
}
export default EmbeddedChat