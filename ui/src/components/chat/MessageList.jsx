import Message from './Message'

function MessageList({
  messageListObjects,
}) {
  console.log("MessageList in MEssageList", messageListObjects);

  return (
    <div className="w-full h-full flex flex-col gap-2 max-h-[350px] min-h-[350px] overflow-y-auto">
      {messageListObjects.map((msgLO, key) => {
        console.log("MessageList in MEssageList map", msgLO);
        return (
          <Message
            key={`${String(key)}-${Math.random().toString(36).substr(2, 9)}`}
            direction={msgLO.origin === "chat" ? "incoming" : "outgoing"}
            content={msgLO.content}
            timeStamp={msgLO.created_at ? msgLO.created_at : new Date().toISOString()}
          />
        )
      })}
    </div>
  )
}

export default MessageList
