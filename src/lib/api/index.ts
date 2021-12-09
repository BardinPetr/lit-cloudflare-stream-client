import axios, { Axios } from "axios";
import {
  AccessControlConditions,
  VideoInfo,
  VideoSetupRequest,
} from "./models";

export class LITCF_API {
  axios: Axios;

  constructor(gateway: string, userId: string) {
    this.axios = axios.create({
      baseURL: gateway,
      headers: {
        CF_ACCOUNT: userId,
        "Content-Type": "application/json",
      },
    });
  }

  genConf = (jwt: string): { headers: { Authorization: string } } => ({
    headers: { Authorization: `Bearer ${jwt}` },
  });

  listVideos = async (): Promise<Array<VideoInfo>> =>
    (await this.axios.get("/videos")).data;

  getVideoInfo = async (videoId: string): Promise<VideoInfo> =>
    (await this.axios.get(`/info/${videoId}`)).data;

  getUploadURL = async (jwt: string): Promise<string> =>
    (await this.axios.get(`/upload`, this.genConf(jwt))).data;

  getToken = async (videoId: string, jwt: string): Promise<string> =>
    (await this.axios.get(`/video/${videoId}`, this.genConf(jwt))).data;

  setupVideo = async (
    id: string,
    acc: AccessControlConditions,
    jwt: string
  ): Promise<boolean> =>
    (
      await this.axios.post(
        `/setup`,
        {
          id,
          acc,
        } as VideoSetupRequest,
        this.genConf(jwt)
      )
    ).status === 200;
}
