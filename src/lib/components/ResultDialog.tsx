import {
  Button,
  DialogActions,
  DialogContentText,
  DialogContent,
  DialogTitle,
  Dialog,
} from "@mui/material";

import { useState } from "react";

export default function ResultDialog(props: {
  title: string;
  description: string;
}) {
  const [title, setTitle] = useState(props.title);

  return (
    <div>
      <Dialog
        open={title !== ""}
        onClose={() => setTitle("")}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {props.description}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTitle("")}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
