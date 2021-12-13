import React, { useState, useEffect, FC } from "react";
import { LitNodeClient } from "lit-js-sdk";
import { Backdrop, CircularProgress } from "@mui/material";

export interface IProps {
  gateway: string;
  userId: string;
  chain: string;
}

export interface ILITCFContext {
  lit: LitNodeClient;
  gateway: string;
  userId: string;
  chain: string;
}

export const LITCFContext = React.createContext<Partial<ILITCFContext>>({});

export const LITCFProvider: FC<IProps> = ({
  children,
  gateway,
  userId,
  chain,
}) => {
  const [connected, setConnected] = useState(false);
  const [lit, setLit] = useState<LitNodeClient>();

  useEffect(() => {
    const client = new LitNodeClient();
    client.connect();
    setLit(client);
    document.addEventListener("lit-ready", () => setConnected(true), false);
    return () => {};
  }, []);

  return (
    <div>
      {connected && (
        <LITCFContext.Provider
          value={{ gateway, userId, lit, chain } as ILITCFContext}
        >
          {children}
        </LITCFContext.Provider>
      )}
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={!connected}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
};
