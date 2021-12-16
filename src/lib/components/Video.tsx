import React, { Component } from "react";
import { LITCF_API } from "../api";
import { Optional, VideoInfo } from "../api/models";
import { checkAndSignAuthMessage } from "lit-js-sdk";
import {
  IconButton,
  CircularProgress,
  Box,
  LinearProgress,
  Backdrop,
  CardActions,
  Typography,
  CardContent,
  CardMedia,
  Card,
} from "@mui/material";
import { Lock } from "@mui/icons-material";
import { Stream } from "@cloudflare/stream-react";
import ResultDialog from "./ResultDialog";
import { LITCFContext, ILITCFContext } from "../context/LITCFContext";

interface IProps {
  videoId: string;
  height?: number;
}

interface IState extends Optional<VideoInfo> {
  id: string;
  loaded: boolean;
  locked: boolean;
  authenticating: boolean;
  errorText: string;
  errorDescription: string;
  height: number;
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
      errorText: "",
      errorDescription: "",
      height: props.height ?? 200,
    };

    this.api = new LITCF_API(gateway, userId);
  }

  init = async () => {
    const video = await this.api.getVideoInfo(this.state.id);
    this.setState({
      ...video,
      locked: video.acc.length > 0,
      loaded: true,
      stream: video.id,
    });
  };

  componentDidMount = () => {
    this.init().catch(console.error);
  };

  unlockClicked = async () => {
    this.setState({
      authenticating: true,
    });

    try {
      await this.init();

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
          stream: url,
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
      <Box>
        {this.state.loaded ? (
          <Card>
            {this.state.locked ? (
              <CardMedia
                component="img"
                height={this.state.height}
                image={this.state.thumbnail}
              />
            ) : (
              <Stream
                controls
                responsive={true}
                src={this.state.stream || ""}
                className="stream"
              />
            )}
            <CardContent>
              <Typography gutterBottom variant="h6" component="div">
                {this.state.name}
                {this.state.locked && (
                  <IconButton onClick={this.unlockClicked}>
                    <Lock />
                  </IconButton>
                )}
              </Typography>
            </CardContent>
          </Card>
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
      </Box>
    );
  }
}
