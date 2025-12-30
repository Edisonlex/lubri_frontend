"use client";

import { EnhancedMap } from "./enhanced-map";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarAwareMapProps extends React.ComponentProps<typeof EnhancedMap> {
  className?: string;
}

export function SidebarAwareMap({ className = "", ...props }: SidebarAwareMapProps) {
  const isMobile = useIsMobile();
  
  // Since padding is handled at the layout level, we just need to ensure the map fills the available space
  return (
    <div className={`relative w-full h-full ${className}`}>
      <EnhancedMap 
        {...props}
        className="w-full h-full"
        containerStyle={{
          position: 'relative',
          zIndex: 1
        }}
      />
    </div>
  );
}