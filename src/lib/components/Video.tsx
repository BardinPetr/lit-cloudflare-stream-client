import React, { Component } from "react";
import { LITCF_API } from "../api";
import { Optional, VideoInfo } from "../api/models";
import { checkAndSignAuthMessage } from "lit-js-sdk";
import {
  IconButton,
  ImageListItemBar,
  ImageListItem,
  CircularProgress,
  Box,
  LinearProgress,
  Backdrop,
} from "@mui/material";
import { Lock } from "@mui/icons-material";
import { Stream } from "@cloudflare/stream-react";
import ResultDialog from "./ResultDialog";
import { LITCFContext, ILITCFContext } from "../context/LITCFContext";

interface IProps {
  videoId: string;
}

interface IState extends Optional<VideoInfo> {
  id: string;
  loaded: boolean;
  locked: boolean;
  authenticating: boolean;
  streamUrl: string;
  errorText: string;
  errorDescription: string;
}

export default class Video extends Component<IProps, IState> {
  static contextType = LITCFContext;

  api: LITCF_API;

  constructor(props: IProps, { gateway, userId }: ILITCFContext) {
    super(props);

    this.state = {
      id: props.videoId,
      loaded: false,
      locked: true,
      authenticating: false,
      streamUrl: "",
      errorText: "",
      errorDescription: "",
    };

    this.api = new LITCF_API(gateway, userId);
  }

  componentDidMount = () => {
    this.api.getVideoInfo(this.state.id).then((video) =>
      this.setState({
        locked: true,
        loaded: true,
        ...video,
      })
    );
  };

  unlockClicked = async () => {
    this.setState({
      authenticating: true,
    });

    try {
      const authSig = await checkAndSignAuthMessage({
        chain: this.context.chain,
      });

      const resourceId = {
        baseUrl: new URL(this.context.gateway).hostname,
        path: `/video/${this.state.id}`,
        orgId: this.context.userId,
        role: "viewer",
        extraData: "",
      };

      const jwt = await this.context.lit.getSignedToken({
        accessControlConditions: this.state.acc,
        chain: this.context.chain,
        authSig,
        resourceId,
      });

      const url = await this.api.getToken(this.state.id, jwt);
      if (url) {
        this.setState({
          locked: false,
          streamUrl: url,
        });
      } else {
        throw new Error("Token wasn't accepted by gateway server");
      }
    } catch (ex) {
      this.setState({
        errorText: "Failed to unlock",
        // errorDescription: ex,
      });
    } finally {
      this.setState({
        authenticating: false,
      });
    }
  };

  render() {
    return (
      <ImageListItem
        key={this.state.id}
        sx={{ width: "30vw", height: "fit-content" }}
      >
        {this.state.loaded ? (
          this.state.locked ? (
            <Box>
              <img
                style={{ width: "100%" }}
                src={this.state.thumbnail}
                alt={this.state.name}
                loading="lazy"
              />
              <ImageListItemBar
                title={this.state.name}
                actionIcon={
                  <IconButton
                    onClick={this.unlockClicked}
                    sx={{ color: "rgba(255, 255, 255, 0.54)" }}
                  >
                    <Lock />
                  </IconButton>
                }
              />
            </Box>
          ) : (
            <Stream controls src={this.state.streamUrl} className="stream" />
          )
        ) : (
          <LinearProgress sx={{ margin: "10px" }} />
        )}
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={this.state.authenticating}
        >
          <CircularProgress color="inherit" />
        </Backdrop>

        <ResultDialog
          onClose={() => this.setState({ errorText: "" })}
          title={this.state.errorText}
          description={this.state.errorDescription}
        />
      </ImageListItem>
    );
  }
}
