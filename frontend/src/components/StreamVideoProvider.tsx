import React, { createContext, useContext, ReactNode } from 'react';
import { StreamVideo, StreamVideoClient, User } from '@stream-io/video-react-sdk';

interface StreamVideoContextType {
  client: StreamVideoClient;
}

const StreamVideoContext = createContext<StreamVideoContextType | undefined>(undefined);

export const useStreamVideo = (): StreamVideoContextType => {
  const context = useContext(StreamVideoContext);
  if (!context) {
    throw new Error('useStreamVideo must be used within StreamVideoProvider');
  }
  return context;
};

interface StreamVideoProviderProps {
  children: ReactNode;
  client: StreamVideoClient;
}

export const StreamVideoProvider: React.FC<StreamVideoProviderProps> = ({ 
  children, 
  client 
}) => {
  return (
    <StreamVideo client={client}>
      <StreamVideoContext.Provider value={{ client }}>
        {children}
      </StreamVideoContext.Provider>
    </StreamVideo>
  );
};
