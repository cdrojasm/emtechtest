import { v4 as uuidv4 } from "uuid";
import Markdown from 'react-markdown'
import { useState } from "react";

function Message({
  key = String(uuidv4()) + "_message",
  direction = "input",
  content = "",
  timeStamp = "",
}) {
  console.log("Message in Message", content, direction, timeStamp);
  const [openCollasedContent, setOpenCollapsedContent] = useState(false);
  const isCollapsable = content.length > 180;
  const contentSlice = content.slice(0, 180);
  const completeContent = content;
  const timeStampText = new Date(timeStamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const handleOpenCollapsedContent = () => {
    setRenderedContent(completeContent);
  }
  
  let classBase = "w-full h-full min-h-[25px]"
  let dataClass = "";
  if (direction === "incoming") {
    classBase += "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm bg-muted"
  } else {
    classBase += "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm ml-auto bg-primary text-primary-foreground"
    dataClass = "text-right text-primary-foreground"
  }
  return (
    <div key={key} className={classBase}>
      <Markdown>
        {openCollasedContent ? completeContent : contentSlice}
      </Markdown>
      {isCollapsable && !openCollasedContent &&
        <div className="flex items-center justify-end w-full">
          <a
            className="text-xs text-muted-foreground cursor-pointer"
            onClick={() => {
              setOpenCollapsedContent(!openCollasedContent);
              handleOpenCollapsedContent();
            }}>... ver mas</a>
        </div>
      }
      <div className="flex items-center justify-end w-full">
        <div className={`text-[9px] text-muted-foreground ${dataClass} mt-1`}>
          {timeStampText}
        </div>
      </div>

    </div>
  )
}

export default Message
