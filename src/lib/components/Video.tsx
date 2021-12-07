import React, { Component } from "react";
import { LITCF_API } from "../api";
import { Optional, VideoInfo } from "../api/models";
import { LitNodeClient, checkAndSignAuthMessage } from "lit-js-sdk";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  ImageListItemBar,
  ImageListItem,
  Paper,
  CircularProgress,
  Container,
  Box,
  LinearProgress,
  Fab,
  Backdrop,
} from "@mui/material";
import { Lock, LockOpen } from "@mui/icons-material";
import { Stream } from "@cloudflare/stream-react";

interface IProps {
  gateway: string;
  userId: string;
  videoId: string;
  chain?: string;
}

interface IState extends Optional<VideoInfo> {
  id: string;
  loaded: boolean;
  locked: boolean;
  authenticating: boolean;
  streamUrl: string;
  chain: string;
}

export default class Video extends Component<IProps, IState> {
  api: LITCF_API;
  lit: any;

  constructor(props: IProps) {
    super(props);
    this.state = {
      id: props.videoId,
      loaded: false,
      locked: true,
      authenticating: false,
      streamUrl: "",
      chain: this.props.chain ?? "ropsten",
    };

    this.lit = new LitNodeClient();
    this.api = new LITCF_API(props.gateway, props.userId);
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

  unlockClicked = () => {
    this.setState({
      authenticating: true,
    });

    this.lit.connect();

    document.addEventListener("lit-ready", this.unlock, false);
  };

  unlock = async () => {
    document.removeEventListener("lit-ready", this.unlock, false);

    try {
      const authSig = await checkAndSignAuthMessage({
        chain: this.state.chain,
      });

      const resourceId = {
        baseUrl: new URL(this.props.gateway).hostname,
        path: `/video/${this.state.id}`,
        orgId: this.props.userId,
        role: "viewer",
        extraData: "downloadable",
      };

      const jwt = await this.lit.getSignedToken({
        accessControlConditions: this.state.acc,
        chain: this.state.chain,
        authSig,
        resourceId,
      });

      console.log(jwt);
    } catch (ex) {
      console.error(ex);
      this.setState({
        authenticating: false,
      });
    }
  };

  render() {
    return (
      <div>
        <ImageListItem key={this.state.id}>
          <Paper
            sx={{ width: "20vw", display: "inline-block" }}
            variant="outlined"
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
                <Stream controls src={this.state.streamUrl} />
              )
            ) : (
              <LinearProgress sx={{ margin: "10px" }} />
            )}
          </Paper>
        </ImageListItem>
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={this.state.authenticating}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </div>
    );
  }
}
