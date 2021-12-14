import React, { Component } from "react";
import { checkAndSignAuthMessage } from "lit-js-sdk";
import { ShareModal } from "lit-access-control-conditions-modal";
import {
  Box,
  LinearProgress,
  Button,
  Typography,
  Paper,
  TextField,
  ButtonGroup,
} from "@mui/material";
import DoneOutlineIcon from "@mui/icons-material/DoneOutline";
import axios from "axios";

import { RegisterRequest, AccessControlConditions } from "../api/models";
import { LITCFContext, ILITCFContext } from "../context/LITCFContext";
import ResultDialog from "./ResultDialog";
import { LITCF_API } from "../api";

interface IProps {}

interface IState {
  errorText: string;
  errorDescription: string;
  running: boolean;
  success: boolean;
  currentRequest: RegisterRequest;
  registerSecret: string;
  shareModalMode: "accUpload" | "accSetup" | null;
}

export default class RegisterAccountForm extends Component<IProps, IState> {
  static contextType = LITCFContext;

  api: LITCF_API;

  constructor(props: IProps, { gateway, userId }: ILITCFContext) {
    super(props);
    this.state = {
      errorText: "",
      errorDescription: "",
      running: false,
      success: false,
      registerSecret:
        "yRJj169LRxiCpoE6Wduqz9UtYoKa4AKPRwUR90ASXgE4OZVHd7ZtpyEK5VTAZ5oe",
      currentRequest: {
        account: "ad689a4c7ee776c5c881c7e04cad097b",
        token: "CatNqMbImN9_yy8-VwadJprn9kEuSQEEZpXVdlYc",
        accSetup: [],
        accUpload: [],
      },
      shareModalMode: null,
    };

    this.api = new LITCF_API(gateway, userId);
  }

  onACCSelected = (accs: AccessControlConditions) => {
    if (this.state.shareModalMode === null) {
      this.setState({ errorText: "Failed to select ACCs" });
      return;
    }
    this.setState({
      currentRequest: {
        ...this.state.currentRequest,
        [this.state.shareModalMode]: accs,
      },
      shareModalMode: null,
    });
  };

  register = async () => {
    this.setState({
      running: true,
    });

    try {
      const res = await this.api.register(
        this.state.currentRequest,
        this.state.registerSecret
      );
      if (!res) throw new Error("Failed to register in gateway");

      const authSig = await checkAndSignAuthMessage({
        chain: this.context.chain,
      });

      const setupResourceId = {
        baseUrl: new URL(this.context.gateway).hostname,
        path: "/setup",
        orgId: this.context.userId,
        role: "admin",
        extraData: "",
      };

      const ssc_res = await this.context.lit.saveSigningCondition({
        accessControlConditions: this.state.currentRequest.accSetup,
        resourceId: setupResourceId,
        chain: this.context.chain,
        authSig,
      });

      const uploadResourceId = {
        baseUrl: new URL(this.context.gateway).hostname,
        path: `/upload`,
        orgId: this.context.userId,
        role: "uploader",
        extraData: "",
      };

      const usc_res = await this.context.lit.saveSigningCondition({
        accessControlConditions: this.state.currentRequest.accUpload,
        resourceId: uploadResourceId,
        chain: this.context.chain,
        authSig,
      });

      if (!usc_res || !ssc_res) throw new Error();

      this.setState({ success: true });
      setTimeout(() => this.setState({ success: false }), 5000);
    } catch (ex) {
      this.setState(
        axios.isAxiosError(ex)
          ? {
              errorText: "Gateway rejected request",
              errorDescription:
                "Probably you tried to update exsisting account what is prohibited",
            }
          : {
              errorText: "Failed to save signing conditions",
              errorDescription: "",
            }
      );
    } finally {
      this.setState({ running: false });
    }
  };

  render() {
    return (
      <Box>
        <Paper sx={{ width: "fit-content", margin: "5px", padding: "5px" }}>
          <Typography variant="h6">
            Connect your CloudFlare Stream account
          </Typography>

          <Box sx={{ "& .MuiTextField-root": { m: 1, width: "25ch" } }}>
            <TextField
              onChange={({ target }) =>
                this.setState({ registerSecret: target.value })
              }
              value={this.state.registerSecret}
              label="Register Secret"
              variant="outlined"
            />
            <TextField
              onChange={({ target }) =>
                this.setState({
                  currentRequest: {
                    ...this.state.currentRequest,
                    account: target.value,
                  },
                })
              }
              value={this.state.currentRequest.account}
              label="CloudFlare Account ID"
              variant="outlined"
            />
            <TextField
              onChange={({ target }) =>
                this.setState({
                  currentRequest: {
                    ...this.state.currentRequest,
                    token: target.value,
                  },
                })
              }
              value={this.state.currentRequest.token}
              label="CloudFlare Stream Token"
              variant="outlined"
            />
            <br />
            <ButtonGroup variant="outlined" aria-label="outlined button group">
              <Button
                onClick={() =>
                  this.setState({ shareModalMode: "accUpload" as "accUpload" })
                }
              >
                Select Upload ACC
              </Button>
              <Button
                onClick={() =>
                  this.setState({ shareModalMode: "accSetup" as "accSetup" })
                }
              >
                Select Setup ACC
              </Button>
              <Button
                variant="contained"
                color="primary"
                disabled={
                  this.state.running ||
                  this.state.success ||
                  !this.state.currentRequest.accSetup.length ||
                  !this.state.currentRequest.accUpload.length ||
                  !this.state.currentRequest.account.length ||
                  !this.state.currentRequest.token.length
                }
                onClick={this.register}
              >
                Register
              </Button>
              {this.state.success && <DoneOutlineIcon color="success" />}
            </ButtonGroup>
            {this.state.running && <LinearProgress />}
            <br />
          </Box>
        </Paper>
        <ResultDialog
          title={this.state.errorText}
          description={this.state.errorDescription}
          onClose={() => this.setState({ errorText: "", errorDescription: "" })}
        />
        {this.state.shareModalMode && (
          <ShareModal
            onClose={() => this.setState({ shareModalMode: null })}
            sharingItems={[{ name: this.state.shareModalMode }]}
            onAccessControlConditionsSelected={this.onACCSelected}
          />
        )}
      </Box>
    );
  }
}
