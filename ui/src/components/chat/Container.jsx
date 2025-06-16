import { Separator } from "../ui/separator"
import { Progress } from "../ui/progress"
import { Button } from "../ui/button"
import React, { useEffect, useState } from 'react'
import { Bot } from "lucide-react"
import { cn } from "@/lib/utils"

function Container({
  HeaderComponent,
  body,
  input,
  registrationForm = null,
  enableRegistrationForm = false,
  generalError = null,
  generalLoading = false,
  collapsedChat = true,
  attributes = null,
  setCollapsedChat = () => { },
}) {
  const containerClasses = cn(
    collapsedChat ? "fixed bottom-15 right-15 w-[30px]" : "fixed bottom-1 right-25 w-[370px] max-h-550",
  )
  const [progress, setProgress] = useState(0);
  const [cycle, setCycle] = useState(0);
  useEffect(() => {
    if (generalLoading) {
      const timer = setTimeout(() => {
        if (progress < 100) {
          setProgress(progress + 10);
        } else {
          setProgress(0);
          setCycle(cycle + 1);
        }
      }, 75);
      return () => clearTimeout(timer);
    }
  }, [progress, cycle, generalLoading]);

  useEffect(() => {
    if (generalLoading) {
      setProgress(0);
      setCycle(0);
    }
  }, [generalLoading])

  console.log("attributes", attributes)

  if (collapsedChat) {
    return (
      <div
        className={containerClasses}
        {...attributes}
      >
        <Button
          className="w-15 h-15 rounded-full shadow"
          onClick={() => setCollapsedChat(false)}
        > <Bot style={{
          width: "30px",
          height: "30px",
        }} />
        </Button>
      </div>
    )
  }

  if (generalError && generalError?.status && generalError?.message !== "") {
    return (
      <div
        className={containerClasses}
        {...attributes}
      >
        <div className="rounded-xl border bg-card text-card-foreground shadow w-full p-4">
          <div className="text-red-500">
            {generalError?.status &&
              <>
                <h3 className="font-semibold tracking-tight text-2xl">{"Algo salio mal !"}</h3>
                <p className="text-sm text-muted-foreground">{generalError?.message}</p>
              </>
            }
          </div>
        </div>
      </div>
    )
  }

  if (enableRegistrationForm) {
    return (
      <div
        className={containerClasses}
        {...attributes}
      >
        <div className="rounded-xl border bg-card text-card-foreground shadow w-full p-4">
          {generalLoading &&
            <Progress value={progress} className="w-full" />
          }
          {registrationForm}
        </div>
      </div>
    )
  }
  return (
    <div
      className={containerClasses}
      {...attributes}
    >
      <div className="rounded-xl border bg-card text-card-foreground shadow w-full p-4">
        {generalLoading &&
          <Progress value={progress} className="w-full" />
        }
        {HeaderComponent}	
        <Separator className="my-4" />
        {body}
        <Separator className="my-4" />
        {input}
      </div>
    </div>
  )
}

export default Container
