import { RequestAPIAdapter } from '../adapters/RequestAPIAdapter';
import { chatAdapter,  userAdapter} from '../adapters/chatAdapters';

export async function createUser(APIBaseURL, username, email, userID, phone) {
    const createNewUserResponseAdapter = new RequestAPIAdapter({
        url: `${APIBaseURL}user/`,
        method: 'POST',
        requestData: {
            "name": username,
            "email": email,
            "id": userID,
            "phone": phone,
        },
        responseDataAdapter: userAdapter
    });
    try {
        return (await createNewUserResponseAdapter.sendRequest()).process();
    
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

export async function getUser(userId, APIBaseURL) {
    const getUserResponseAdapter = new RequestAPIAdapter({
        url: `${APIBaseURL}user/${userId}`,
        method: 'GET',
        responseDataAdapter: userAdapter
    });
    return (await getUserResponseAdapter.sendRequest()).process();
}

export async function createChat(
    APIBaseURL,
    userID
) {
    const createChatResponseAdapter = new RequestAPIAdapter({
        url: `${APIBaseURL}chat/`,
        method: 'POST',
        requestData: {
            "user_id": userID,
        },
        responseDataAdapter: chatAdapter,
    });
    await createChatResponseAdapter.sendRequest()
    return createChatResponseAdapter.process();
}

export function connectToChat({
    baseURL,
    chatID,
    onMessage,
    onError,
    onClose
}) {
    const wsUrl = `${baseURL}chat/${chatID}`;
    let ws = new WebSocket(wsUrl);
    ws.onopen = () => {
        console.log('WebSocket connection established to:', wsUrl);
    };
    ws.onmessage = (event) => {
        if (typeof onMessage === 'function') {
            onMessage(event);
        } else {
            console.log('Message received:', event.data);
        }
    };
    ws.sendMessage = (message) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
            console.log('Message sent:', message);
        } else {
            console.error('WebSocket is not open. Unable to send message.');
        }
    };
    ws.onerror = (error) => {
        if (typeof onError === 'function') {
            onError(error);
        } else {
            console.error('WebSocket error:', error);
        }
    };
    ws.onclose = (event) => {
        if (typeof onClose === 'function') {
            onClose(event);
        } else {
            console.log('WebSocket connection closed:', event.reason);
        }
    };
    return ws;
}

export async function checkChatService(APIBaseURL) {
    const checkChatServiceResponseAdapter = new RequestAPIAdapter({
        url: `${APIBaseURL}health`,
        method: 'GET',
        responseDataAdapter: null
    });
    return (await checkChatServiceResponseAdapter.sendRequest()).checkResponseCode();
}