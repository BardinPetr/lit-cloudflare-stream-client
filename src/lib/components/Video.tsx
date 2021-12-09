import React, { Component } from "react";
import { LITCF_API } from "../api";
import { Optional, VideoInfo } from "../api/models";
import { LitNodeClient, checkAndSignAuthMessage } from "lit-js-sdk";
import {
  Modal,
  Typography,
  IconButton,
  ImageListItemBar,
  ImageListItem,
  Paper,
  CircularProgress,
  Container,
  Box,
  LinearProgress,
  Backdrop,
  SxProps,
  Button,
  DialogActions,
  DialogContentText,
  DialogContent,
  DialogTitle,
  Dialog,
} from "@mui/material";
import { Lock } from "@mui/icons-material";
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
  errorText: string;
  errorDescription: string;
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
      errorText: "",
      errorDescription: "",
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
        extraData: "",
      };

      const jwt = await this.lit.getSignedToken({
        accessControlConditions: this.state.acc,
        chain: this.state.chain,
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
        throw new Error("Token wasn't accepter by gateway server");
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

        <Dialog
          open={this.state.errorText !== ""}
          onClose={() => this.setState({ errorText: "" })}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {this.state.errorText}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {this.state.errorDescription}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({ errorText: "" })}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </ImageListItem>
    );
  }
}
