/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { createContext, FC, ReactNode, useContext } from 'react';
import { useLiveApiWidget, UseLiveApiResults } from '../hooks/media/use-live-api-widget';

const LiveAPIContextWidget = createContext<UseLiveApiResults | undefined>(undefined);

export type LiveAPIProviderWidgetProps = {
  children: ReactNode;
  apiKey: string;
};

export const LiveAPIProviderWidget: FC<LiveAPIProviderWidgetProps> = ({
  apiKey,
  children,
}) => {
  const liveAPI = useLiveApiWidget({ apiKey });

  return (
    <LiveAPIContextWidget.Provider value={liveAPI}>
      {children}
    </LiveAPIContextWidget.Provider>
  );
};

export const useLiveAPIContextWidget = () => {
  const context = useContext(LiveAPIContextWidget);
  if (!context) {
    throw new Error('useLiveAPIContextWidget must be used within a LiveAPIProviderWidget');
  }
  return context;
};
