export interface AccessControlCondition {
  contractAddress: string;
  standardContractType: string;
  chain: string;
  method: string;
  parameters: Array<string>;
  returnValueTest: {
    comparator: string;
    value: string;
  };
}

export type AccessControlConditions = Array<AccessControlCondition>;

export interface VideoInfo {
  id: string;
  name: string;
  height: number;
  width: number;
  thumbnail: string;
  stream: string;
  acc: AccessControlConditions;
}

export interface VideoSetupRequest {
  id: string;
  acc: AccessControlConditions;
}

export type Optional<Type> = {
  [Property in keyof Type]+?: Type[Property];
};

export interface ACCResponse {
  accSetup: AccessControlConditions;
  accUpload: AccessControlConditions;
}

export interface RegisterRequest {
  account: string;
  token: string;
  accSetup: AccessControlConditions;
  accUpload: AccessControlConditions;
}
