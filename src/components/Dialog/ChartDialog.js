import React, {useEffect} from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import {Typography} from "@material-ui/core";
export default function ChartDialog(props) {



    return (
        <div>

            <Dialog
                open={props.open}
                onClose={() => props.setChartOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Etykiety"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        <Typography>
                            Czy wykres jest?
                        </Typography>
                        {props.labels&&props.labels.map((d,i) =>
                            <FormControlLabel
                                control={<Checkbox  name="checkedA" />}
                                label={d}
                            />
                        )}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button  color="primary">
                        Disagree
                    </Button>
                    <Button  color="primary" autoFocus>
                        Agree
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
