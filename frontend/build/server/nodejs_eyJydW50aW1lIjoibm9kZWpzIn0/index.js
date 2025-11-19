import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, UNSAFE_withComponentProps, Outlet, Meta, Links, ScrollRestoration, Scripts, Link } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import * as React from "react";
import React__default, { createContext, useState, useEffect, useContext, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { Loader2Icon, OctagonXIcon, TriangleAlertIcon, InfoIcon, CircleCheckIcon, XIcon, PanelLeftIcon, ChevronRight, ChevronsUpDown, LogOut, Plus, GalleryVerticalEnd, Home, Map, SearchIcon, Check, Projector, Forward, Waves, Goal, Timer, CheckIcon, CircleIcon, MoreHorizontal, ChevronDownIcon, ChevronUpIcon, ArrowUpDown } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useTheme } from "next-themes";
import { Toaster as Toaster$1, toast } from "sonner";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { useMotionValue, animate, motion } from "framer-motion";
import { CardContent as CardContent$1 } from "@mui/material";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Command as Command$1 } from "cmdk";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { TZDate } from "@date-fns/tz";
import { useReactTable, getFilteredRowModel, getSortedRowModel, getPaginationRowModel, getCoreRowModel, flexRender } from "@tanstack/react-table";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import * as RechartsPrimitive from "recharts";
import { AreaChart, CartesianGrid, XAxis, Area } from "recharts";
import * as SelectPrimitive from "@radix-ui/react-select";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  if (request.method.toUpperCase() === "HEAD") {
    return new Response(null, {
      status: responseStatusCode,
      headers: responseHeaders
    });
  }
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    let timeoutId = setTimeout(
      () => abort(),
      streamTimeout + 1e3
    );
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough({
            final(callback) {
              clearTimeout(timeoutId);
              timeoutId = void 0;
              callback();
            }
          });
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          pipe(body);
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
const SUPABASE_URL = "https://htaqhjqwkzwkwidazqmm.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0YXFoanF3a3p3a3dpZGF6cW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4ODA1NDAsImV4cCI6MjA3ODQ1NjU0MH0.Y2zG2LaXPgI-ytpsIIbGhzUdOENzLh91cuX313Ylzg4";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function Spinner({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    Loader2Icon,
    {
      role: "status",
      "aria-label": "Loading",
      className: cn("size-4 animate-spin", className),
      ...props
    }
  );
}
const AuthContext = createContext(void 0);
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const login2 = async (email, password) => {
    const { data: data2, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error("Login failed: " + error.message);
    if (data2.session && data2.user) {
      setUser({ id: data2.user.id, email: data2.user.email ?? email, avatar: "" });
      navigate("/dashboard");
    } else {
      throw new Error("Login failed: no session returned");
    }
  };
  const register2 = async (email, password) => {
    const { data: data2, error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error("Registration failed: " + error.message);
    if (data2.session === null) {
      navigate("/login");
    }
  };
  const logout = async () => {
    const session = supabase.auth.getSession();
    if (!session) {
      console.warn("No active session. Skipping sign out API call.");
      setUser(null);
      navigate("/login");
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
      return;
    }
    setUser(null);
    navigate("/login");
  };
  useEffect(() => {
    let mounted = true;
    async function initialize() {
      const {
        data: { session }
      } = await supabase.auth.getSession();
      if (!mounted) return;
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? "",
          avatar: ""
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    }
    initialize();
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? "",
          avatar: ""
        });
      } else {
        setUser(null);
      }
    });
    return () => {
      mounted = false;
      subscription?.subscription.unsubscribe();
    };
  }, []);
  useEffect(() => {
    if (!loading && !user && location.pathname !== "/login" && location.pathname !== "/register") {
      navigate("/login");
    }
  }, [loading, user, navigate, location.pathname]);
  const value = React__default.useMemo(() => ({ user, login: login2, logout, register: register2 }), [user]);
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "h-screen w-full flex justify-center items-center", children: /* @__PURE__ */ jsx(Spinner, {}) });
  }
  return /* @__PURE__ */ jsx(AuthContext.Provider, { value, children });
};
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme();
  return /* @__PURE__ */ jsx(
    Toaster$1,
    {
      theme,
      className: "toaster group",
      icons: {
        success: /* @__PURE__ */ jsx(CircleCheckIcon, { className: "size-4" }),
        info: /* @__PURE__ */ jsx(InfoIcon, { className: "size-4" }),
        warning: /* @__PURE__ */ jsx(TriangleAlertIcon, { className: "size-4" }),
        error: /* @__PURE__ */ jsx(OctagonXIcon, { className: "size-4" }),
        loading: /* @__PURE__ */ jsx(Loader2Icon, { className: "size-4 animate-spin" })
      },
      style: {
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)",
        "--border-radius": "var(--radius)"
      },
      ...props
    }
  );
};
function Layout({
  children
}) {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "UTF-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1.0"
      }), /* @__PURE__ */ jsx("title", {
        children: "My App"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      children: [children, /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {}), /* @__PURE__ */ jsx(Toaster, {})]
    })]
  });
}
const root = UNSAFE_withComponentProps(function Root() {
  return /* @__PURE__ */ jsx(AuthProvider, {
    children: /* @__PURE__ */ jsx(Outlet, {})
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Layout,
  default: root
}, Symbol.toStringTag, { value: "Module" }));
function Collapsible({
  ...props
}) {
  return /* @__PURE__ */ jsx(CollapsiblePrimitive.Root, { "data-slot": "collapsible", ...props });
}
function CollapsibleTrigger({
  ...props
}) {
  return /* @__PURE__ */ jsx(
    CollapsiblePrimitive.CollapsibleTrigger,
    {
      "data-slot": "collapsible-trigger",
      ...props
    }
  );
}
function CollapsibleContent({
  ...props
}) {
  return /* @__PURE__ */ jsx(
    CollapsiblePrimitive.CollapsibleContent,
    {
      "data-slot": "collapsible-content",
      ...props
    }
  );
}
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    SeparatorPrimitive.Root,
    {
      "data-slot": "separator",
      decorative,
      orientation,
      className: cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      ),
      ...props
    }
  );
}
function Sheet({ ...props }) {
  return /* @__PURE__ */ jsx(SheetPrimitive.Root, { "data-slot": "sheet", ...props });
}
function SheetPortal({
  ...props
}) {
  return /* @__PURE__ */ jsx(SheetPrimitive.Portal, { "data-slot": "sheet-portal", ...props });
}
function SheetOverlay({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    SheetPrimitive.Overlay,
    {
      "data-slot": "sheet-overlay",
      className: cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      ),
      ...props
    }
  );
}
function SheetContent({
  className,
  children,
  side = "right",
  ...props
}) {
  return /* @__PURE__ */ jsxs(SheetPortal, { children: [
    /* @__PURE__ */ jsx(SheetOverlay, {}),
    /* @__PURE__ */ jsxs(
      SheetPrimitive.Content,
      {
        "data-slot": "sheet-content",
        className: cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          side === "right" && "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          side === "left" && "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          side === "top" && "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
          side === "bottom" && "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
          className
        ),
        ...props,
        children: [
          children,
          /* @__PURE__ */ jsxs(SheetPrimitive.Close, { className: "ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none", children: [
            /* @__PURE__ */ jsx(XIcon, { className: "size-4" }),
            /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
          ] })
        ]
      }
    )
  ] });
}
function SheetHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "sheet-header",
      className: cn("flex flex-col gap-1.5 p-4", className),
      ...props
    }
  );
}
function SheetTitle({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    SheetPrimitive.Title,
    {
      "data-slot": "sheet-title",
      className: cn("text-foreground font-semibold", className),
      ...props
    }
  );
}
function SheetDescription({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    SheetPrimitive.Description,
    {
      "data-slot": "sheet-description",
      className: cn("text-muted-foreground text-sm", className),
      ...props
    }
  );
}
function TooltipProvider({
  delayDuration = 0,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    TooltipPrimitive.Provider,
    {
      "data-slot": "tooltip-provider",
      delayDuration,
      ...props
    }
  );
}
function Tooltip({
  ...props
}) {
  return /* @__PURE__ */ jsx(TooltipProvider, { children: /* @__PURE__ */ jsx(TooltipPrimitive.Root, { "data-slot": "tooltip", ...props }) });
}
function TooltipTrigger({
  ...props
}) {
  return /* @__PURE__ */ jsx(TooltipPrimitive.Trigger, { "data-slot": "tooltip-trigger", ...props });
}
function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsx(TooltipPrimitive.Portal, { children: /* @__PURE__ */ jsxs(
    TooltipPrimitive.Content,
    {
      "data-slot": "tooltip-content",
      sideOffset,
      className: cn(
        "bg-foreground text-background animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsx(TooltipPrimitive.Arrow, { className: "bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" })
      ]
    }
  ) });
}
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      "data-slot": "button",
      className: cn(buttonVariants({ variant, size, className })),
      ...props
    }
  );
}
function Input({ className, type, ...props }) {
  return /* @__PURE__ */ jsx(
    "input",
    {
      type,
      "data-slot": "input",
      className: cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      ),
      ...props
    }
  );
}
const MOBILE_BREAKPOINT = 768;
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(void 0);
  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return !!isMobile;
}
const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";
const SidebarContext = React.createContext(null);
function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}
function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open]
  );
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open2) => !open2) : setOpen((open2) => !open2);
  }, [isMobile, setOpen, setOpenMobile]);
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);
  const state = open ? "expanded" : "collapsed";
  const contextValue = React.useMemo(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  );
  return /* @__PURE__ */ jsx(SidebarContext.Provider, { value: contextValue, children: /* @__PURE__ */ jsx(TooltipProvider, { delayDuration: 0, children: /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "sidebar-wrapper",
      style: {
        "--sidebar-width": SIDEBAR_WIDTH,
        "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
        ...style
      },
      className: cn(
        "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full",
        className
      ),
      ...props,
      children
    }
  ) }) });
}
function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
  if (collapsible === "none") {
    return /* @__PURE__ */ jsx(
      "div",
      {
        "data-slot": "sidebar",
        className: cn(
          "bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col",
          className
        ),
        ...props,
        children
      }
    );
  }
  if (isMobile) {
    return /* @__PURE__ */ jsx(Sheet, { open: openMobile, onOpenChange: setOpenMobile, ...props, children: /* @__PURE__ */ jsxs(
      SheetContent,
      {
        "data-sidebar": "sidebar",
        "data-slot": "sidebar",
        "data-mobile": "true",
        className: "bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden",
        style: {
          "--sidebar-width": SIDEBAR_WIDTH_MOBILE
        },
        side,
        children: [
          /* @__PURE__ */ jsxs(SheetHeader, { className: "sr-only", children: [
            /* @__PURE__ */ jsx(SheetTitle, { children: "Sidebar" }),
            /* @__PURE__ */ jsx(SheetDescription, { children: "Displays the mobile sidebar." })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex h-full w-full flex-col", children })
        ]
      }
    ) });
  }
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "group peer text-sidebar-foreground hidden md:block",
      "data-state": state,
      "data-collapsible": state === "collapsed" ? collapsible : "",
      "data-variant": variant,
      "data-side": side,
      "data-slot": "sidebar",
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            "data-slot": "sidebar-gap",
            className: cn(
              "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
              "group-data-[collapsible=offcanvas]:w-0",
              "group-data-[side=right]:rotate-180",
              variant === "floating" || variant === "inset" ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
            )
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            "data-slot": "sidebar-container",
            className: cn(
              "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
              side === "left" ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]" : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
              // Adjust the padding for floating and inset variants.
              variant === "floating" || variant === "inset" ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
              className
            ),
            ...props,
            children: /* @__PURE__ */ jsx(
              "div",
              {
                "data-sidebar": "sidebar",
                "data-slot": "sidebar-inner",
                className: "bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm",
                children
              }
            )
          }
        )
      ]
    }
  );
}
function SidebarTrigger({
  className,
  onClick,
  ...props
}) {
  const { toggleSidebar } = useSidebar();
  return /* @__PURE__ */ jsxs(
    Button,
    {
      "data-sidebar": "trigger",
      "data-slot": "sidebar-trigger",
      variant: "ghost",
      size: "icon",
      className: cn("size-7", className),
      onClick: (event) => {
        onClick?.(event);
        toggleSidebar();
      },
      ...props,
      children: [
        /* @__PURE__ */ jsx(PanelLeftIcon, {}),
        /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Toggle Sidebar" })
      ]
    }
  );
}
function SidebarRail({ className, ...props }) {
  const { toggleSidebar } = useSidebar();
  return /* @__PURE__ */ jsx(
    "button",
    {
      "data-sidebar": "rail",
      "data-slot": "sidebar-rail",
      "aria-label": "Toggle Sidebar",
      tabIndex: -1,
      onClick: toggleSidebar,
      title: "Toggle Sidebar",
      className: cn(
        "hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] sm:flex",
        "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className
      ),
      ...props
    }
  );
}
function SidebarInset({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "main",
    {
      "data-slot": "sidebar-inset",
      className: cn(
        "bg-background relative flex w-full flex-1 flex-col",
        "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        className
      ),
      ...props
    }
  );
}
function SidebarHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "sidebar-header",
      "data-sidebar": "header",
      className: cn("flex flex-col gap-2 p-2", className),
      ...props
    }
  );
}
function SidebarFooter({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "sidebar-footer",
      "data-sidebar": "footer",
      className: cn("flex flex-col gap-2 p-2", className),
      ...props
    }
  );
}
function SidebarContent({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "sidebar-content",
      "data-sidebar": "content",
      className: cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      ),
      ...props
    }
  );
}
function SidebarGroup({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "sidebar-group",
      "data-sidebar": "group",
      className: cn("relative flex w-full min-w-0 flex-col p-2", className),
      ...props
    }
  );
}
function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "div";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      "data-slot": "sidebar-group-label",
      "data-sidebar": "group-label",
      className: cn(
        "text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className
      ),
      ...props
    }
  );
}
function SidebarMenu({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "ul",
    {
      "data-slot": "sidebar-menu",
      "data-sidebar": "menu",
      className: cn("flex w-full min-w-0 flex-col gap-1", className),
      ...props
    }
  );
}
function SidebarMenuItem({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "li",
    {
      "data-slot": "sidebar-menu-item",
      "data-sidebar": "menu-item",
      className: cn("group/menu-item relative", className),
      ...props
    }
  );
}
const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline: "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]"
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}) {
  const Comp = asChild ? Slot : "button";
  const { isMobile, state } = useSidebar();
  const button = /* @__PURE__ */ jsx(
    Comp,
    {
      "data-slot": "sidebar-menu-button",
      "data-sidebar": "menu-button",
      "data-size": size,
      "data-active": isActive,
      className: cn(sidebarMenuButtonVariants({ variant, size }), className),
      ...props
    }
  );
  if (!tooltip) {
    return button;
  }
  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip
    };
  }
  return /* @__PURE__ */ jsxs(Tooltip, { children: [
    /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: button }),
    /* @__PURE__ */ jsx(
      TooltipContent,
      {
        side: "right",
        align: "center",
        hidden: state !== "collapsed" || isMobile,
        ...tooltip
      }
    )
  ] });
}
function SidebarMenuSub({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "ul",
    {
      "data-slot": "sidebar-menu-sub",
      "data-sidebar": "menu-sub",
      className: cn(
        "border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className
      ),
      ...props
    }
  );
}
function SidebarMenuSubItem({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "li",
    {
      "data-slot": "sidebar-menu-sub-item",
      "data-sidebar": "menu-sub-item",
      className: cn("group/menu-sub-item relative", className),
      ...props
    }
  );
}
function SidebarMenuSubButton({
  asChild = false,
  size = "md",
  isActive = false,
  className,
  ...props
}) {
  const Comp = asChild ? Slot : "a";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      "data-slot": "sidebar-menu-sub-button",
      "data-sidebar": "menu-sub-button",
      "data-size": size,
      "data-active": isActive,
      className: cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground [&>svg]:text-sidebar-accent-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className
      ),
      ...props
    }
  );
}
function NavMain({
  items
}) {
  return /* @__PURE__ */ jsxs(SidebarGroup, { children: [
    /* @__PURE__ */ jsx(SidebarGroupLabel, { children: "Explore" }),
    /* @__PURE__ */ jsx(SidebarMenu, { children: items.map((item) => /* @__PURE__ */ jsx(
      Collapsible,
      {
        asChild: true,
        defaultOpen: item.isActive,
        className: "group/collapsible",
        children: /* @__PURE__ */ jsxs(SidebarMenuItem, { children: [
          /* @__PURE__ */ jsx(CollapsibleTrigger, { asChild: true, children: item.showItems ? /* @__PURE__ */ jsxs(SidebarMenuButton, { tooltip: item.title, children: [
            item.icon && /* @__PURE__ */ jsx(item.icon, {}),
            item.showItems ? /* @__PURE__ */ jsx("span", { children: item.title }) : /* @__PURE__ */ jsx(Link, { to: item.url, children: /* @__PURE__ */ jsx("span", { children: item.title }) }),
            item.showItems && /* @__PURE__ */ jsx(ChevronRight, { className: "ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" })
          ] }) : /* @__PURE__ */ jsx(Link, { to: item.url, children: /* @__PURE__ */ jsxs(SidebarMenuButton, { tooltip: item.title, children: [
            item.icon && /* @__PURE__ */ jsx(item.icon, {}),
            /* @__PURE__ */ jsx("span", { children: item.title })
          ] }) }) }),
          item.showItems && /* @__PURE__ */ jsx(CollapsibleContent, { children: /* @__PURE__ */ jsx(SidebarMenuSub, { children: item.items?.map((subItem) => /* @__PURE__ */ jsx(SidebarMenuSubItem, { children: /* @__PURE__ */ jsx(SidebarMenuSubButton, { asChild: true, children: /* @__PURE__ */ jsx(Link, { to: `/${item.title.toLowerCase()}/` + subItem.url, children: /* @__PURE__ */ jsx("span", { children: subItem.title }) }) }) }, subItem.title)) }) })
        ] })
      },
      item.title
    )) })
  ] });
}
function Avatar({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    AvatarPrimitive.Root,
    {
      "data-slot": "avatar",
      className: cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      ),
      ...props
    }
  );
}
function AvatarImage({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    AvatarPrimitive.Image,
    {
      "data-slot": "avatar-image",
      className: cn("aspect-square size-full", className),
      ...props
    }
  );
}
function AvatarFallback({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    AvatarPrimitive.Fallback,
    {
      "data-slot": "avatar-fallback",
      className: cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      ),
      ...props
    }
  );
}
function DropdownMenu({
  ...props
}) {
  return /* @__PURE__ */ jsx(DropdownMenuPrimitive.Root, { "data-slot": "dropdown-menu", ...props });
}
function DropdownMenuTrigger({
  ...props
}) {
  return /* @__PURE__ */ jsx(
    DropdownMenuPrimitive.Trigger,
    {
      "data-slot": "dropdown-menu-trigger",
      ...props
    }
  );
}
function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}) {
  return /* @__PURE__ */ jsx(DropdownMenuPrimitive.Portal, { children: /* @__PURE__ */ jsx(
    DropdownMenuPrimitive.Content,
    {
      "data-slot": "dropdown-menu-content",
      sideOffset,
      className: cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
        className
      ),
      ...props
    }
  ) });
}
function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}) {
  return /* @__PURE__ */ jsx(
    DropdownMenuPrimitive.Item,
    {
      "data-slot": "dropdown-menu-item",
      "data-inset": inset,
      "data-variant": variant,
      className: cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      ),
      ...props
    }
  );
}
function DropdownMenuLabel({
  className,
  inset,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    DropdownMenuPrimitive.Label,
    {
      "data-slot": "dropdown-menu-label",
      "data-inset": inset,
      className: cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className
      ),
      ...props
    }
  );
}
function DropdownMenuSeparator({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    DropdownMenuPrimitive.Separator,
    {
      "data-slot": "dropdown-menu-separator",
      className: cn("bg-border -mx-1 my-1 h-px", className),
      ...props
    }
  );
}
function DropdownMenuShortcut({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "span",
    {
      "data-slot": "dropdown-menu-shortcut",
      className: cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      ),
      ...props
    }
  );
}
function NavUser({
  user
}) {
  const { isMobile } = useSidebar();
  const { logout } = useAuth();
  if (!user) {
    logout();
    return;
  }
  return /* @__PURE__ */ jsx(SidebarMenu, { children: /* @__PURE__ */ jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsxs(DropdownMenu, { children: [
    /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
      SidebarMenuButton,
      {
        size: "lg",
        className: "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
        children: [
          /* @__PURE__ */ jsxs(Avatar, { className: "h-8 w-8 rounded-lg", children: [
            /* @__PURE__ */ jsx(AvatarImage, { src: user.avatar, alt: user.name }),
            /* @__PURE__ */ jsx(AvatarFallback, { className: "rounded-lg capitalize", children: user.email.split("")[0] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid flex-1 text-left text-sm leading-tight", children: [
            /* @__PURE__ */ jsx("span", { className: "truncate font-medium", children: user.name }),
            /* @__PURE__ */ jsx("span", { className: "truncate text-xs", children: user.email })
          ] }),
          /* @__PURE__ */ jsx(ChevronsUpDown, { className: "ml-auto size-4" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxs(
      DropdownMenuContent,
      {
        className: "w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg",
        side: isMobile ? "bottom" : "right",
        align: "end",
        sideOffset: 4,
        children: [
          /* @__PURE__ */ jsx(DropdownMenuLabel, { className: "p-0 font-normal", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-1 py-1.5 text-left text-sm", children: [
            /* @__PURE__ */ jsxs(Avatar, { className: "h-8 w-8 rounded-lg", children: [
              /* @__PURE__ */ jsx(AvatarImage, { src: user.avatar, alt: user.name }),
              /* @__PURE__ */ jsx(AvatarFallback, { className: "rounded-lg capitalize", children: user.email.split("")[0] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid flex-1 text-left text-sm leading-tight", children: [
              /* @__PURE__ */ jsx("span", { className: "truncate font-medium", children: user.name }),
              /* @__PURE__ */ jsx("span", { className: "truncate text-xs", children: user.email })
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
          /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: logout, children: [
            /* @__PURE__ */ jsx(LogOut, {}),
            "Log out"
          ] })
        ]
      }
    )
  ] }) }) });
}
function TeamSwitcher({
  teams: teams2
}) {
  const { isMobile } = useSidebar();
  const [activeTeam, setActiveTeam] = React.useState(teams2[0]);
  if (!activeTeam) {
    return null;
  }
  return /* @__PURE__ */ jsx(SidebarMenu, { children: /* @__PURE__ */ jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsxs(DropdownMenu, { children: [
    /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
      SidebarMenuButton,
      {
        size: "lg",
        className: "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
        children: [
          /* @__PURE__ */ jsx("div", { className: "bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg", children: /* @__PURE__ */ jsx(activeTeam.logo, { className: "size-4" }) }),
          /* @__PURE__ */ jsxs("div", { className: "grid flex-1 text-left text-sm leading-tight", children: [
            /* @__PURE__ */ jsx("span", { className: "truncate font-medium", children: activeTeam.name }),
            /* @__PURE__ */ jsx("span", { className: "truncate text-xs", children: activeTeam.plan })
          ] }),
          /* @__PURE__ */ jsx(ChevronsUpDown, { className: "ml-auto" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxs(
      DropdownMenuContent,
      {
        className: "w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg",
        align: "start",
        side: isMobile ? "bottom" : "right",
        sideOffset: 4,
        children: [
          /* @__PURE__ */ jsx(DropdownMenuLabel, { className: "text-muted-foreground text-xs", children: "Teams" }),
          teams2.map((team, index) => /* @__PURE__ */ jsxs(
            DropdownMenuItem,
            {
              onClick: () => setActiveTeam(team),
              className: "gap-2 p-2",
              children: [
                /* @__PURE__ */ jsx("div", { className: "flex size-6 items-center justify-center rounded-md border", children: /* @__PURE__ */ jsx(team.logo, { className: "size-3.5 shrink-0" }) }),
                team.name,
                /* @__PURE__ */ jsxs(DropdownMenuShortcut, { children: [
                  "⌘",
                  index + 1
                ] })
              ]
            },
            team.name
          )),
          /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
          /* @__PURE__ */ jsxs(DropdownMenuItem, { className: "gap-2 p-2", children: [
            /* @__PURE__ */ jsx("div", { className: "flex size-6 items-center justify-center rounded-md border bg-transparent", children: /* @__PURE__ */ jsx(Plus, { className: "size-4" }) }),
            /* @__PURE__ */ jsx("div", { className: "text-muted-foreground font-medium", children: "Add team" })
          ] })
        ]
      }
    )
  ] }) }) });
}
const data = {
  navMain: [
    {
      title: "Home",
      url: "/dashboard",
      icon: Home,
      isActive: true,
      showItems: false,
      items: [
        {
          title: "Overview",
          url: "overview"
        }
      ]
    },
    {
      title: "Habits",
      url: "/dashboard/habits",
      icon: Map,
      isActive: true,
      showItems: false,
      items: [
        {
          title: "Overview",
          url: "overview"
        }
      ]
    }
    // {
    //   title: "Users",
    //   url: "#",
    //   icon: Bot,
    //   items: [
    //     {
    //       title: "Compare",
    //       url: "compare",
    //     },
    //     {
    //       title: "Explore",
    //       url: "explore",
    //     },
    //   ],
    // },
    // {
    //   title: "History",
    //   url: "#",
    //   icon: BookOpen,
    //   items: [
    //     {
    //       title: "Introduction",
    //       url: "#",
    //     },
    //     {
    //       title: "Get Started",
    //       url: "#",
    //     },
    //     {
    //       title: "Tutorials",
    //       url: "#",
    //     },
    //     {
    //       title: "Changelog",
    //       url: "#",
    //     },
    //   ],
    // },
    // {
    //   title: "Settings",
    //   url: "#",
    //   icon: Settings2,
    //   items: [
    //     {
    //       title: "General",
    //       url: "general",
    //     },
    //     {
    //       title: "Team",
    //       url: "team",
    //     },
    //     {
    //       title: "Billing",
    //       url: "#",
    //     },
    //     {
    //       title: "Limits",
    //       url: "#",
    //     },
    //   ],
    // },
  ]
};
const teams = [
  {
    name: "Habit Tracker",
    logo: GalleryVerticalEnd,
    plan: "Individual"
  }
];
function AppSidebar({ ...props }) {
  const { user } = useAuth();
  return /* @__PURE__ */ jsxs(Sidebar, { collapsible: "icon", ...props, children: [
    /* @__PURE__ */ jsx(SidebarHeader, { children: /* @__PURE__ */ jsx(TeamSwitcher, { teams }) }),
    /* @__PURE__ */ jsx(SidebarContent, { children: /* @__PURE__ */ jsx(NavMain, { items: data.navMain }) }),
    /* @__PURE__ */ jsx(SidebarFooter, { children: /* @__PURE__ */ jsx(NavUser, { user }) }),
    /* @__PURE__ */ jsx(SidebarRail, {})
  ] });
}
function Breadcrumb({ ...props }) {
  return /* @__PURE__ */ jsx("nav", { "aria-label": "breadcrumb", "data-slot": "breadcrumb", ...props });
}
function BreadcrumbList({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "ol",
    {
      "data-slot": "breadcrumb-list",
      className: cn(
        "text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5",
        className
      ),
      ...props
    }
  );
}
function BreadcrumbItem({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "li",
    {
      "data-slot": "breadcrumb-item",
      className: cn("inline-flex items-center gap-1.5", className),
      ...props
    }
  );
}
function BreadcrumbPage({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "span",
    {
      "data-slot": "breadcrumb-page",
      role: "link",
      "aria-disabled": "true",
      "aria-current": "page",
      className: cn("text-foreground font-normal", className),
      ...props
    }
  );
}
const DashboardLayout = () => {
  return /* @__PURE__ */ jsxs(SidebarProvider, {
    children: [/* @__PURE__ */ jsx(AppSidebar, {}), /* @__PURE__ */ jsxs(SidebarInset, {
      className: "",
      children: [/* @__PURE__ */ jsx("header", {
        className: "flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12",
        children: /* @__PURE__ */ jsxs("div", {
          className: "flex items-center gap-2 px-4",
          children: [/* @__PURE__ */ jsx(SidebarTrigger, {
            className: "-ml-1"
          }), /* @__PURE__ */ jsx(Separator, {
            orientation: "vertical",
            className: "mr-2 data-[orientation=vertical]:h-4"
          }), /* @__PURE__ */ jsx(Breadcrumb, {
            children: /* @__PURE__ */ jsx(BreadcrumbList, {
              children: /* @__PURE__ */ jsx(BreadcrumbItem, {
                children: /* @__PURE__ */ jsx(BreadcrumbPage, {
                  children: "Dashboard"
                })
              })
            })
          })]
        })
      }), /* @__PURE__ */ jsx("div", {
        className: "relative min-h-screen",
        children: /* @__PURE__ */ jsx(Outlet, {})
      })]
    })]
  });
};
const dashboard = UNSAFE_withComponentProps(DashboardLayout);
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: dashboard
}, Symbol.toStringTag, { value: "Module" }));
const addHabit = async (habit2) => {
  const { data: data2, error } = await supabase.from("habits").upsert([habit2], { onConflict: "user_id,name" }).select();
  if (error) {
    console.error("Error inserting/updating habit:", error.message);
    throw error;
  }
  console.log("Inserted or updated habit:", data2);
};
async function getHabitsByUserId(user_id) {
  const { data: data2, error } = await supabase.from("habits").select("*").eq("user_id", user_id);
  if (error) {
    console.error("Error fetching habits:", error.message);
  }
  return data2 ?? [];
}
async function addHabitEntry(entry2) {
  const { data: data2, error } = await supabase.from("habit_entries").insert([
    {
      user_id: entry2.user_id,
      habit_id: entry2.habit_id,
      value: entry2.value,
      entry_date: entry2.entry_date,
      notes: entry2.notes ?? null
    }
  ]);
  if (error) {
    throw error;
  }
  return data2;
}
async function fetchHabitEntriesFor(userId, habitId) {
  const { data: data2, error } = await supabase.from("habit_entries").select("*").eq("user_id", userId).eq("habit_id", habitId);
  if (error) {
    console.error("Error fetching filtered habit entries:", error);
    return [];
  }
  return data2 ?? [];
}
async function deleteHabitEntries(idBatch) {
  const { data: data2, error } = await supabase.from("habit_entries").delete().in("id", idBatch);
  if (error) {
    console.error("Delete error:", error);
  } else {
    console.log("Deleted entries", data2);
  }
}
async function deleteHabits(idBatch) {
  const { data: data2, error } = await supabase.from("habits").delete().in("id", idBatch);
  if (error) {
    console.error("Delete error:", error);
  } else {
    console.log("Deleted entries", data2);
  }
}
async function fetchHabitNameById(habitId) {
  const { data: data2, error } = await supabase.rpc("get_habit_name_by_id", { habit_id: habitId }).single();
  if (error) {
    console.error("Error fetching habit name:", error.message);
    return null;
  }
  return data2;
}
function Card({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card",
      className: cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      ),
      ...props
    }
  );
}
function CardHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-header",
      className: cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      ),
      ...props
    }
  );
}
function CardTitle({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-title",
      className: cn("leading-none font-semibold", className),
      ...props
    }
  );
}
function CardDescription({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-description",
      className: cn("text-muted-foreground text-sm", className),
      ...props
    }
  );
}
function CardAction({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-action",
      className: cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      ),
      ...props
    }
  );
}
function CardContent({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-content",
      className: cn("px-6", className),
      ...props
    }
  );
}
function CardFooter({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-footer",
      className: cn("flex items-center px-6 [.border-t]:pt-6", className),
      ...props
    }
  );
}
function Label({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    LabelPrimitive.Root,
    {
      "data-slot": "label",
      className: cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      ),
      ...props
    }
  );
}
function Dialog({
  ...props
}) {
  return /* @__PURE__ */ jsx(SheetPrimitive.Root, { "data-slot": "dialog", ...props });
}
function DialogTrigger({
  ...props
}) {
  return /* @__PURE__ */ jsx(SheetPrimitive.Trigger, { "data-slot": "dialog-trigger", ...props });
}
function DialogPortal({
  ...props
}) {
  return /* @__PURE__ */ jsx(SheetPrimitive.Portal, { "data-slot": "dialog-portal", ...props });
}
function DialogClose({
  ...props
}) {
  return /* @__PURE__ */ jsx(SheetPrimitive.Close, { "data-slot": "dialog-close", ...props });
}
function DialogOverlay({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    SheetPrimitive.Overlay,
    {
      "data-slot": "dialog-overlay",
      className: cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      ),
      ...props
    }
  );
}
function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}) {
  return /* @__PURE__ */ jsxs(DialogPortal, { "data-slot": "dialog-portal", children: [
    /* @__PURE__ */ jsx(DialogOverlay, {}),
    /* @__PURE__ */ jsxs(
      SheetPrimitive.Content,
      {
        "data-slot": "dialog-content",
        className: cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        ),
        ...props,
        children: [
          children,
          showCloseButton && /* @__PURE__ */ jsxs(
            SheetPrimitive.Close,
            {
              "data-slot": "dialog-close",
              className: "ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
              children: [
                /* @__PURE__ */ jsx(XIcon, {}),
                /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
              ]
            }
          )
        ]
      }
    )
  ] });
}
function DialogHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "dialog-header",
      className: cn("flex flex-col gap-2 text-center sm:text-left", className),
      ...props
    }
  );
}
function DialogFooter({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "dialog-footer",
      className: cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      ),
      ...props
    }
  );
}
function DialogTitle({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    SheetPrimitive.Title,
    {
      "data-slot": "dialog-title",
      className: cn("text-lg leading-none font-semibold", className),
      ...props
    }
  );
}
function DialogDescription({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    SheetPrimitive.Description,
    {
      "data-slot": "dialog-description",
      className: cn("text-muted-foreground text-sm", className),
      ...props
    }
  );
}
function Command({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Command$1,
    {
      "data-slot": "command",
      className: cn(
        "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
        className
      ),
      ...props
    }
  );
}
function CommandInput({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      "data-slot": "command-input-wrapper",
      className: "flex h-9 items-center gap-2 border-b px-3",
      children: [
        /* @__PURE__ */ jsx(SearchIcon, { className: "size-4 shrink-0 opacity-50" }),
        /* @__PURE__ */ jsx(
          Command$1.Input,
          {
            "data-slot": "command-input",
            className: cn(
              "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
              className
            ),
            ...props
          }
        )
      ]
    }
  );
}
function CommandList({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Command$1.List,
    {
      "data-slot": "command-list",
      className: cn(
        "max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto",
        className
      ),
      ...props
    }
  );
}
function CommandEmpty({
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Command$1.Empty,
    {
      "data-slot": "command-empty",
      className: "py-6 text-center text-sm",
      ...props
    }
  );
}
function CommandGroup({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Command$1.Group,
    {
      "data-slot": "command-group",
      className: cn(
        "text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
        className
      ),
      ...props
    }
  );
}
function CommandItem({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Command$1.Item,
    {
      "data-slot": "command-item",
      className: cn(
        "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      ),
      ...props
    }
  );
}
function Popover({
  ...props
}) {
  return /* @__PURE__ */ jsx(PopoverPrimitive.Root, { "data-slot": "popover", ...props });
}
function PopoverTrigger({
  ...props
}) {
  return /* @__PURE__ */ jsx(PopoverPrimitive.Trigger, { "data-slot": "popover-trigger", ...props });
}
function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}) {
  return /* @__PURE__ */ jsx(PopoverPrimitive.Portal, { children: /* @__PURE__ */ jsx(
    PopoverPrimitive.Content,
    {
      "data-slot": "popover-content",
      align,
      sideOffset,
      className: cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
        className
      ),
      ...props
    }
  ) });
}
function Combobox({
  onSelect
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [data2, setData] = useState([]);
  const fetchData = async () => {
    if (!user) return;
    const res = await getHabitsByUserId(user.id);
    setData(res);
  };
  useEffect(() => {
    fetchData();
  }, []);
  return /* @__PURE__ */ jsxs(Popover, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
      Button,
      {
        variant: "outline",
        role: "combobox",
        "aria-expanded": open,
        className: "w-full justify-between",
        children: [
          value && data2 ? data2.find((habit2) => habit2.id === value)?.name : "Select habit...",
          /* @__PURE__ */ jsx(ChevronsUpDown, { className: "opacity-50" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx(PopoverContent, { className: "w-full p-0", children: /* @__PURE__ */ jsxs(Command, { children: [
      /* @__PURE__ */ jsx(CommandInput, { id: "habit", placeholder: "Search habits...", className: "h-9" }),
      /* @__PURE__ */ jsxs(CommandList, { children: [
        /* @__PURE__ */ jsx(CommandEmpty, { children: "No habit found." }),
        /* @__PURE__ */ jsx(CommandGroup, { children: data2 && data2.map((habit2) => /* @__PURE__ */ jsxs(
          CommandItem,
          {
            value: habit2.id,
            onSelect: (currentValue) => {
              setValue(currentValue === value ? "" : currentValue);
              onSelect(currentValue === value ? "" : currentValue);
              setOpen(false);
            },
            children: [
              habit2.name,
              /* @__PURE__ */ jsx(
                Check,
                {
                  className: cn(
                    "ml-auto",
                    value === habit2.id ? "opacity-100" : "opacity-0"
                  )
                }
              )
            ]
          },
          habit2.id
        )) })
      ] })
    ] }) })
  ] });
}
function AlertDialog({
  ...props
}) {
  return /* @__PURE__ */ jsx(AlertDialogPrimitive.Root, { "data-slot": "alert-dialog", ...props });
}
function AlertDialogTrigger({
  ...props
}) {
  return /* @__PURE__ */ jsx(AlertDialogPrimitive.Trigger, { "data-slot": "alert-dialog-trigger", ...props });
}
function AlertDialogPortal({
  ...props
}) {
  return /* @__PURE__ */ jsx(AlertDialogPrimitive.Portal, { "data-slot": "alert-dialog-portal", ...props });
}
function AlertDialogOverlay({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    AlertDialogPrimitive.Overlay,
    {
      "data-slot": "alert-dialog-overlay",
      className: cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      ),
      ...props
    }
  );
}
function AlertDialogContent({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxs(AlertDialogPortal, { children: [
    /* @__PURE__ */ jsx(AlertDialogOverlay, {}),
    /* @__PURE__ */ jsx(
      AlertDialogPrimitive.Content,
      {
        "data-slot": "alert-dialog-content",
        className: cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        ),
        ...props
      }
    )
  ] });
}
function AlertDialogHeader({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "alert-dialog-header",
      className: cn("flex flex-col gap-2 text-center sm:text-left", className),
      ...props
    }
  );
}
function AlertDialogFooter({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "alert-dialog-footer",
      className: cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      ),
      ...props
    }
  );
}
function AlertDialogTitle({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    AlertDialogPrimitive.Title,
    {
      "data-slot": "alert-dialog-title",
      className: cn("text-lg font-semibold", className),
      ...props
    }
  );
}
function AlertDialogDescription({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    AlertDialogPrimitive.Description,
    {
      "data-slot": "alert-dialog-description",
      className: cn("text-muted-foreground text-sm", className),
      ...props
    }
  );
}
function AlertDialogAction({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    AlertDialogPrimitive.Action,
    {
      className: cn(buttonVariants(), className),
      ...props
    }
  );
}
function AlertDialogCancel({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    AlertDialogPrimitive.Cancel,
    {
      className: cn(buttonVariants({ variant: "outline" }), className),
      ...props
    }
  );
}
function AlertDialogButton({
  buttonText,
  type = void 0,
  disabled = false,
  variant,
  dialogTitle = "Are you absolutely sure?",
  dialingDesc,
  onContinue
}) {
  return /* @__PURE__ */ jsxs(AlertDialog, { children: [
    /* @__PURE__ */ jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { disabled, variant, className: "w-full", children: buttonText }) }),
    /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsx(AlertDialogTitle, { children: dialogTitle }),
        /* @__PURE__ */ jsx(AlertDialogDescription, { children: dialingDesc })
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsx(AlertDialogAction, { onClick: () => onContinue(), children: "Continue" })
      ] })
    ] })
  ] });
}
const RollingNumberDigit = ({
  digit,
  digitHeight
}) => {
  const y = useMotionValue(0);
  useEffect(() => {
    const targetY = -digitHeight * digit;
    const controls = animate(y, targetY, {
      type: "spring",
      stiffness: 200,
      damping: 25,
      delay: 0.75
    });
    return controls.stop;
  }, [digit, y, digitHeight]);
  const digits = [...Array(20).keys()].map((i) => i % 10);
  return /* @__PURE__ */ jsx(
    "div",
    {
      style: {
        overflow: "hidden",
        height: digitHeight,
        fontWeight: "bold",
        textAlign: "center",
        userSelect: "none"
      },
      children: /* @__PURE__ */ jsx(motion.div, { style: { y }, children: digits.map((num, idx) => /* @__PURE__ */ jsx(
        "div",
        {
          className: "text-6xl",
          style: {
            height: digitHeight,
            lineHeight: `${digitHeight}px`
          },
          children: num
        },
        idx
      )) })
    }
  );
};
const RollingNumber = ({
  number,
  digitHeight = 55
}) => {
  const digits = number.toString().split("").map(Number);
  return /* @__PURE__ */ jsx("div", { className: "text-6xl", style: { display: "flex" }, children: digits.map((digit, idx) => /* @__PURE__ */ jsx(RollingNumberDigit, { digit, digitHeight }, idx)) });
};
function Empty({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "empty",
      className: cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg border-dashed p-6 text-center text-balance md:p-12",
        className
      ),
      ...props
    }
  );
}
function EmptyHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "empty-header",
      className: cn(
        "flex max-w-sm flex-col items-center gap-2 text-center",
        className
      ),
      ...props
    }
  );
}
const emptyMediaVariants = cva(
  "flex shrink-0 items-center justify-center mb-2 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-6"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function EmptyMedia({
  className,
  variant = "default",
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "empty-icon",
      "data-variant": variant,
      className: cn(emptyMediaVariants({ variant, className })),
      ...props
    }
  );
}
function EmptyTitle({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "empty-title",
      className: cn("text-lg font-medium tracking-tight", className),
      ...props
    }
  );
}
function EmptyDescription({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "empty-description",
      className: cn(
        "text-muted-foreground [&>a:hover]:text-primary text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4",
        className
      ),
      ...props
    }
  );
}
function EmptyContent({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "empty-content",
      className: cn(
        "flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance",
        className
      ),
      ...props
    }
  );
}
function EmptyHabitState() {
  return /* @__PURE__ */ jsxs(Empty, { children: [
    /* @__PURE__ */ jsxs(EmptyHeader, { children: [
      /* @__PURE__ */ jsx(EmptyMedia, { variant: "icon", children: /* @__PURE__ */ jsx(Projector, {}) }),
      /* @__PURE__ */ jsx(EmptyTitle, { children: "No Habits Yet" }),
      /* @__PURE__ */ jsx(EmptyDescription, { children: "You haven't created any habits yet. Get started by creating your first one." })
    ] }),
    /* @__PURE__ */ jsx(EmptyContent, { children: /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsx(Link, { to: "/dashboard/habits", children: /* @__PURE__ */ jsx(Button, { children: "Create Habit" }) }),
      /* @__PURE__ */ jsx(Button, { variant: "outline", disabled: true, children: "Import Habit" })
    ] }) })
  ] });
}
const fakeHabits = [{
  id: "a68f1e3f-9c4e-4a7d-b8fa-2f8dcb7a4a01",
  user_id: "43d6791c-829a-46fd-8baf-1ff73eea35e7",
  name: "Drink Water",
  description: "Drink at least 8 glasses of water daily.",
  status: "active",
  unit: "glasses",
  frequency: "daily",
  goal: 8,
  reminder_time: "08:00:00",
  is_archived: false,
  created_at: "2025-11-01T07:30:00.000Z",
  updated_at: "2025-11-15T12:00:00.000Z"
}, {
  id: "f72e3b7c-8a7f-434d-91bc-8749f789fa4d",
  user_id: "43d6791c-829a-46fd-8baf-1ff73eea35e7",
  name: "Morning Jog",
  description: null,
  status: "active",
  unit: "minutes",
  frequency: "daily",
  goal: 30,
  reminder_time: null,
  is_archived: false,
  created_at: "2025-10-25T06:00:00.000Z",
  updated_at: "2025-11-14T09:00:00.000Z"
}, {
  id: "c3f8bcf1-23a0-4174-ae29-425d6bc4c6b2",
  user_id: "7e38dbf1-012e-43de-8c92-f6517421b314",
  name: "Read Books",
  description: "Read for at least 20 minutes a day.",
  status: "inactive",
  unit: "minutes",
  frequency: "daily",
  goal: 20,
  reminder_time: "20:00:00",
  is_archived: false,
  created_at: "2025-09-10T21:00:00.000Z",
  updated_at: "2025-10-01T11:30:00.000Z"
}, {
  id: "7d120b8a-564d-44cb-9f39-70e1336cb78e",
  user_id: "7e38dbf1-012e-43de-8c92-f6517421b314",
  name: "Meditation",
  description: "Meditate daily to improve focus and reduce stress.",
  status: "active",
  unit: "minutes",
  frequency: "daily",
  goal: 15,
  reminder_time: "07:30:00",
  is_archived: false,
  created_at: "2025-11-10T06:00:00.000Z",
  updated_at: "2025-11-15T08:45:00.000Z"
}, {
  id: "6c1a7d9b-63a6-4a2b-9043-94d7e7b9c953",
  user_id: "43d6791c-829a-46fd-8baf-1ff73eea35e7",
  name: "No Sugar",
  description: "Avoid sugary snacks and drinks.",
  status: "active",
  unit: "days",
  frequency: "weekly",
  goal: 7,
  reminder_time: null,
  is_archived: true,
  created_at: "2025-08-01T10:00:00.000Z",
  updated_at: "2025-09-01T15:00:00.000Z"
}];
const home = UNSAFE_withComponentProps(function home2() {
  const {
    user
  } = useAuth();
  const [update, setUpdate] = useState(false);
  const [habit2, selectHabit] = useState("");
  const [value, selectValue] = useState(0);
  const [data2, setData] = useState([]);
  const [dailySums, setDailySums] = useState([]);
  const formRef = useRef(null);
  const today = new TZDate().toISOString().split("T")[0];
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addHabitEntry({
        user_id: user.id,
        habit_id: habit2,
        value,
        entry_date: today
      });
      setUpdate(false);
      toast.success("Successfully updated habit.");
    } catch (err) {
      console.error("Failed to add habit entry", err);
    }
  };
  const fetchHabitDailySum = async (habitId) => {
    if (!user) return;
    const {
      data: data22,
      error
    } = await supabase.rpc("get_daily_habit_sum", {
      p_user_id: user.id,
      p_habit_id: habitId,
      p_date: today
    });
    if (error) {
      console.error("RPC call failed:", error);
      return 0;
    }
    return data22;
  };
  const fetchAllSums = async (res) => {
    if (!res) return;
    const sums = await Promise.all(res.map((habit22) => fetchHabitDailySum(habit22.id)));
    const dailySums2 = res.map((habit22, idx) => ({
      id: habit22.id,
      value: sums[idx]
    }));
    setDailySums(dailySums2);
  };
  const fetchData = async () => {
    if (!user) return;
    const res = await getHabitsByUserId(user.id);
    setData(res);
    fetchAllSums(res);
  };
  const setDate = (habitDate) => {
    const date = new TZDate(habitDate);
    return date.toLocaleString();
  };
  useEffect(() => {
    fetchData();
  }, [user, update]);
  return /* @__PURE__ */ jsxs("div", {
    className: "relative h-full flex flex-1 flex-col gap-4 p-4 pt-0 ",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "md:min-h-min",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "space-y-1",
        children: [/* @__PURE__ */ jsx("h4", {
          className: "text-sm leading-none font-medium",
          children: "Home"
        }), /* @__PURE__ */ jsx("p", {
          className: "text-muted-foreground text-sm",
          children: "View your habits and daily activity."
        })]
      }), /* @__PURE__ */ jsx(Separator, {
        className: "my-4"
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "w-full flex justify-end gap-2",
      children: [/* @__PURE__ */ jsx(Link, {
        to: "habits",
        children: /* @__PURE__ */ jsxs(Button, {
          size: "sm",
          children: [/* @__PURE__ */ jsx(Map, {}), "Habits"]
        })
      }), /* @__PURE__ */ jsxs(Button, {
        disabled: data2?.length === 0,
        size: "sm",
        onClick: () => setUpdate(!update),
        children: [/* @__PURE__ */ jsx(Plus, {}), "Update"]
      })]
    }), update && /* @__PURE__ */ jsx(motion.div, {
      initial: {
        opacity: 0,
        scale: 0
      },
      animate: {
        opacity: 1,
        scale: 1
      },
      exit: {
        opacity: 0,
        scale: 0.95
      },
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      },
      className: "bg-slate-300/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min",
      children: /* @__PURE__ */ jsxs(Card, {
        className: "w-full h-full",
        children: [/* @__PURE__ */ jsxs(CardHeader, {
          children: [/* @__PURE__ */ jsx(CardTitle, {
            children: "Update your habits"
          }), /* @__PURE__ */ jsx(CardDescription, {
            children: "Select your habit and new score below. Hit save to complete the process."
          })]
        }), /* @__PURE__ */ jsx(CardContent$1, {
          children: /* @__PURE__ */ jsx("form", {
            ref: formRef,
            onSubmit: handleSubmit,
            children: /* @__PURE__ */ jsxs("div", {
              className: "flex flex-col gap-6",
              children: [/* @__PURE__ */ jsxs("div", {
                className: "grid gap-2",
                children: [/* @__PURE__ */ jsx(Label, {
                  htmlFor: "habit",
                  children: "Your Habits"
                }), /* @__PURE__ */ jsx("div", {
                  className: "relative w-full",
                  children: /* @__PURE__ */ jsx(Combobox, {
                    onSelect: selectHabit
                  })
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: "grid gap-2",
                children: [/* @__PURE__ */ jsx("div", {
                  className: "flex items-center",
                  children: /* @__PURE__ */ jsx(Label, {
                    htmlFor: "value",
                    children: "How many units did you complete today?"
                  })
                }), /* @__PURE__ */ jsx(Input, {
                  id: "value",
                  type: "number",
                  min: 0,
                  onChange: (e) => selectValue(Number(e.target.value) ?? 0),
                  required: true
                })]
              })]
            })
          })
        }), /* @__PURE__ */ jsxs(CardFooter, {
          className: "flex-col gap-2",
          children: [/* @__PURE__ */ jsx(AlertDialogButton, {
            buttonText: "Update",
            type: "submit",
            onContinue: () => formRef && formRef.current?.requestSubmit(),
            dialingDesc: "Performing this cannot be undone."
          }), /* @__PURE__ */ jsx(Button, {
            variant: "outline",
            className: "w-full",
            onClick: () => setUpdate(false),
            children: "Cancel"
          })]
        })]
      })
    }), /* @__PURE__ */ jsx("div", {
      className: "",
      children: data2 && data2.length > 0 ? /* @__PURE__ */ jsx("div", {
        className: "grid auto-rows-min gap-4 md:grid-cols-3",
        children: data2.map((habit22, index) => /* @__PURE__ */ jsx("div", {
          className: "bg-slate-300/50 aspect-auto rounded-xl overflow-hidden",
          children: /* @__PURE__ */ jsxs(Card, {
            className: "relative capitalize",
            children: [/* @__PURE__ */ jsxs(CardHeader, {
              children: [/* @__PURE__ */ jsx(CardTitle, {
                children: "Habit"
              }), /* @__PURE__ */ jsx(CardDescription, {
                children: habit22.name
              }), /* @__PURE__ */ jsx(CardAction, {
                children: /* @__PURE__ */ jsx(Link, {
                  to: `habits/${habit22.id}`,
                  children: /* @__PURE__ */ jsx(Button, {
                    variant: "outline",
                    children: /* @__PURE__ */ jsx(Forward, {})
                  })
                })
              })]
            }), /* @__PURE__ */ jsxs(CardContent$1, {
              className: "flex flex-col gap-8",
              children: [/* @__PURE__ */ jsxs("div", {
                className: "flex flex-wrap justify-center items-baseline",
                children: [/* @__PURE__ */ jsxs("div", {
                  className: "flex flex-wrap items-start gap-2",
                  children: [/* @__PURE__ */ jsx("h1", {
                    className: "max-w-xs",
                    children: dailySums.length === data2.length && /* @__PURE__ */ jsx(RollingNumber, {
                      number: dailySums.find((s) => s.id === habit22.id)?.value ?? 0
                    })
                  }), /* @__PURE__ */ jsx("span", {
                    children: habit22.unit
                  })]
                }), /* @__PURE__ */ jsx("div", {
                  children: /* @__PURE__ */ jsxs("span", {
                    className: "text-muted-foreground text-sm",
                    children: ["/ ", habit22.goal, " ", habit22.unit]
                  })
                })]
              }), /* @__PURE__ */ jsx(Separator, {})]
            }), /* @__PURE__ */ jsxs(CardFooter, {
              className: "flex flex-col gap-2 items-center",
              children: [/* @__PURE__ */ jsxs("div", {
                className: "flex flex-col md:flex-row justify-between items-center w-full",
                children: [/* @__PURE__ */ jsxs(Button, {
                  variant: "ghost",
                  children: [/* @__PURE__ */ jsx(Waves, {}), "Frequency"]
                }), /* @__PURE__ */ jsx("span", {
                  children: habit22.frequency
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: "flex flex-col md:flex-row justify-between items-center w-full",
                children: [/* @__PURE__ */ jsxs(Button, {
                  variant: "ghost",
                  children: [/* @__PURE__ */ jsx(Goal, {}), "Goal"]
                }), /* @__PURE__ */ jsxs("span", {
                  children: [habit22.goal, " ", habit22.unit]
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: "flex flex-col md:flex-row justify-between items-center w-full",
                children: [/* @__PURE__ */ jsxs(Button, {
                  variant: "ghost",
                  children: [/* @__PURE__ */ jsx(Timer, {}), "Last Updated"]
                }), /* @__PURE__ */ jsx("span", {
                  children: setDate(habit22.updated_at)
                })]
              })]
            })]
          })
        }, index))
      }) : /* @__PURE__ */ jsx(EmptyHabitState, {})
    })]
  });
});
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: home,
  fakeHabits
}, Symbol.toStringTag, { value: "Module" }));
const layout$1 = () => {
  return /* @__PURE__ */ jsxs("div", {
    className: "relative flex flex-1 flex-col gap-4 p-4 pt-0 h-full",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "md:min-h-min",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "space-y-1",
        children: [/* @__PURE__ */ jsx("h4", {
          className: "text-sm leading-none font-medium",
          children: "Habits"
        }), /* @__PURE__ */ jsx("p", {
          className: "text-muted-foreground text-sm",
          children: "View activities and charts."
        })]
      }), /* @__PURE__ */ jsx(Separator, {
        className: "my-4"
      })]
    }), /* @__PURE__ */ jsx(Outlet, {})]
  });
};
const layout_default = UNSAFE_withComponentProps(layout$1);
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: layout_default
}, Symbol.toStringTag, { value: "Module" }));
function Checkbox({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    CheckboxPrimitive.Root,
    {
      "data-slot": "checkbox",
      className: cn(
        "peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx(
        CheckboxPrimitive.Indicator,
        {
          "data-slot": "checkbox-indicator",
          className: "grid place-content-center text-current transition-none",
          children: /* @__PURE__ */ jsx(CheckIcon, { className: "size-3.5" })
        }
      )
    }
  );
}
function Table({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "table-container",
      className: "relative w-full overflow-x-auto",
      children: /* @__PURE__ */ jsx(
        "table",
        {
          "data-slot": "table",
          className: cn("w-full caption-bottom text-sm", className),
          ...props
        }
      )
    }
  );
}
function TableHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "thead",
    {
      "data-slot": "table-header",
      className: cn("[&_tr]:border-b", className),
      ...props
    }
  );
}
function TableBody({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "tbody",
    {
      "data-slot": "table-body",
      className: cn("[&_tr:last-child]:border-0", className),
      ...props
    }
  );
}
function TableRow({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "tr",
    {
      "data-slot": "table-row",
      className: cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className
      ),
      ...props
    }
  );
}
function TableHead({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "th",
    {
      "data-slot": "table-head",
      className: cn(
        "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      ),
      ...props
    }
  );
}
function TableCell({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "td",
    {
      "data-slot": "table-cell",
      className: cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      ),
      ...props
    }
  );
}
function FieldSet({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "fieldset",
    {
      "data-slot": "field-set",
      className: cn(
        "flex flex-col gap-6",
        "has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3",
        className
      ),
      ...props
    }
  );
}
function FieldGroup({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "field-group",
      className: cn(
        "group/field-group @container/field-group flex w-full flex-col gap-7 data-[slot=checkbox-group]:gap-3 [&>[data-slot=field-group]]:gap-4",
        className
      ),
      ...props
    }
  );
}
const fieldVariants = cva(
  "group/field flex w-full gap-3 data-[invalid=true]:text-destructive",
  {
    variants: {
      orientation: {
        vertical: ["flex-col [&>*]:w-full [&>.sr-only]:w-auto"],
        horizontal: [
          "flex-row items-center",
          "[&>[data-slot=field-label]]:flex-auto",
          "has-[>[data-slot=field-content]]:items-start has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px"
        ],
        responsive: [
          "flex-col [&>*]:w-full [&>.sr-only]:w-auto @md/field-group:flex-row @md/field-group:items-center @md/field-group:[&>*]:w-auto",
          "@md/field-group:[&>[data-slot=field-label]]:flex-auto",
          "@md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px"
        ]
      }
    },
    defaultVariants: {
      orientation: "vertical"
    }
  }
);
function Field({
  className,
  orientation = "vertical",
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      role: "group",
      "data-slot": "field",
      "data-orientation": orientation,
      className: cn(fieldVariants({ orientation }), className),
      ...props
    }
  );
}
function FieldLabel({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Label,
    {
      "data-slot": "field-label",
      className: cn(
        "group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border [&>*]:data-[slot=field]:p-4",
        "has-data-[state=checked]:bg-primary/5 has-data-[state=checked]:border-primary dark:has-data-[state=checked]:bg-primary/10",
        className
      ),
      ...props
    }
  );
}
function FieldDescription({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "p",
    {
      "data-slot": "field-description",
      className: cn(
        "text-muted-foreground text-sm leading-normal font-normal group-has-[[data-orientation=horizontal]]/field:text-balance",
        "last:mt-0 nth-last-2:-mt-1 [[data-variant=legend]+&]:-mt-1.5",
        "[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4",
        className
      ),
      ...props
    }
  );
}
function RadioGroup({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    RadioGroupPrimitive.Root,
    {
      "data-slot": "radio-group",
      className: cn("grid gap-3", className),
      ...props
    }
  );
}
function RadioGroupItem({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    RadioGroupPrimitive.Item,
    {
      "data-slot": "radio-group-item",
      className: cn(
        "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx(
        RadioGroupPrimitive.Indicator,
        {
          "data-slot": "radio-group-indicator",
          className: "relative flex items-center justify-center",
          children: /* @__PURE__ */ jsx(CircleIcon, { className: "fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" })
        }
      )
    }
  );
}
function Textarea({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "textarea",
    {
      "data-slot": "textarea",
      className: cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      ),
      ...props
    }
  );
}
const formTemplate = {
  name: "ex. drink more water",
  description: "Optionally include a brief description...",
  status: "active",
  unit: "unit",
  frequency: "daily",
  goal: 0,
  reminder_time: null,
  is_archived: false
};
function HabitModalButton({ isOpen, open, setHabits }) {
  const { user } = useAuth();
  const [form, setForm] = useState(formTemplate);
  const handleFrequencyChange = (value) => {
    setForm((prev) => ({
      ...prev,
      frequency: value
    }));
  };
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "goal" ? Number(value) : value
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (form === formTemplate) return;
    const today = new TZDate().toISOString().split("T")[0];
    try {
      await addHabit({
        user_id: user.id,
        name: form.name,
        description: form.description === "Optionally include a brief description..." ? "" : form.description,
        status: "active",
        unit: form.unit,
        frequency: form.frequency,
        goal: form.goal,
        reminder_time: null,
        is_archived: false
      });
      setHabits((prev) => [...prev, { ...form, created_at: today }]);
      isOpen(false);
      toast.success("Successfully added a new habit.");
    } catch {
      toast.error("Failed to create.");
    }
  };
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(Dialog, { open, onOpenChange: isOpen, children: /* @__PURE__ */ jsxs("form", { children: [
    /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { variant: "outline", children: [
      /* @__PURE__ */ jsx(Plus, {}),
      " Habit"
    ] }) }),
    /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-[425px]", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: "Create a new Habit." }),
        /* @__PURE__ */ jsx(DialogDescription, { children: "Fill out the form here. Click create when you're done." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "w-full max-w-md", children: /* @__PURE__ */ jsx(FieldSet, { children: /* @__PURE__ */ jsxs(FieldGroup, { children: [
        /* @__PURE__ */ jsxs(Field, { children: [
          /* @__PURE__ */ jsx(FieldLabel, { htmlFor: "name", children: "Habit Name" }),
          /* @__PURE__ */ jsx(Input, { id: "name", name: "name", type: "text", placeholder: "ex. drink more water", onChange: handleChange, required: true }),
          /* @__PURE__ */ jsx(FieldDescription, { children: "Choose the name of your new habit." })
        ] }),
        /* @__PURE__ */ jsxs(Field, { children: [
          /* @__PURE__ */ jsx(FieldLabel, { htmlFor: "feedback", children: "Description" }),
          /* @__PURE__ */ jsx(
            Textarea,
            {
              id: "description",
              name: "description",
              placeholder: "Optionally include a brief description...",
              rows: 4,
              onChange: handleChange
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(FieldSet, { children: [
          /* @__PURE__ */ jsx(FieldLabel, { children: "Frequency Plan" }),
          /* @__PURE__ */ jsx(FieldDescription, { children: "Select how frequent you plan to perform this habit." }),
          /* @__PURE__ */ jsxs(RadioGroup, { name: "frequency", defaultValue: "daily", onValueChange: handleFrequencyChange, required: true, children: [
            /* @__PURE__ */ jsxs(Field, { orientation: "horizontal", children: [
              /* @__PURE__ */ jsx(RadioGroupItem, { value: "daily", id: "plan-daily" }),
              /* @__PURE__ */ jsx(FieldLabel, { htmlFor: "plan-daily", className: "font-normal", children: "Daily" })
            ] }),
            /* @__PURE__ */ jsxs(Field, { orientation: "horizontal", children: [
              /* @__PURE__ */ jsx(RadioGroupItem, { value: "weekly", id: "plan-weekly" }),
              /* @__PURE__ */ jsx(FieldLabel, { htmlFor: "plan-weekly", className: "font-normal", children: "Weekly" })
            ] }),
            /* @__PURE__ */ jsxs(Field, { orientation: "horizontal", children: [
              /* @__PURE__ */ jsx(RadioGroupItem, { value: "monthly", id: "plan-monthly" }),
              /* @__PURE__ */ jsx(FieldLabel, { htmlFor: "plan-monthly", className: "font-normal", children: "Monthly" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs(Field, { children: [
            /* @__PURE__ */ jsx(FieldLabel, { htmlFor: "city", children: "Frequency Goal" }),
            /* @__PURE__ */ jsx(Input, { id: "goal", name: "goal", type: "number", min: 0, placeholder: "0", onChange: handleChange, required: true })
          ] }),
          /* @__PURE__ */ jsxs(Field, { children: [
            /* @__PURE__ */ jsx(FieldLabel, { htmlFor: "unit", children: "Unit To Measure" }),
            /* @__PURE__ */ jsx(Input, { id: "unit", name: "unit", type: "text", placeholder: "ex. ounces or oz", onChange: handleChange, required: true })
          ] })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsx(DialogClose, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "outline", children: "Cancel" }) }),
        /* @__PURE__ */ jsx(Button, { type: "submit", onClick: handleSubmit, children: "Create Habit" })
      ] })
    ] })
  ] }) }) });
}
async function clientLoader$1() {
  const {
    data: {
      user
    }
  } = await supabase.auth.getUser();
  if (!user) return;
  const habits = await getHabitsByUserId(user.id);
  return habits;
}
const columns$1 = [
  {
    id: "select",
    header: ({
      table
    }) => /* @__PURE__ */ jsx(Checkbox, {
      checked: table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected() && "indeterminate",
      onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
      "aria-label": "Select all"
    }),
    cell: ({
      row
    }) => /* @__PURE__ */ jsx(Checkbox, {
      checked: row.getIsSelected(),
      onCheckedChange: (value) => {
        row.toggleSelected(!!value);
      },
      "aria-label": "Select row"
    }),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({
      row
    }) => /* @__PURE__ */ jsx("div", {
      className: "capitalize",
      children: row.getValue("name")
    })
  },
  {
    accessorKey: "goal",
    header: "Frequency Goal",
    cell: ({
      row
    }) => /* @__PURE__ */ jsx("div", {
      className: "capitalize",
      children: row.getValue("goal")
    })
  },
  {
    accessorKey: "frequency",
    header: "Frequency",
    cell: ({
      row
    }) => /* @__PURE__ */ jsx("div", {
      className: "capitalize",
      children: row.getValue("frequency")
    })
  },
  //   {
  //     accessorKey: "value",
  //     header: ({ column }) => {
  //       return (
  //         <Button
  //           variant="ghost"
  //           onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
  //         >
  //           Amount
  //           <ArrowUpDown />
  //         </Button>
  //       )
  //     },
  //     cell: ({ row }) => <div className="lowercase pl-8">{row.getValue("value")}</div>,
  //   },
  {
    accessorKey: "unit",
    header: () => /* @__PURE__ */ jsx("div", {
      className: "capitalize",
      children: "Unit Type"
    }),
    cell: ({
      row
    }) => {
      return /* @__PURE__ */ jsx("div", {
        className: " font-semibold text-slate-500",
        children: row.getValue("unit")
      });
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({
      row
    }) => /* @__PURE__ */ jsx("div", {
      className: "capitalize",
      children: row.getValue("status")
    })
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({
      row
    }) => {
      const date = new TZDate(row.getValue("created_at")).toISOString().split("T")[0];
      return /* @__PURE__ */ jsx("div", {
        className: "capitalize",
        children: date
      });
    }
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({
      row
    }) => {
      const entry2 = row.original;
      return /* @__PURE__ */ jsxs(DropdownMenu, {
        children: [/* @__PURE__ */ jsx(DropdownMenuTrigger, {
          asChild: true,
          children: /* @__PURE__ */ jsxs(Button, {
            variant: "ghost",
            className: "h-8 w-8 p-0",
            children: [/* @__PURE__ */ jsx("span", {
              className: "sr-only",
              children: "Open menu"
            }), /* @__PURE__ */ jsx(MoreHorizontal, {})]
          })
        }), /* @__PURE__ */ jsxs(DropdownMenuContent, {
          align: "end",
          children: [/* @__PURE__ */ jsx(DropdownMenuLabel, {
            children: "Actions"
          }), /* @__PURE__ */ jsx(DropdownMenuItem, {
            onClick: () => navigator.clipboard.writeText(entry2.id),
            children: "Copy Entry ID"
          }), /* @__PURE__ */ jsx(DropdownMenuSeparator, {})]
        })]
      });
    }
  }
];
const overview = ({
  loaderData
}) => {
  const {
    user
  } = useAuth();
  const [open, isOpen] = useState(false);
  const [habits, setHabits] = useState(loaderData);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const table = useReactTable({
    data: habits,
    columns: columns$1,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection
    }
  });
  const handleBatchDelete = async () => {
    if (!user) return;
    const idBatch = table.getFilteredSelectedRowModel().rows.map((row) => row.original.id);
    await deleteHabits(idBatch);
    setHabits((prevHabits) => prevHabits.filter((e) => !idBatch.find((id) => id === e.id)));
    setRowSelection({});
    toast.success("Habit(s) deleted");
  };
  useEffect(() => {
    if (habits.length === 0) {
      isOpen(true);
    }
  }, []);
  return /* @__PURE__ */ jsxs("div", {
    className: "w-full",
    children: [/* @__PURE__ */ jsx("div", {
      className: "flex items-center py-4",
      children: /* @__PURE__ */ jsxs("div", {
        className: "flex ml-auto gap-2 w-full max-w-sm ",
        children: [/* @__PURE__ */ jsx("div", {
          className: "w-full",
          children: /* @__PURE__ */ jsx(AlertDialogButton, {
            onContinue: handleBatchDelete,
            variant: table.getFilteredSelectedRowModel().rows.length > 0 ? "destructive" : "outline",
            disabled: table.getFilteredSelectedRowModel().rows.length <= 0,
            dialingDesc: "Action cannot be undone.",
            buttonText: `Delete ${table.getFilteredSelectedRowModel().rows.length > 0 ? `Batch (${table.getFilteredSelectedRowModel().rows.length} rows)` : ""}`
          })
        }), /* @__PURE__ */ jsx(HabitModalButton, {
          open,
          isOpen,
          setHabits
        })]
      })
    }), /* @__PURE__ */ jsx("div", {
      className: "overflow-hidden rounded-md border",
      children: /* @__PURE__ */ jsxs(Table, {
        children: [/* @__PURE__ */ jsx(TableHeader, {
          children: table.getHeaderGroups().map((headerGroup) => /* @__PURE__ */ jsx(TableRow, {
            children: headerGroup.headers.map((header) => {
              return /* @__PURE__ */ jsx(TableHead, {
                children: header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())
              }, header.id);
            })
          }, headerGroup.id))
        }), /* @__PURE__ */ jsx(TableBody, {
          children: table.getRowModel().rows?.length ? table.getRowModel().rows.map((row) => /* @__PURE__ */ jsx(TableRow, {
            "data-state": row.getIsSelected() && "selected",
            children: row.getVisibleCells().map((cell) => /* @__PURE__ */ jsx(TableCell, {
              children: flexRender(cell.column.columnDef.cell, cell.getContext())
            }, cell.id))
          }, row.id)) : /* @__PURE__ */ jsx(TableRow, {
            children: /* @__PURE__ */ jsx(TableCell, {
              colSpan: columns$1.length,
              className: "h-24 text-center",
              children: "No results."
            })
          })
        })]
      })
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex items-center justify-end space-x-2 py-4",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "text-muted-foreground flex-1 text-sm",
        children: [table.getFilteredSelectedRowModel().rows.length, " of", " ", table.getFilteredRowModel().rows.length, " row(s) selected."]
      }), /* @__PURE__ */ jsxs("div", {
        className: "space-x-2",
        children: [/* @__PURE__ */ jsx(Button, {
          variant: "outline",
          size: "sm",
          onClick: () => table.previousPage(),
          disabled: !table.getCanPreviousPage(),
          children: "Previous"
        }), /* @__PURE__ */ jsx(Button, {
          variant: "outline",
          size: "sm",
          onClick: () => table.nextPage(),
          disabled: !table.getCanNextPage(),
          children: "Next"
        })]
      })]
    })]
  });
};
const overview_default = UNSAFE_withComponentProps(overview);
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  clientLoader: clientLoader$1,
  default: overview_default
}, Symbol.toStringTag, { value: "Module" }));
const THEMES = { light: "", dark: ".dark" };
const ChartContext = React.createContext(null);
function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}
function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;
  return /* @__PURE__ */ jsx(ChartContext.Provider, { value: { config }, children: /* @__PURE__ */ jsxs(
    "div",
    {
      "data-slot": "chart",
      "data-chart": chartId,
      className: cn(
        "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
        className
      ),
      ...props,
      children: [
        /* @__PURE__ */ jsx(ChartStyle, { id: chartId, config }),
        /* @__PURE__ */ jsx(RechartsPrimitive.ResponsiveContainer, { children })
      ]
    }
  ) });
}
const ChartStyle = ({ id, config }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config2]) => config2.theme || config2.color
  );
  if (!colorConfig.length) {
    return null;
  }
  return /* @__PURE__ */ jsx(
    "style",
    {
      dangerouslySetInnerHTML: {
        __html: Object.entries(THEMES).map(
          ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig.map(([key, itemConfig]) => {
            const color = itemConfig.theme?.[theme] || itemConfig.color;
            return color ? `  --color-${key}: ${color};` : null;
          }).join("\n")}
}
`
        ).join("\n")
      }
    }
  );
};
const ChartTooltip = RechartsPrimitive.Tooltip;
function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey
}) {
  const { config } = useChart();
  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null;
    }
    const [item] = payload;
    const key = `${labelKey || item?.dataKey || item?.name || "value"}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value = !labelKey && typeof label === "string" ? config[label]?.label || label : itemConfig?.label;
    if (labelFormatter) {
      return /* @__PURE__ */ jsx("div", { className: cn("font-medium", labelClassName), children: labelFormatter(value, payload) });
    }
    if (!value) {
      return null;
    }
    return /* @__PURE__ */ jsx("div", { className: cn("font-medium", labelClassName), children: value });
  }, [
    label,
    labelFormatter,
    payload,
    hideLabel,
    labelClassName,
    config,
    labelKey
  ]);
  if (!active || !payload?.length) {
    return null;
  }
  const nestLabel = payload.length === 1 && indicator !== "dot";
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
        className
      ),
      children: [
        !nestLabel ? tooltipLabel : null,
        /* @__PURE__ */ jsx("div", { className: "grid gap-1.5", children: payload.filter((item) => item.type !== "none").map((item, index) => {
          const key = `${nameKey || item.name || item.dataKey || "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          const indicatorColor = color || item.payload.fill || item.color;
          return /* @__PURE__ */ jsx(
            "div",
            {
              className: cn(
                "[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5",
                indicator === "dot" && "items-center"
              ),
              children: formatter && item?.value !== void 0 && item.name ? formatter(item.value, item.name, item, index, item.payload) : /* @__PURE__ */ jsxs(Fragment, { children: [
                itemConfig?.icon ? /* @__PURE__ */ jsx(itemConfig.icon, {}) : !hideIndicator && /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: cn(
                      "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
                      {
                        "h-2.5 w-2.5": indicator === "dot",
                        "w-1": indicator === "line",
                        "w-0 border-[1.5px] border-dashed bg-transparent": indicator === "dashed",
                        "my-0.5": nestLabel && indicator === "dashed"
                      }
                    ),
                    style: {
                      "--color-bg": indicatorColor,
                      "--color-border": indicatorColor
                    }
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "div",
                  {
                    className: cn(
                      "flex flex-1 justify-between leading-none",
                      nestLabel ? "items-end" : "items-center"
                    ),
                    children: [
                      /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5", children: [
                        nestLabel ? tooltipLabel : null,
                        /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: itemConfig?.label || item.name })
                      ] }),
                      item.value && /* @__PURE__ */ jsx("span", { className: "text-foreground font-mono font-medium tabular-nums", children: item.value.toLocaleString() })
                    ]
                  }
                )
              ] })
            },
            item.dataKey
          );
        }) })
      ]
    }
  );
}
const ChartLegend = RechartsPrimitive.Legend;
function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey
}) {
  const { config } = useChart();
  if (!payload?.length) {
    return null;
  }
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      ),
      children: payload.filter((item) => item.type !== "none").map((item) => {
        const key = `${nameKey || item.dataKey || "value"}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: cn(
              "[&>svg]:text-muted-foreground flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3"
            ),
            children: [
              itemConfig?.icon && !hideIcon ? /* @__PURE__ */ jsx(itemConfig.icon, {}) : /* @__PURE__ */ jsx(
                "div",
                {
                  className: "h-2 w-2 shrink-0 rounded-[2px]",
                  style: {
                    backgroundColor: item.color
                  }
                }
              ),
              itemConfig?.label
            ]
          },
          item.value
        );
      })
    }
  );
}
function getPayloadConfigFromPayload(config, payload, key) {
  if (typeof payload !== "object" || payload === null) {
    return void 0;
  }
  const payloadPayload = "payload" in payload && typeof payload.payload === "object" && payload.payload !== null ? payload.payload : void 0;
  let configLabelKey = key;
  if (key in payload && typeof payload[key] === "string") {
    configLabelKey = payload[key];
  } else if (payloadPayload && key in payloadPayload && typeof payloadPayload[key] === "string") {
    configLabelKey = payloadPayload[key];
  }
  return configLabelKey in config ? config[configLabelKey] : config[key];
}
function Select({
  ...props
}) {
  return /* @__PURE__ */ jsx(SelectPrimitive.Root, { "data-slot": "select", ...props });
}
function SelectValue({
  ...props
}) {
  return /* @__PURE__ */ jsx(SelectPrimitive.Value, { "data-slot": "select-value", ...props });
}
function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxs(
    SelectPrimitive.Trigger,
    {
      "data-slot": "select-trigger",
      "data-size": size,
      className: cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsx(SelectPrimitive.Icon, { asChild: true, children: /* @__PURE__ */ jsx(ChevronDownIcon, { className: "size-4 opacity-50" }) })
      ]
    }
  );
}
function SelectContent({
  className,
  children,
  position = "popper",
  align = "center",
  ...props
}) {
  return /* @__PURE__ */ jsx(SelectPrimitive.Portal, { children: /* @__PURE__ */ jsxs(
    SelectPrimitive.Content,
    {
      "data-slot": "select-content",
      className: cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
        position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      ),
      position,
      align,
      ...props,
      children: [
        /* @__PURE__ */ jsx(SelectScrollUpButton, {}),
        /* @__PURE__ */ jsx(
          SelectPrimitive.Viewport,
          {
            className: cn(
              "p-1",
              position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
            ),
            children
          }
        ),
        /* @__PURE__ */ jsx(SelectScrollDownButton, {})
      ]
    }
  ) });
}
function SelectItem({
  className,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxs(
    SelectPrimitive.Item,
    {
      "data-slot": "select-item",
      className: cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      ),
      ...props,
      children: [
        /* @__PURE__ */ jsx("span", { className: "absolute right-2 flex size-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(SelectPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(CheckIcon, { className: "size-4" }) }) }),
        /* @__PURE__ */ jsx(SelectPrimitive.ItemText, { children })
      ]
    }
  );
}
function SelectScrollUpButton({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    SelectPrimitive.ScrollUpButton,
    {
      "data-slot": "select-scroll-up-button",
      className: cn(
        "flex cursor-default items-center justify-center py-1",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx(ChevronUpIcon, { className: "size-4" })
    }
  );
}
function SelectScrollDownButton({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    SelectPrimitive.ScrollDownButton,
    {
      "data-slot": "select-scroll-down-button",
      className: cn(
        "flex cursor-default items-center justify-center py-1",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx(ChevronDownIcon, { className: "size-4" })
    }
  );
}
const chartConfig = {
  habit: {
    label: "Habit"
  },
  value: {
    label: "Amount",
    color: "var(--chart-1)"
  }
  // mobile: {
  //   label: "Mobile",
  //   color: "var(--chart-2)",
  // },
};
function ChartAreaInteractive({ chartData }) {
  const [timeRange, setTimeRange] = useState("90d");
  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date(chartData[chartData.length - 1].date);
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });
  return /* @__PURE__ */ jsxs(Card, { className: "pt-0", children: [
    /* @__PURE__ */ jsxs(CardHeader, { className: "flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid flex-1 gap-1", children: [
        /* @__PURE__ */ jsx(CardTitle, { children: "Area Chart - Interactive" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Showing total habit for the last 3 months" })
      ] }),
      /* @__PURE__ */ jsxs(Select, { value: timeRange, onValueChange: setTimeRange, children: [
        /* @__PURE__ */ jsx(
          SelectTrigger,
          {
            className: "hidden w-[160px] rounded-lg sm:ml-auto sm:flex",
            "aria-label": "Select a value",
            children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Last 3 months" })
          }
        ),
        /* @__PURE__ */ jsxs(SelectContent, { className: "rounded-xl", children: [
          /* @__PURE__ */ jsx(SelectItem, { value: "90d", className: "rounded-lg", children: "Last 3 months" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "30d", className: "rounded-lg", children: "Last 30 days" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "7d", className: "rounded-lg", children: "Last 7 days" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(CardContent, { className: "px-2 pt-4 sm:px-6 sm:pt-6", children: /* @__PURE__ */ jsx(
      ChartContainer,
      {
        config: chartConfig,
        className: "aspect-auto h-[250px] w-full",
        children: /* @__PURE__ */ jsxs(AreaChart, { data: filteredData, children: [
          /* @__PURE__ */ jsxs("defs", { children: [
            /* @__PURE__ */ jsxs("linearGradient", { id: "fillValue", x1: "0", y1: "0", x2: "0", y2: "1", children: [
              /* @__PURE__ */ jsx(
                "stop",
                {
                  offset: "5%",
                  stopColor: "var(--color-value)",
                  stopOpacity: 0.8
                }
              ),
              /* @__PURE__ */ jsx(
                "stop",
                {
                  offset: "95%",
                  stopColor: "var(--color-value)",
                  stopOpacity: 0.1
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("linearGradient", { id: "fillUnknown", x1: "0", y1: "0", x2: "0", y2: "1", children: [
              /* @__PURE__ */ jsx(
                "stop",
                {
                  offset: "5%",
                  stopColor: "var(--color-mobile)",
                  stopOpacity: 0.8
                }
              ),
              /* @__PURE__ */ jsx(
                "stop",
                {
                  offset: "95%",
                  stopColor: "var(--color-mobile)",
                  stopOpacity: 0.1
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx(CartesianGrid, { vertical: false }),
          /* @__PURE__ */ jsx(
            XAxis,
            {
              dataKey: "date",
              tickLine: false,
              axisLine: false,
              tickMargin: 8,
              minTickGap: 32,
              tickFormatter: (value) => {
                const [year, month, day] = value.split("-");
                const date = new Date(Number(year), Number(month) - 1, Number(day));
                return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
              }
            }
          ),
          /* @__PURE__ */ jsx(
            ChartTooltip,
            {
              cursor: false,
              content: /* @__PURE__ */ jsx(
                ChartTooltipContent,
                {
                  labelFormatter: (value) => {
                    const [year, month, day] = value.split("-");
                    const date = new Date(Number(year), Number(month) - 1, Number(day));
                    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  },
                  indicator: "dot"
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            Area,
            {
              dataKey: "unknown",
              type: "natural",
              fill: "url(#fillUnknown)",
              stroke: "var(--color-mobile)",
              stackId: "a"
            }
          ),
          /* @__PURE__ */ jsx(
            Area,
            {
              dataKey: "value",
              type: "natural",
              fill: "url(#fillDesktop)",
              stroke: "var(--color-value)",
              stackId: "a"
            }
          ),
          /* @__PURE__ */ jsx(ChartLegend, { content: /* @__PURE__ */ jsx(ChartLegendContent, {}) })
        ] })
      }
    ) })
  ] });
}
async function clientLoader({
  params
}) {
  const {
    data: {
      user
    }
  } = await supabase.auth.getUser();
  if (!user) return;
  const entries = await fetchHabitEntriesFor(user.id, params.habitId);
  const habit2 = await fetchHabitNameById(params.habitId);
  return {
    habit: habit2,
    entries
  };
}
const columns = [{
  id: "select",
  header: ({
    table
  }) => /* @__PURE__ */ jsx(Checkbox, {
    checked: table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected() && "indeterminate",
    onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
    "aria-label": "Select all"
  }),
  cell: ({
    row
  }) => /* @__PURE__ */ jsx(Checkbox, {
    checked: row.getIsSelected(),
    onCheckedChange: (value) => {
      row.toggleSelected(!!value);
    },
    "aria-label": "Select row"
  }),
  enableSorting: false,
  enableHiding: false
}, {
  accessorKey: "entry_date",
  header: "Date",
  cell: ({
    row
  }) => /* @__PURE__ */ jsx("div", {
    className: "capitalize",
    children: row.getValue("entry_date")
  })
}, {
  accessorKey: "value",
  header: ({
    column
  }) => {
    return /* @__PURE__ */ jsxs(Button, {
      variant: "ghost",
      onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      children: ["Amount", /* @__PURE__ */ jsx(ArrowUpDown, {})]
    });
  },
  cell: ({
    row
  }) => /* @__PURE__ */ jsx("div", {
    className: "lowercase pl-8",
    children: row.getValue("value")
  })
}, {
  accessorKey: "notes",
  header: () => /* @__PURE__ */ jsx("div", {
    className: "",
    children: "Notes"
  }),
  cell: ({
    row
  }) => {
    return /* @__PURE__ */ jsx("div", {
      className: " font-semibold text-slate-500",
      children: row.getValue("notes")
    });
  }
}, {
  id: "actions",
  enableHiding: false,
  cell: ({
    row
  }) => {
    const entry2 = row.original;
    return /* @__PURE__ */ jsxs(DropdownMenu, {
      children: [/* @__PURE__ */ jsx(DropdownMenuTrigger, {
        asChild: true,
        children: /* @__PURE__ */ jsxs(Button, {
          variant: "ghost",
          className: "h-8 w-8 p-0",
          children: [/* @__PURE__ */ jsx("span", {
            className: "sr-only",
            children: "Open menu"
          }), /* @__PURE__ */ jsx(MoreHorizontal, {})]
        })
      }), /* @__PURE__ */ jsxs(DropdownMenuContent, {
        align: "end",
        children: [/* @__PURE__ */ jsx(DropdownMenuLabel, {
          children: "Actions"
        }), /* @__PURE__ */ jsx(DropdownMenuItem, {
          onClick: () => navigator.clipboard.writeText(entry2.id),
          children: "Copy Entry ID"
        }), /* @__PURE__ */ jsx(DropdownMenuSeparator, {})]
      })]
    });
  }
}];
const habit = ({
  loaderData
}) => {
  const {
    user
  } = useAuth();
  const [entries, setEntries] = React__default.useState(loaderData.entries);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const table = useReactTable({
    data: entries,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection
    }
  });
  const handleBatchDelete = async () => {
    if (!user) return;
    const idBatch = table.getFilteredSelectedRowModel().rows.map((row) => row.original.id);
    await deleteHabitEntries(idBatch);
    setEntries((prevEntries) => prevEntries.filter((e) => !idBatch.find((id) => id === e.id)));
    setRowSelection({});
    toast.success("Habit Entry deleted");
  };
  const groupedAndSummed = entries.reduce((acc, e) => {
    if (acc[e.entry_date]) {
      acc[e.entry_date].value += e.value;
    } else {
      acc[e.entry_date] = {
        date: e.entry_date,
        value: e.value
      };
    }
    return acc;
  }, {});
  return /* @__PURE__ */ jsxs("div", {
    className: "relative",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "mb-8 flex-wrap",
      children: [/* @__PURE__ */ jsx("p", {
        className: "text-muted-foreground text-lg",
        children: "Habit"
      }), /* @__PURE__ */ jsx("h1", {
        className: "scroll-m-20 capitalize text-4xl font-extrabold tracking-tight text-balance",
        children: loaderData.habit
      })]
    }), /* @__PURE__ */ jsx("div", {
      children: /* @__PURE__ */ jsx(ChartAreaInteractive, {
        chartData: Object.values(groupedAndSummed).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      })
    }), /* @__PURE__ */ jsxs("div", {
      className: "w-full",
      children: [/* @__PURE__ */ jsx("div", {
        className: "flex items-center py-4",
        children: /* @__PURE__ */ jsx("div", {
          className: "ml-auto",
          children: /* @__PURE__ */ jsx(AlertDialogButton, {
            onContinue: handleBatchDelete,
            variant: table.getFilteredSelectedRowModel().rows.length > 0 ? "destructive" : "outline",
            disabled: table.getFilteredSelectedRowModel().rows.length <= 0,
            dialingDesc: "Action cannot be undone.",
            buttonText: `Delete ${table.getFilteredSelectedRowModel().rows.length > 0 ? `Batch (${table.getFilteredSelectedRowModel().rows.length} rows)` : ""}`
          })
        })
      }), /* @__PURE__ */ jsx("div", {
        className: "overflow-hidden rounded-md border",
        children: /* @__PURE__ */ jsxs(Table, {
          children: [/* @__PURE__ */ jsx(TableHeader, {
            children: table.getHeaderGroups().map((headerGroup) => /* @__PURE__ */ jsx(TableRow, {
              children: headerGroup.headers.map((header) => {
                return /* @__PURE__ */ jsx(TableHead, {
                  children: header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())
                }, header.id);
              })
            }, headerGroup.id))
          }), /* @__PURE__ */ jsx(TableBody, {
            children: table.getRowModel().rows?.length ? table.getRowModel().rows.map((row) => /* @__PURE__ */ jsx(TableRow, {
              "data-state": row.getIsSelected() && "selected",
              children: row.getVisibleCells().map((cell) => /* @__PURE__ */ jsx(TableCell, {
                children: flexRender(cell.column.columnDef.cell, cell.getContext())
              }, cell.id))
            }, row.id)) : /* @__PURE__ */ jsx(TableRow, {
              children: /* @__PURE__ */ jsx(TableCell, {
                colSpan: columns.length,
                className: "h-24 text-center",
                children: "No results."
              })
            })
          })]
        })
      }), /* @__PURE__ */ jsxs("div", {
        className: "flex items-center justify-end space-x-2 py-4",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "text-muted-foreground flex-1 text-sm",
          children: [table.getFilteredSelectedRowModel().rows.length, " of", " ", table.getFilteredRowModel().rows.length, " row(s) selected."]
        }), /* @__PURE__ */ jsxs("div", {
          className: "space-x-2",
          children: [/* @__PURE__ */ jsx(Button, {
            variant: "outline",
            size: "sm",
            onClick: () => table.previousPage(),
            disabled: !table.getCanPreviousPage(),
            children: "Previous"
          }), /* @__PURE__ */ jsx(Button, {
            variant: "outline",
            size: "sm",
            onClick: () => table.nextPage(),
            disabled: !table.getCanNextPage(),
            children: "Next"
          })]
        })]
      })]
    })]
  });
};
const habit_default = UNSAFE_withComponentProps(habit);
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  clientLoader,
  default: habit_default
}, Symbol.toStringTag, { value: "Module" }));
const catchall = () => {
  return /* @__PURE__ */ jsx("div", {
    children: "catchall"
  });
};
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  catchall
}, Symbol.toStringTag, { value: "Module" }));
function SignupForm({ ...props }) {
  return /* @__PURE__ */ jsxs(Card, { ...props, children: [
    /* @__PURE__ */ jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsx(CardTitle, { children: "Create an account" }),
      /* @__PURE__ */ jsx(CardDescription, { children: "Enter your information below to create your account" })
    ] }),
    /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("form", { children: /* @__PURE__ */ jsxs(FieldGroup, { children: [
      /* @__PURE__ */ jsxs(Field, { children: [
        /* @__PURE__ */ jsx(FieldLabel, { htmlFor: "name", children: "Full Name" }),
        /* @__PURE__ */ jsx(Input, { id: "name", type: "text", placeholder: "John Doe", required: true })
      ] }),
      /* @__PURE__ */ jsxs(Field, { children: [
        /* @__PURE__ */ jsx(FieldLabel, { htmlFor: "email", children: "Email" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "email",
            type: "email",
            placeholder: "m@example.com",
            required: true
          }
        ),
        /* @__PURE__ */ jsx(FieldDescription, { children: "We'll use this to contact you. We will not share your email with anyone else." })
      ] }),
      /* @__PURE__ */ jsxs(Field, { children: [
        /* @__PURE__ */ jsx(FieldLabel, { htmlFor: "password", children: "Password" }),
        /* @__PURE__ */ jsx(Input, { id: "password", type: "password", required: true }),
        /* @__PURE__ */ jsx(FieldDescription, { children: "Must be at least 8 characters long." })
      ] }),
      /* @__PURE__ */ jsxs(Field, { children: [
        /* @__PURE__ */ jsx(FieldLabel, { htmlFor: "confirm-password", children: "Confirm Password" }),
        /* @__PURE__ */ jsx(Input, { id: "confirm-password", type: "password", required: true }),
        /* @__PURE__ */ jsx(FieldDescription, { children: "Please confirm your password." })
      ] }),
      /* @__PURE__ */ jsx(FieldGroup, { children: /* @__PURE__ */ jsxs(Field, { children: [
        /* @__PURE__ */ jsx(Button, { type: "submit", children: "Create Account" }),
        /* @__PURE__ */ jsx(Button, { variant: "outline", type: "button", children: "Sign up with Google" }),
        /* @__PURE__ */ jsxs(FieldDescription, { className: "px-6 text-center", children: [
          "Already have an account? ",
          /* @__PURE__ */ jsx("a", { href: "/login", children: "Sign in" })
        ] })
      ] }) })
    ] }) }) })
  ] });
}
const Register = () => {
  return /* @__PURE__ */ jsx("div", {
    className: "flex min-h-svh w-full items-center justify-center p-6 md:p-10",
    children: /* @__PURE__ */ jsx("div", {
      className: "w-full max-w-sm",
      children: /* @__PURE__ */ jsx(SignupForm, {})
    })
  });
};
const register = UNSAFE_withComponentProps(Register);
const route9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: register
}, Symbol.toStringTag, { value: "Module" }));
function LoginForm({
  email,
  password,
  setEmail,
  setPassword,
  className,
  ...props
}) {
  const { login: login2 } = useAuth();
  return /* @__PURE__ */ jsx("div", { className: cn("flex flex-col gap-6", className), ...props, children: /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsx(CardTitle, { children: "Login to your account" }),
      /* @__PURE__ */ jsx(CardDescription, { children: "Enter your email below to login to your account" })
    ] }),
    /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("form", { onSubmit: async (event) => {
      event.preventDefault();
      await login2(email, password);
    }, children: /* @__PURE__ */ jsxs(FieldGroup, { children: [
      /* @__PURE__ */ jsxs(Field, { children: [
        /* @__PURE__ */ jsx(FieldLabel, { htmlFor: "email", children: "Email" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "email",
            type: "email",
            placeholder: "m@example.com",
            value: email,
            onChange: (e) => setEmail(e.target.value),
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxs(Field, { children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center", children: /* @__PURE__ */ jsx(FieldLabel, { htmlFor: "password", children: "Password" }) }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "password",
            type: "password",
            value: password,
            onChange: (e) => setPassword(e.target.value),
            autoComplete: "current-password",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxs(Field, { children: [
        /* @__PURE__ */ jsx(Button, { type: "submit", children: "Login" }),
        /* @__PURE__ */ jsxs(FieldDescription, { className: "text-center", children: [
          "Don't have an account? ",
          /* @__PURE__ */ jsx("a", { href: "/register", children: "Sign up" })
        ] })
      ] })
    ] }) }) })
  ] }) });
}
const login = UNSAFE_withComponentProps(function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return /* @__PURE__ */ jsx("div", {
    className: "flex min-h-svh w-full items-center justify-center p-6 md:p-10",
    children: /* @__PURE__ */ jsx("div", {
      className: "w-full max-w-sm",
      children: /* @__PURE__ */ jsx(LoginForm, {
        email,
        setEmail,
        password,
        setPassword
      })
    })
  });
});
const route8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: login
}, Symbol.toStringTag, { value: "Module" }));
const AuthLayout = () => {
  const [registering, isRegistering] = useState(false);
  return /* @__PURE__ */ jsxs("div", {
    className: " relative w-full flex flex-col items-center",
    children: [/* @__PURE__ */ jsx("header", {
      className: "w-full items-center flex justify-center p-6",
      children: /* @__PURE__ */ jsx("h1", {
        className: "scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance",
        children: "Habit Tracker"
      })
    }), /* @__PURE__ */ jsx("main", {
      className: "w-full ",
      children: /* @__PURE__ */ jsx(Outlet, {})
    })]
  });
};
const layout = UNSAFE_withComponentProps(AuthLayout);
const route7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: layout
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-0Zg0T1Zw.js", "imports": ["/assets/catchall-DRODuvbv.js", "/assets/index-DJR0yQkD.js", "/assets/chunk-4WY6JWTD-ZsAaRs5U.js"], "css": ["/assets/index-CQXEbRJy.css"] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/root-DXs6jH0C.js", "imports": ["/assets/catchall-DRODuvbv.js", "/assets/index-DJR0yQkD.js", "/assets/chunk-4WY6JWTD-ZsAaRs5U.js", "/assets/AuthContext-CAM-29g3.js", "/assets/index-CfvZiKZg.js", "/assets/utils-CDN07tui.js"], "css": ["/assets/index-CQXEbRJy.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "pages/dashboard": { "id": "pages/dashboard", "parentId": "root", "path": "/dashboard?", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/dashboard-PEarTYN3.js", "imports": ["/assets/chunk-4WY6JWTD-ZsAaRs5U.js", "/assets/catchall-DRODuvbv.js", "/assets/index-C3uQcVLa.js", "/assets/index-olsFugHa.js", "/assets/button-DQSlb20C.js", "/assets/utils-CDN07tui.js", "/assets/x-CJKopfcB.js", "/assets/index-DFZGEciA.js", "/assets/AuthContext-CAM-29g3.js", "/assets/index-DJR0yQkD.js", "/assets/dropdown-menu-6nxb1hga.js", "/assets/map-BKnGS3Vp.js", "/assets/plus-DMaDCjOF.js", "/assets/separator-B64c7UZB.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "pages/home": { "id": "pages/home", "parentId": "pages/dashboard", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/home-CEPKlc0L.js", "imports": ["/assets/chunk-4WY6JWTD-ZsAaRs5U.js", "/assets/catchall-DRODuvbv.js", "/assets/separator-B64c7UZB.js", "/assets/button-DQSlb20C.js", "/assets/AuthContext-CAM-29g3.js", "/assets/AlertDialogButton-BVAg-4s6.js", "/assets/card-CPl9sgLV.js", "/assets/label-DKIyjlKT.js", "/assets/utils-CDN07tui.js", "/assets/index-C3uQcVLa.js", "/assets/index-olsFugHa.js", "/assets/map-BKnGS3Vp.js", "/assets/index-CfvZiKZg.js", "/assets/index-BQcZugzN.js", "/assets/plus-DMaDCjOF.js", "/assets/index-DJR0yQkD.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "pages/habits/layout": { "id": "pages/habits/layout", "parentId": "pages/dashboard", "path": void 0, "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/layout-BOQUFdMI.js", "imports": ["/assets/chunk-4WY6JWTD-ZsAaRs5U.js", "/assets/catchall-DRODuvbv.js", "/assets/separator-B64c7UZB.js", "/assets/index-DJR0yQkD.js", "/assets/index-olsFugHa.js", "/assets/utils-CDN07tui.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "pages/habits/overview": { "id": "pages/habits/overview", "parentId": "pages/habits/layout", "path": "habits", "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": true, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/overview-CWahJR5c.js", "imports": ["/assets/chunk-4WY6JWTD-ZsAaRs5U.js", "/assets/catchall-DRODuvbv.js", "/assets/AlertDialogButton-BVAg-4s6.js", "/assets/table-ph24alvX.js", "/assets/AuthContext-CAM-29g3.js", "/assets/button-DQSlb20C.js", "/assets/dropdown-menu-6nxb1hga.js", "/assets/index-BQcZugzN.js", "/assets/index-CfvZiKZg.js", "/assets/label-DKIyjlKT.js", "/assets/index-C3uQcVLa.js", "/assets/utils-CDN07tui.js", "/assets/x-CJKopfcB.js", "/assets/field-JfzP6Rf4.js", "/assets/index-olsFugHa.js", "/assets/plus-DMaDCjOF.js", "/assets/index-DJR0yQkD.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "pages/habits/habit": { "id": "pages/habits/habit", "parentId": "pages/habits/layout", "path": "habits/:habitId", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": true, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/habit-DcJidOsZ.js", "imports": ["/assets/chunk-4WY6JWTD-ZsAaRs5U.js", "/assets/catchall-DRODuvbv.js", "/assets/AlertDialogButton-BVAg-4s6.js", "/assets/AuthContext-CAM-29g3.js", "/assets/table-ph24alvX.js", "/assets/button-DQSlb20C.js", "/assets/dropdown-menu-6nxb1hga.js", "/assets/index-CfvZiKZg.js", "/assets/card-CPl9sgLV.js", "/assets/utils-CDN07tui.js", "/assets/index-DJR0yQkD.js", "/assets/index-C3uQcVLa.js", "/assets/index-olsFugHa.js", "/assets/index-DFZGEciA.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "catchall": { "id": "catchall", "parentId": "pages/dashboard", "path": "*", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/catchall-DRODuvbv.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "pages/auth/layout": { "id": "pages/auth/layout", "parentId": "root", "path": void 0, "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/layout-CqDM-3Tx.js", "imports": ["/assets/chunk-4WY6JWTD-ZsAaRs5U.js", "/assets/catchall-DRODuvbv.js", "/assets/AuthContext-CAM-29g3.js", "/assets/utils-CDN07tui.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "pages/auth/login": { "id": "pages/auth/login", "parentId": "pages/auth/layout", "path": "login", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/login-C7eUXUni.js", "imports": ["/assets/chunk-4WY6JWTD-ZsAaRs5U.js", "/assets/catchall-DRODuvbv.js", "/assets/utils-CDN07tui.js", "/assets/button-DQSlb20C.js", "/assets/card-CPl9sgLV.js", "/assets/field-JfzP6Rf4.js", "/assets/label-DKIyjlKT.js", "/assets/AuthContext-CAM-29g3.js", "/assets/index-olsFugHa.js", "/assets/index-DJR0yQkD.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "pages/auth/register": { "id": "pages/auth/register", "parentId": "pages/auth/layout", "path": "/register", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/register-CcWrdUPD.js", "imports": ["/assets/chunk-4WY6JWTD-ZsAaRs5U.js", "/assets/catchall-DRODuvbv.js", "/assets/button-DQSlb20C.js", "/assets/card-CPl9sgLV.js", "/assets/field-JfzP6Rf4.js", "/assets/label-DKIyjlKT.js", "/assets/index-olsFugHa.js", "/assets/utils-CDN07tui.js", "/assets/index-DJR0yQkD.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-64c1f428.js", "version": "64c1f428", "sri": void 0 };
const assetsBuildDirectory = "build\\client";
const basename = "/";
const future = { "v8_middleware": false, "unstable_optimizeDeps": false, "unstable_splitRouteModules": false, "unstable_subResourceIntegrity": false, "unstable_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "pages/dashboard": {
    id: "pages/dashboard",
    parentId: "root",
    path: "/dashboard?",
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "pages/home": {
    id: "pages/home",
    parentId: "pages/dashboard",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route2
  },
  "pages/habits/layout": {
    id: "pages/habits/layout",
    parentId: "pages/dashboard",
    path: void 0,
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "pages/habits/overview": {
    id: "pages/habits/overview",
    parentId: "pages/habits/layout",
    path: "habits",
    index: true,
    caseSensitive: void 0,
    module: route4
  },
  "pages/habits/habit": {
    id: "pages/habits/habit",
    parentId: "pages/habits/layout",
    path: "habits/:habitId",
    index: void 0,
    caseSensitive: void 0,
    module: route5
  },
  "catchall": {
    id: "catchall",
    parentId: "pages/dashboard",
    path: "*",
    index: void 0,
    caseSensitive: void 0,
    module: route6
  },
  "pages/auth/layout": {
    id: "pages/auth/layout",
    parentId: "root",
    path: void 0,
    index: void 0,
    caseSensitive: void 0,
    module: route7
  },
  "pages/auth/login": {
    id: "pages/auth/login",
    parentId: "pages/auth/layout",
    path: "login",
    index: void 0,
    caseSensitive: void 0,
    module: route8
  },
  "pages/auth/register": {
    id: "pages/auth/register",
    parentId: "pages/auth/layout",
    path: "/register",
    index: void 0,
    caseSensitive: void 0,
    module: route9
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
