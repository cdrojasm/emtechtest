import { EllipsisVertical } from "lucide-react"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

function HeaderMenu({
  attributes = null,
  closeChat = null,
  minimizeChat = null,
}) {
  return (
    <DropdownMenu modal={false} {...attributes}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline"><EllipsisVertical /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" {...attributes} >
        <DropdownMenuLabel disabled className="p86i">Acciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={minimizeChat}
          className="p86i">
          Cerrar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
export default HeaderMenu