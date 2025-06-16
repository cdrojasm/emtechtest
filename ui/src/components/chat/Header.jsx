import { Skeleton } from "../ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { useMemo } from "react";
import HeaderMenu from "./HeaderMenu"

function Header({
  attributes = null,
  loadingHeader = true,
  user = null,
  title = null,
  minimizeChat = null,
  closeChat = null,
  assetRoutes = '/',
  typingNotification = null,
  typingNotificationMessage = null,
}) {
  if (assetRoutes === null) { throw new Error("assetRoutes is null") }
  const availableAvatar = ["bear", "bot", "capibara", "female", "male"];
  const selectedAvatar = useMemo(() => {
    if (!user || !user.avatar || !availableAvatar.includes(user.avatar)) {
      const randomIndex = Math.floor(Math.random() * availableAvatar.length);
      return availableAvatar[randomIndex];
    }
    return user.avatar;
  }, [user]);

  const avatarRouterURL = `${assetRoutes === '/'
    ? ''
    : assetRoutes}/avatars/${selectedAvatar}_avatar_resized.png`;
  let userName = user?.name || "Anonymous User";
  let chatConfigTitle = title || null;

  if (loadingHeader) {
    return (
      <div id="team_mate_chat_header_container" className="flex items-center space-x-4" {...attributes}>
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    )
  }
  return (
    <div id="team_mate_chat_header_container" className="flex items-center space-x-4" {...attributes}>
      <Avatar>
        <AvatarImage src={avatarRouterURL} />
        <AvatarFallback>{selectedAvatar}</AvatarFallback>
      </Avatar>
      <div className="space-y-2 w-9/10">
        <h3 className="w-9/10 mb-0">{
          chatConfigTitle !== null ? chatConfigTitle : userName
        }</h3>
        {typingNotification &&
          <h6 className="text-xs text-muted-foreground">{typingNotificationMessage}</h6>
        }
      </div>
      <HeaderMenu
        attributes={attributes}
        closeChat={closeChat}
        minimizeChat={minimizeChat}
      />
    </div>
  )
}
export default Header