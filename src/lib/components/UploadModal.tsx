import React, { Component } from "react";
import { LITCF_API } from "../api";
import { Optional, VideoInfo } from "../api/models";
import { LitNodeClient, checkAndSignAuthMessage } from "lit-js-sdk";
import {
  IconButton,
  ImageListItemBar,
  ImageListItem,
  CircularProgress,
  Box,
  LinearProgress,
  Backdrop,
  Button,
} from "@mui/material";
import { Lock } from "@mui/icons-material";
import { Stream } from "@cloudflare/stream-react";
import ResultDialog from "./ResultDialog";
import { LITCFContext, ILITCFContext } from "../context/LITCFContext";

interface IProps {}

interface IState {
  loaded: boolean;
  locked: boolean;
  authenticating: boolean;
  uploadUrl: string;
  errorText: string;
  errorDescription: string;
}

export default class Upload extends Component<IProps, IState> {
  static contextType = LITCFContext;

  api: LITCF_API;

  constructor(props: IProps, { gateway, userId }: ILITCFContext) {
    super(props);
    this.state = {
      loaded: false,
      locked: true,
      authenticating: false,
      uploadUrl: "",
      errorText: "",
      errorDescription: "",
    };

    this.api = new LITCF_API(gateway, userId);
  }

  componentDidMount = () => {};

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
        path: `/upload`,
        orgId: this.context.userId,
        role: "",
        extraData: "",
      };

      const acc = await this.api.getACC();

      const jwt = await this.context.lit.getSignedToken({
        accessControlConditions: acc.accUpload,
        chain: this.context.chain,
        authSig,
        resourceId,
      });

      const url = await this.api.getUploadURL(jwt);
      console.log(url);
      if (url) {
        this.setState({
          locked: false,
          uploadUrl: url,
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
        {this.state.locked ? (
          <Button variant="contained" onClick={this.unlockClicked}>
            Authenticate
          </Button>
        ) : (
          <Box>
            <Button>RUN</Button>
          </Box>
        )}

        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={this.state.authenticating}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <ResultDialog
          title={this.state.errorText}
          description={this.state.errorDescription}
        />
      </Box>
    );
  }
}
