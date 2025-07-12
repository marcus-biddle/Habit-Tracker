import type { ReactNode } from 'react';

interface ShowProps {
    when: boolean;
    children: ReactNode;
  }
  
  export const Show = ({ when = true, children }: ShowProps) => (when ? children : null);