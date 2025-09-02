import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  StreamCall,
  StreamVideo,
  StreamVideoClient,
  User,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  useCall,
  useCallStateHooks,
  CallingState
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import axios, { AxiosError } from 'axios';
import { StreamConfig } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface VideoCallUIProps {
  isTeacher: boolean;
  userId: number;
}

const VideoCallUI: React.FC<VideoCallUIProps> = ({ isTeacher, userId }) => {
  const call = useCall();
  const { useCallCallingState, useParticipantCount } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();

  useEffect(() => {
    const initializeCall = async () => {
      if (call && callingState !== CallingState.JOINED) {
        try {
          await call.join({ create: false });
          
          // Set initial permissions based on role
          if (isTeacher) {
            await call.camera.enable();
            await call.microphone.enable();
          } else {
            // Students join with camera/mic disabled initially
            await call.camera.disable();
            await call.microphone.disable();
          }
        } catch (error) {
          console.error('Failed to join call:', error);
        }
      }
    };

    initializeCall();

    return () => {
      if (call) {
        call.leave().catch(console.error);
      }
    };
  }, [call, isTeacher, callingState]);

  if (callingState === CallingState.JOINING) {
    return <div>Joining call...</div>;
  }

  if (callingState !== CallingState.JOINED) {
    return <div>Call state: {callingState}</div>;
  }

  return (
    <StreamTheme>
      <div className="video-call-container">
        <SpeakerLayout />
        <CallControls />
        <div className="call-info">
          Call has {participantCount} participants
        </div>
      </div>
    </StreamTheme>
  );
};

interface RouteParams {
  callId: string;
}

const VideoCall: React.FC = () => {
  const { callId } = useParams<keyof RouteParams>() as RouteParams;
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // This would typically come from your auth system
  const userId = 1;
  const isTeacher = false;

  useEffect(() => {
    const initializeStream = async (): Promise<void> => {
      try {
        setLoading(true);
        
        // Get Stream token and config from your API
        const response = await axios.get<StreamConfig>(
          `${API_URL}/api/classes/1/token?user_id=${userId}`
        );
        
        const { token, api_key, user_id, call_id } = response.data;
        
        // Create user object
        const user: User = {
          id: user_id,
          name: `User ${user_id}`,
          type: isTeacher ? 'authenticated' : 'authenticated'
        };
        
        // Create client
        const streamClient = new StreamVideoClient({
          apiKey: api_key,
          user,
          token
        });
        
        // Create call object
        const streamCall = streamClient.call('default', call_id);
        
        setClient(streamClient);
        setCall(streamCall);
        setError('');
      } catch (err) {
        const error = err as AxiosError;
        console.error('Error initializing stream:', error);
        setError('Failed to initialize video call');
      } finally {
        setLoading(false);
      }
    };

    if (callId) {
      initializeStream();
    }

    return () => {
      if (client) {
        client.disconnectUser();
      }
    };
  }, [callId, userId, isTeacher]);

  if (loading) return <div>Loading video call...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!client || !call) return <div>No stream configuration</div>;

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <VideoCallUI isTeacher={isTeacher} userId={userId} />
      </StreamCall>
    </StreamVideo>
  );
};

export default VideoCall;
