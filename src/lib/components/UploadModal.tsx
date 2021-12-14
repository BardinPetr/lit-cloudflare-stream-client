import React, { Component } from "react";
import { LITCF_API } from "../api";
import { checkAndSignAuthMessage } from "lit-js-sdk";
import {
  CircularProgress,
  Box,
  LinearProgress,
  Backdrop,
  Button,
  Paper,
  Typography,
} from "@mui/material";
import ResultDialog from "./ResultDialog";
import { LITCFContext, ILITCFContext } from "../context/LITCFContext";

interface IProps {}

interface IState {
  locked: boolean;
  authenticating: boolean;
  uploading: boolean;
  uploadUrl: string;
  errorText: string;
  errorDescription: string;
  videoFile: File | null;
}

export default class Upload extends Component<IProps, IState> {
  static contextType = LITCFContext;

  api: LITCF_API;

  constructor(props: IProps, { gateway, userId }: ILITCFContext) {
    super(props);
    this.state = {
      locked: true,
      uploading: false,
      authenticating: false,
      uploadUrl: "",
      errorText: "",
      errorDescription: "",
      videoFile: null,
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
        role: "uploader",
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

  fileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length !== 1)
      this.setState({ errorText: "Files count invalid" });
    else if (files[0].size > 20971520)
      this.setState({ errorText: "File can't exceed 20MB in this demo" });
    else this.setState({ videoFile: files[0] });
  };

  uploadVideo = async () => {
    this.setState({ uploading: true });
    try {
      const res = await this.api.uploadFile(
        this.state.uploadUrl,
        this.state.videoFile!
      );

      if (!res) throw new Error();
      this.setState({ errorText: "Success", locked: true });
    } catch (ex) {
      this.setState({ errorText: "Unable to upload file" });
    } finally {
      this.setState({ uploading: false });
    }
  };

  render() {
    return (
      <Box>
        <Paper sx={{ width: "fit-content", margin: "5px", padding: "5px" }}>
          <Typography variant="h6">Upload Video</Typography>

          {this.state.locked ? (
            <Button variant="contained" onClick={this.unlockClicked}>
              Authenticate
            </Button>
          ) : (
            <Box>
              <input type="file" onChange={this.fileSelected} />
              <Button
                disabled={!this.state.videoFile || this.state.uploading}
                onClick={this.uploadVideo}
              >
                Upload
              </Button>
              <br />
              {this.state.uploading && <LinearProgress />}
            </Box>
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
        </Paper>
      </Box>
    );
  }
}
