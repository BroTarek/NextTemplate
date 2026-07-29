import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 768;

// 1. Subscribe function: sets up the event listener and returns the cleanup function.
function subscribe(callback: () => void) {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
  
  // Use 'change' event for modern browsers
  mql.addEventListener("change", callback);
  
  return () => {
    mql.removeEventListener("change", callback);
  };
}

// 2. getSnapshot function: returns the current state from the external store (the window).
function getSnapshot() {
  return window.innerWidth < MOBILE_BREAKPOINT;
}

// 3. getServerSnapshot function: provides a default value during Server-Side Rendering (SSR).
function getServerSnapshot() {
  return false; // Assuming desktop by default on the server, adjust as needed.
}

export function useIsMobile() {
  // Pass the three functions to useSyncExternalStore
  const isMobile = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return isMobile;
}

//another implemntation 
// import * as React from "react"

// const MOBILE_BREAKPOINT = 768

// export function useIsMobile() {
//   const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

//   React.useEffect(() => {
//     const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
//     const onChange = () => {
//       setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
//     }
//     mql.addEventListener("change", onChange)
//     setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
//     return () => mql.removeEventListener("change", onChange)
//   }, [])

//   return !!isMobile
// }