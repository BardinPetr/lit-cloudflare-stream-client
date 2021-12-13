import "./App.css";
import { LITCF_API } from "./lib/api";
import { VideoInfo } from "./lib/api/models";
import Upload from "./lib/components/UploadModal";
import Video from "./lib/components/Video";
import RegisterAccountForm from "./lib/components/RegisterAccountForm";

import React, { Component } from "react";
import { ImageList, List, ListItem } from "@mui/material";
import { LITCFProvider } from "./lib/context/LITCFContext";

interface IState {
  videos: Array<VideoInfo>;
  userId: string;
}

export default class App extends Component<{}, IState> {
  GATEWAY_HOST = "http://localhost:8787/";

  api: LITCF_API;

  constructor(props: {}) {
    super(props);
    this.state = {
      videos: [],
      userId: "ad689a4c7ee776c5c881c7e04cad097b",
    };

    this.api = new LITCF_API(this.GATEWAY_HOST, this.state.userId);

    this.api.listVideos().then((videos) => this.setState({ videos }));
  }

  componentDidMount() {}

  render() {
    return (
      <div className="App">
        <LITCFProvider
          gateway={this.GATEWAY_HOST}
          userId={this.state.userId}
          chain={"ropsten"}
        >
          <ImageList>
            {!this.state.videos.length
              ? "Loading"
              : this.state.videos?.map((x) => (
                  <ListItem alignItems="flex-start">
                    <Video videoId={x.id} />
                  </ListItem>
                ))}
          </ImageList>

          <Upload></Upload>

          <RegisterAccountForm></RegisterAccountForm>
        </LITCFProvider>
      </div>
    );
  }
}
