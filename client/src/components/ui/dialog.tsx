import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const DialogContext = React.createContext<{
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
} | null>(null)

function useDialog() {
  const context = React.useContext(DialogContext)
  if (!context) {
    throw new Error("Dialog components must be used within a Dialog")
  }
  return context
}

const Dialog = ({
  children,
  open: controlledOpen,
  onOpenChange: setControlledOpen
}: {
  children: React.ReactNode,
  open?: boolean,
  onOpenChange?: (open: boolean) => void
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)

  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen
  console.log('Dialog render:', { controlledOpen, uncontrolledOpen, open })

  const setOpen = React.useCallback((value: React.SetStateAction<boolean>) => {
    const newState = typeof value === 'function' ? value(open) : value
    console.log('Dialog setOpen:', newState)
    if (setControlledOpen) {
      setControlledOpen(newState)
    } else {
      setUncontrolledOpen(newState)
    }
  }, [open, setControlledOpen])

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  )
}

const DialogTrigger = ({
  children,
  asChild
}: {
  children: React.ReactNode,
  asChild?: boolean
}) => {
  const { setOpen } = useDialog()

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: React.MouseEvent) => {
        children.props.onClick?.(e)
        setOpen(true)
      }
    })
  }

  return (
    <button onClick={() => setOpen(true)}>
      {children}
    </button>
  )
}

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { open, setOpen } = useDialog()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={() => setOpen(false)}
      />

      {/* Content */}
      <div
        ref={ref}
        className={cn(
          "relative z-50 grid w-full max-w-lg scale-100 gap-4 border border-gray-200 bg-white p-6 shadow-lg duration-200 sm:rounded-lg",
          className
        )}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
        <div
          className="absolute right-4 top-4 opacity-70 transition-opacity hover:opacity-100 cursor-pointer"
          onClick={() => setOpen(false)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </div>
      </div>
    </div>
  )
})
DialogContent.displayName = "DialogContent"

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = "DialogDescription"

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
