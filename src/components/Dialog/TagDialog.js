import React, {useEffect} from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from "@material-ui/core/styles";
import Chip from "@material-ui/core/Chip";

const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        listStyle: "none",
        padding: theme.spacing(0.5),
        margin: 0,
        width: 350
    },
    chip: {
        margin: theme.spacing(0.5)
    }
}));

export default function TagDialog(props) {
    // const [open, setOpen] = React.useState(props.open);
    const [inWindow, setInWIndow] = React.useState(false)
    const classes = useStyles();
    const [chipData, setChipData] = React.useState([
        { key: 0, label: "Tag1" },
        { key: 1, label: "Tag2" },
        { key: 2, label: "Tag3" },
        { key: 3, label: "Tag4" },
        { key: 4, label: "Tag5" },
        { key: 5, label: "Other" }
    ]);

    const [chipDataNew, setChipDataNew] = React.useState([]);

    const colors = ["steelblue", "yellow", "aqua", "green", "brown"];

    const handleDelete = (chipToDelete) => (e) => {
        e.stopPropagation()
        e.preventDefault()
        console.log(e.target)
        if (!inWindow) {
        setChipData((chips) =>
            chips.filter((chip) => chip.key !== chipToDelete.key)
        );

            let arr = [...chipDataNew];
            arr.push(chipToDelete);
            setChipDataNew(arr);
        }

    };
    // const handleClickOpen = () => {
    //     setOpen(true);
    // };
    const drag = (e) => {
        console.log(e.target.parentNode.parentNode)
    }

    const testIn = (e) => {
        console.log(inWindow)
        setInWIndow(true)
    }
    const testOut = (e) => {
        console.log(inWindow)
        setInWIndow(false)
    }

    // const handleClose = () => {
    //     setOpen(false);
    // };
    React.useEffect(() => {
        const tags = []
        for (let i =0; i < props.labels.length; i++) {
            tags.push({key: i, label: props.labels[i]})
        }
        setChipData(tags)
    },[props.labels])
    React.useEffect(() => {
        // setOpen(!open)
    },[props.open])

    return (
        <div>
            <Dialog
                open={props.open}
                // onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"

            >
                <DialogTitle id="alert-dialog-title">{"Dane do tagowania"}</DialogTitle>
                <DialogContent>
                    {/*<DialogContentText id="alert-dialog-description">*/}
                        <Paper component="ul" className={classes.root}>
                            {chipData.map((data) => {
                                let icon;

                                if (data.label === "React") {
                                    // icon = <TagFacesIcon />;
                                }

                                return (
                                    <div key={data.key}
                                         draggable={true}
                                         onDragStart={(e) => e.dataTransfer.setData('text/plain', null)}
                                         onDragEnd={handleDelete(data)}
                                    >
                                        <Chip
                                            icon={icon}

                                            label={data.label}


                                            className={classes.chip}
                                            style={{ background: colors[data.key] }}
                                        />
                                    </div>
                                );
                            })}
                        </Paper>
                        <Paper className={'abc'}
                               onMouseEnter={testIn}
                               onMouseOut={testOut}
                               style={{ height: 200, background: "#e0cbcb", display: "flex" }}>
                            {chipDataNew.length > 0 &&
                            chipDataNew.map((data) => {
                                let icon;
                                if (data.label === "Other") {
                                    return (
                                        <li key={data.key} style={{ listStyleType: "none" }}>
                                            <Chip
                                                icon={icon}

                                                draggable={true}
                                                label={data.label}
                                                // onDelete={
                                                //   data.label === "React" ? undefined : handleDelete(data)
                                                // }
                                                onDelete={
                                                    data.label === "React" ? undefined : handleDelete(data)
                                                }
                                                className={classes.chip}
                                                style={{ background: colors[data.key] }}
                                            />
                                            <input type={"text"} />
                                        </li>
                                    );
                                }
                                return (
                                    <li key={data.key} style={{ listStyleType: "none" }}>
                                        <Chip
                                            // icon={icon}

                                            draggable={true}
                                            label={data.label}
                                            // onDelete={
                                            //   data.label === "React" ? undefined : handleDelete(data)
                                            // }
                                            onDelete={
                                                data.label === "React" ? undefined : handleDelete(data)
                                            }
                                            className={classes.chip}
                                            style={{ background: colors[data.key] }}
                                        />
                                    </li>
                                );
                            })}
                        </Paper>
                    {/*</DialogContentText>*/}
                </DialogContent>
                <DialogActions>
                    <Button  onClick={() => props.setTagDialogOpen(false)} color="primary">
                        CANCEL
                    </Button>
                    <Button onClick={() => props.setTagDialogOpen(false)} color="primary" autoFocus>
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}