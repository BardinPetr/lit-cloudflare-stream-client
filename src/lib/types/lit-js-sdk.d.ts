declare module "lit-js-sdk";

declare class LitNodeClient {
  constructor();

  connect(): any;

  getChainDataSigningShare(e: any): any;

  getDecryptionShare(e: any): any;

  getEncryptionKey(e: any): any;

  getSignedChainDataToken(e: any): any;

  getSignedToken(e: any): any;

  getSigningShare(e: any): any;

  handshakeWithSgx(e: any): any;

  saveEncryptionKey(e: any): any;

  saveSigningCondition(e: any): any;

  sendCommandToNode(e: any): any;

  storeEncryptionConditionWithNode(e: any): any;

  storeSigningConditionWithNode(e: any): any;
}

// export const LIT_CHAINS: {
//   bsc: {
//     blockExplorerUrls: string[];
//     chainId: number;
//     contractAddress: string;
//     decimals: number;
//     name: string;
//     rpcUrls: string[];
//     symbol: string;
//     type: string;
//   };
//   ethereum: {
//     blockExplorerUrls: string[];
//     chainId: number;
//     contractAddress: string;
//     decimals: number;
//     name: string;
//     rpcUrls: string[];
//     symbol: string;
//     type: string;
//   };
//   fantom: {
//     blockExplorerUrls: string[];
//     chainId: number;
//     contractAddress: string;
//     decimals: number;
//     name: string;
//     rpcUrls: string[];
//     symbol: string;
//     type: string;
//   };
//   goerli: {
//     blockExplorerUrls: string[];
//     chainId: number;
//     contractAddress: string;
//     decimals: number;
//     name: string;
//     rpcUrls: string[];
//     symbol: string;
//     type: string;
//   };
//   kovan: {
//     blockExplorerUrls: string[];
//     chainId: number;
//     contractAddress: string;
//     decimals: number;
//     name: string;
//     rpcUrls: string[];
//     symbol: string;
//     type: string;
//   };
//   mumbai: {
//     blockExplorerUrls: string[];
//     chainId: number;
//     contractAddress: string;
//     decimals: number;
//     name: string;
//     rpcUrls: string[];
//     symbol: string;
//     type: string;
//   };
//   polygon: {
//     blockExplorerUrls: string[];
//     chainId: number;
//     contractAddress: string;
//     decimals: number;
//     name: string;
//     rpcUrls: string[];
//     symbol: string;
//     type: string;
//   };
//   rinkeby: {
//     blockExplorerUrls: string[];
//     chainId: number;
//     contractAddress: string;
//     decimals: number;
//     name: string;
//     rpcUrls: string[];
//     symbol: string;
//     type: string;
//   };
//   ropsten: {
//     blockExplorerUrls: string[];
//     chainId: number;
//     contractAddress: string;
//     decimals: number;
//     name: string;
//     rpcUrls: string[];
//     symbol: string;
//     type: string;
//   };
//   xdai: {
//     blockExplorerUrls: string[];
//     chainId: number;
//     contractAddress: string;
//     decimals: number;
//     name: string;
//     rpcUrls: string[];
//     symbol: string;
//     type: string;
//   };
// };

// export const version: string;

// export function canonicalAccessControlConditionFormatter(e: any): any;

// export function checkAndSignAuthMessage(e: any): any;

// export function connectWeb3(): any;

// export function createHtmlLIT(e: any): any;

// export function decimalPlaces(e: any): any;

// export function decodeCallResult(e: any): any;

// export function decryptWithPrivKey(e: any, t: any): any;

// export function decryptZip(e: any, t: any): any;

// export function decryptZipFileWithMetadata(e: any): any;

// export function downloadFile(e: any): void;

// export function encodeCallData(e: any): any;

// export function encryptFileAndZipWithMetadata(e: any): any;

// export function encryptWithPubKey(e: any, t: any, n: any): any;

// export function encryptZip(e: any): any;

// export function fileToDataUrl(e: any): any;

// export function findLITs(): any;

// export function getTokenList(): any;

// export function hashAccessControlConditions(e: any): any;

// export function humanizeAccessControlConditions(e: any): any;

// export function injectViewerIFrame(e: any): void;

// export function litJsSdkLoadedInALIT(): any;

// export function lookupNameServiceAddress(e: any): any;

// export function mintLIT(e: any): any;

// export function printError(e: any): void;

// export function sendLIT(e: any): any;

// export function toggleLock(): any;

// export function unlockLitWithKey(e: any): any;

// export function verifyJwt(e: any): any;

// export function zipAndEncryptFiles(e: any): any;

// export function zipAndEncryptString(e: any): any;
