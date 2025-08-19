import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const WalletButton = () => {
  const navigate = useNavigate();
  const wasConnected = useRef(false);

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        // Redirect to dashboard after connect
        useEffect(() => {
          if (!wasConnected.current && connected) {
            navigate('/');
          }
          wasConnected.current = connected;
        }, [connected, navigate]);

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="connect-button hover:scale-105 active:scale-95 transition-transform"
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="bg-red-600 text-white border border-red-500 px-6 py-3 font-bold transition-all duration-300 hover:bg-red-700 hover:border-red-400 hover:scale-105 active:scale-95"
                  >
                    Wrong Network
                  </button>
                );
              }

              return (
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                  <button
                    onClick={openChainModal}
                    className="connect-button text-sm flex items-center gap-2 hover:scale-105 transition-transform"
                  >
                    {chain.hasIcon && (
                      <div className="w-4 h-4">
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            className="w-4 h-4"
                          />
                        )}
                      </div>
                    )}
                    <span className="font-medium truncate max-w-[120px]">{chain.name}</span>
                  </button>

                  <button
                    onClick={openAccountModal}
                    className="connect-button text-sm flex items-center gap-2 hover:scale-105 transition-transform"
                  >
                    <div className="w-4 h-4 bg-green-500 text-white flex items-center justify-center text-xs font-bold border border-green-500 rounded-full">
                      {account.displayName?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <span className="font-medium truncate max-w-[120px]">{account.displayName}</span>
                  </button>
                </div>
                
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
