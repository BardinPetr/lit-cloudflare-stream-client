import React, { Component } from "react";
import { LITCF_API } from "../api";
import { RegisterRequest } from "../api/models";
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
import ResultDialog from "./ResultDialog";
import { LITCFContext, ILITCFContext } from "../context/LITCFContext";

interface IProps {}

interface IState {
  errorText: string;
  errorDescription: string;
  running: boolean;
  currentRequest: RegisterRequest;
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
      currentRequest: {
        account: "",
        token: "",
        accSetup: [],
        accUpload: [],
      },
    };

    this.api = new LITCF_API(gateway, userId);
  }

  selectACC = async (type: string) => {};

  register = async () => {
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
    } catch (ex) {
      this.setState({
        errorText: "Failed to unlock",
        // errorDescription: ex,
      });
    } finally {
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
                this.setState({
                  currentRequest: {
                    ...this.state.currentRequest,
                    account: target.value,
                  },
                })
              }
              value={this.state.currentRequest.account}
              label="Register Secret"
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
              label="CF User ID"
              variant="outlined"
            />
            <br />
            <ButtonGroup variant="outlined" aria-label="outlined button group">
              <Button onClick={() => this.selectACC("upload")}>
                Select Upload ACC
              </Button>
              <Button onClick={() => this.selectACC("setup")}>
                Select Setup ACC
              </Button>
            </ButtonGroup>
            {this.state.running && <LinearProgress />}
            <br />
            <Button
              variant="contained"
              color="primary"
              disabled={this.state.running}
              onClick={this.register}
            >
              Register
            </Button>
          </Box>
        </Paper>
        <ResultDialog
          title={this.state.errorText}
          description={this.state.errorDescription}
        />
        <ShareModal
          onClose={() => {}}
          sharingItems={[{ name: "1" }]}
          onAccessControlConditionsSelected={(x: any) => {
            console.log(x);
          }}
          getSharingLink={(x: any) => {
            console.log(`gsl${x}}`);
            return "23";
          }}
        />
      </Box>
    );
  }
}
