import { Skeleton } from "../ui/skeleton"
import MessageList from "./MessageList"
function Body({
  loadingBody = true,
  messageListObjects = [],
  attributes = null,
}) {
  if (loadingBody) {
    return (
      <div id="team_mate_chat_body_container" className="flex items-center space-x-4" {...attributes}>
        <Skeleton className="h-90 w-full" />
      </div>
    )
  }
  return (
    <div id="team_mate_chat_body_container" className="flex items-center space-x-4" {...attributes}>
      <MessageList
        messageListObjects={messageListObjects}
      />
    </div>
  )
}
export default Body
