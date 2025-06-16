import EmbeddedChat from './components/chat/EmbeddedChat';
import React from 'react';
import ReactDOM from 'react-dom/client';

const developmentRootElement = document.getElementById('rootDevelopmentCreangel');
if (developmentRootElement) {
  ReactDOM.createRoot(developmentRootElement).render(
    <EmbeddedChat
      apiBaseURL="http://localhost:8000/"
      assetsRoutesURL="https://ifindit.creangel.com/chataiAssets/assets/"
    />);
}
