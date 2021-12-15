import { Component } from "react";
import { checkAndSignAuthMessage } from "lit-js-sdk";
import { ShareModal } from "lit-access-control-conditions-modal";
import {
  Box,
  LinearProgress,
  Button,
  Typography,
  Paper,
  ButtonGroup,
  Select,
  FormControl,
  MenuItem,
  InputLabel,
  IconButton,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import CachedIcon from "@mui/icons-material/Cached";
import axios from "axios";

import { AccessControlConditions, VideoInfo } from "../api/models";
import { LITCFContext, ILITCFContext } from "../context/LITCFContext";
import ResultDialog from "./ResultDialog";
import { LITCF_API } from "../api";

interface IProps {}

interface IState {
  modalText: string;
  modalDescription: string;
  running: boolean;
  locked: boolean;
  authenticating: boolean;
  videoId: string;
  accs: AccessControlConditions;
  shareModalOpen: boolean;
  jwt: string;
  videos: Array<VideoInfo>;
}

export default class RegisterAccountForm extends Component<IProps, IState> {
  static contextType = LITCFContext;

  api: LITCF_API;

  constructor(props: IProps, { gateway, userId }: ILITCFContext) {
    super(props);
    this.state = {
      modalText: "",
      modalDescription: "",
      running: false,
      locked: true,
      authenticating: false,
      shareModalOpen: false,
      jwt: "",
      videoId: "",
      accs: [],
      videos: [],
    };

    this.api = new LITCF_API(gateway, userId);
  }

  updateList = async () => {
    const videos = await this.api.listVideos();
    this.setState({ videos: videos.filter((v) => v.acc.length === 0) });
  };

  componentDidMount = async () => {
    await this.updateList();
  };

  onACCSelected = (accs: AccessControlConditions) => {
    if (!this.state.shareModalOpen) {
      this.setState({ modalText: "Failed to select ACCs" });
      return;
    }
    this.setState({ accs, shareModalOpen: false });
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
        path: `/setup`,
        orgId: this.context.userId,
        role: "admin",
        extraData: "",
      };

      const acc = await this.api.getACC();
      const jwt = await this.context.lit.getSignedToken({
        accessControlConditions: acc.accSetup,
        chain: this.context.chain,
        authSig,
        resourceId,
      });
      this.setState({ jwt, locked: false });
    } catch (ex) {
      this.setState({ modalText: "Failed to unlock" });
    } finally {
      this.setState({ authenticating: false });
    }
  };

  setupVideo = async () => {
    this.setState({ running: true });

    try {
      const authSig = await checkAndSignAuthMessage({
        chain: this.context.chain,
      });

      const resourceId = {
        baseUrl: new URL(this.context.gateway).hostname,
        path: `/video/${this.state.videoId}`,
        orgId: this.context.userId,
        role: "viewer",
        extraData: "",
      };

      const ssc_res = await this.context.lit.saveSigningCondition({
        accessControlConditions: this.state.accs,
        resourceId: resourceId,
        chain: this.context.chain,
        authSig,
      });

      if (!ssc_res) throw new Error();

      const res = await this.api.setupVideo(
        this.state.videoId,
        this.state.accs,
        this.state.jwt
      );
      if (!res) throw new Error("Failed setup video in gateway");

      this.setState({ modalText: "Success" });
    } catch (ex) {
      this.setState(
        axios.isAxiosError(ex)
          ? {
              modalText: "Gateway rejected request",
              modalDescription:
                "Probably you tried to update exsisting video what is prohibited",
            }
          : {
              modalText: "Failed to save signing conditions",
              modalDescription: "",
            }
      );
    } finally {
      this.setState({ running: false, accs: [], videoId: "" });
    }
  };

  render() {
    return (
      <Box>
        <Paper sx={{ width: "fit-content", margin: "5px", padding: "5px" }}>
          <Typography variant="h6">Select ACC for video</Typography>
          <Typography variant="caption">
            This can only be done once for a video
          </Typography>
          <br />
          {this.state.locked ? (
            <Button variant="contained" onClick={this.unlockClicked}>
              Authenticate
            </Button>
          ) : (
            <Box sx={{ "& .MuiTextField-root": { m: 1, width: "25ch" } }}>
              {this.state.videos.length === 0 ? (
                <Typography variant="caption">
                  Loading videos / no suitable videos
                </Typography>
              ) : (
                <FormControl sx={{ width: "60%" }}>
                  <InputLabel id="select-label">Select Video</InputLabel>
                  <Select
                    labelId="select-label"
                    value={this.state.videoId}
                    onChange={(e: SelectChangeEvent) =>
                      this.setState({ videoId: e.target.value })
                    }
                    label="Select Video"
                  >
                    {this.state.videos.map((v: VideoInfo) => (
                      <MenuItem value={v.id}>{v.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              <IconButton color="primary">
                <CachedIcon onClick={this.updateList} />
              </IconButton>
              <br />
              <ButtonGroup>
                <Button
                  variant="outlined"
                  onClick={() => this.setState({ shareModalOpen: true })}
                >
                  Select ACC
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={
                    !this.state.videoId ||
                    this.state.accs.length === 0 ||
                    this.state.running
                  }
                  onClick={this.setupVideo}
                >
                  Update
                </Button>
              </ButtonGroup>
              <br />
              {this.state.running && <LinearProgress />}
            </Box>
          )}
        </Paper>
        <ResultDialog
          title={this.state.modalText}
          description={this.state.modalDescription}
          onClose={() => this.setState({ modalText: "", modalDescription: "" })}
        />
        {this.state.shareModalOpen && (
          <ShareModal
            onClose={() => this.setState({ shareModalOpen: false })}
            sharingItems={[{ name: "video" }]}
            onAccessControlConditionsSelected={this.onACCSelected}
          />
        )}
      </Box>
    );
  }
}
