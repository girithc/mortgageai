import { ChevronDown } from "lucide-react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

export default function User() {
  let user = { username: "admin" };

  return (
    <div className="flex h-16 items-center border-b border-border px-2">
      <div className="flex w-full items-center justify-between rounded-md px-2 py-1 hover:bg-slate-200 dark:hover:bg-slate-800">
        <div className="flex items-center">
          <Image
            src="/avatar.png"
            alt="User"
            className="mr-2 rounded-full"
            width={36}
            height={36}
          />
          <div className="flex flex-col">
            <span className="text-sm font-medium">{user.name || "Name"}</span>
            <span className="text-xs text-muted-foreground">Agent Admin</span>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <ChevronDown size={16} />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem onClick={() => {window.location.href = `/profile`}}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {window.location.href = `/auth`}}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
    
  
      </div>
    </div>
  );
}
