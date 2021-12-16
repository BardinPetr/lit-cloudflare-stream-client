import "./App.css";
import {
  Video,
  VideoSetup,
  RegisterAccountForm,
  Upload,
  LITCFProvider,
  LITCF_API,
} from "./lib";
import { VideoInfo } from "./lib/api/models";

import { Component } from "react";
import {
  Button,
  ImageList,
  ImageListItem,
  TextField,
  Grid,
  Box,
} from "@mui/material";

interface IState {
  videos: Array<VideoInfo>;
  chain: string;
  userId: string;
}

export default class App extends Component<{}, IState> {
  GATEWAY_HOST = "https://lit-cloudflare-stream-worker.bardin-petr.workers.dev";

  constructor(props: {}) {
    super(props);
    this.state = {
      videos: [],
      chain: "ropsten",
      userId: "ad689a4c7ee776c5c881c7e04cad097b",
    };
  }

  componentDidMount = () => this.init();

  init = () => {
    this.setState({ videos: [] });
    new LITCF_API(this.GATEWAY_HOST, this.state.userId)
      .listVideos()
      .then((videos) => this.setState({ videos }));
  };

  render() {
    return (
      <Box m={4}>
        <TextField
          label="Chain"
          value={this.state.chain}
          margin="normal"
          disabled={true}
          onChange={({ target }) => this.setState({ chain: target.value })}
        />
        <TextField
          label="CF User ID"
          margin="normal"
          value={this.state.userId}
          onChange={({ target }) => this.setState({ userId: target.value })}
        />
        <Button onClick={this.init}>Set</Button>

        <LITCFProvider
          gateway={this.GATEWAY_HOST}
          userId={this.state.userId}
          chain={this.state.chain}
        >
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Upload />

              <VideoSetup />

              <RegisterAccountForm />
            </Grid>

            <Grid item xs={5}>
              <ImageList
                cols={2}
                rowHeight={150}
                sx={{ width: "100%", height: "80vw" }}
              >
                {!this.state.videos.length
                  ? "Loading"
                  : this.state.videos?.map((x) => (
                      <ImageListItem key={x.id} sx={{ maxWidth: "30vw" }}>
                        <Video videoId={x.id} />
                      </ImageListItem>
                    ))}
              </ImageList>
            </Grid>
          </Grid>
        </LITCFProvider>
      </Box>
    );
  }
}
