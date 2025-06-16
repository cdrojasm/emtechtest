import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Send } from "lucide-react";
import { useState, useEffect, useRef } from "react";

function ChatInput({
  user = null,
  chat = null,
  inputActive = true,
  ws = null,
  attributes = null,
}) {
  const [currentInput, setCurrentInput] = useState("");
  const textareaRef = useRef(null);

  // Inside your EmbeddedChat component, likely within a useEffect hook
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.keyCode === 32 || event.code === 'Space') {
        const target = event.target;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable || target.tagName === "CHAT-AI") {
          setCurrentInput((prev) => prev + " "); // Add a space to the current input
          event.preventDefault(); // Prevent default behavior if needed (e.g., scrolling the page)
          return;
        }
        event.preventDefault(); // Prevent default behavior if needed (e.g., scrolling the page)
        console.log('Space key pressed outside of input, triggering scroll');
      }
    };

    // Add the event listener
    document.addEventListener('keydown', handleKeyDown);
    // Or window.addEventListener('keydown', handleKeyDown); depending on where it's attached

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Or window.removeEventListener('keydown', handleKeyDown);
    };
  }, []); // Add dependencies if handleKeyDown relies on component state/props

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      const initialHeight = textarea.scrollHeight;
      const maxHeight = initialHeight * 2;

      const handleInput = () => {
        textarea.style.height = "auto"; // Reset height to calculate new height
        if (textarea.scrollHeight <= maxHeight) {
          textarea.style.height = `${textarea.scrollHeight}px`;
          textarea.style.overflowY = "hidden"; // Remove scrollbar if height is within limit
        } else {
          textarea.style.height = `${maxHeight}px`;
          textarea.style.overflowY = "scroll"; // Add scrollbar if height exceeds limit
        }
      };

      textarea.addEventListener("input", handleInput);
      return () => textarea.removeEventListener("input", handleInput);
    }
  }, []);

  const handleUpdateInput = (input) => {
    setCurrentInput(input);
    if (ws != null && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "typing",
        })
      );
    }
  };

  const handleSendMessage = () => {
    const message = {
      type: "user_message",
      content: currentInput,
      chat_id: chat.id,
      timestamp_frontend: new Date().toISOString(),
    };
    message.user_id = user.id;
    if (ws != null && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      setCurrentInput(""); // Clear the input field after sending
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto"; // Reset to auto
        textarea.style.overflowY = "hidden"; // Prevent scrollbars from showing
      }
    }
  };

  const handleOnSend = () => {
    if (currentInput !== null && currentInput !== undefined && currentInput !== "") {
      handleSendMessage();
    }
  };

  return (
    <div className="flex items-center space-x-2" {...attributes}>
      <Textarea
        ref={textareaRef}
        placeholder="tienes alguna pregunta ?"
        disabled={!inputActive}
        onChange={(e) => handleUpdateInput(e.target.value)}
        value={currentInput}
        rows="1"
        style={{
          resize: "none",
          overflowY: "hidden",
          minHeight: "30px"
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleOnSend();
          }
        }}
      />
      <Button type="submit" disabled={!inputActive}>
        <Send
          onClick={handleOnSend}
        />
      </Button>
    </div>
  );
}
export default ChatInput;
