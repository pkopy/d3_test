import React, {useEffect} from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

export default function AlertDialog(props) {
    const [open, setOpen] = React.useState(props.open);
    const [arr, setArr] = React.useState([])
    useEffect(() => {
        setOpen(!open)
        setArr([])
        console.log(props.chartOptions.arr)
        if (props.chartOptions.arr) {

            const x = Array.from(props.chartOptions.arr)
            setArr(x)
        }
    },[props.open])

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const openTagDialog =() => {
        props.setTagDialogOpen(!props.tagDialogOpen)
        setOpen(false)
    }

    return (
        <div>
            {/*<Button variant="outlined" color="primary" onClick={handleClickOpen}>*/}
            {/*    Open alert dialog*/}
            {/*</Button>*/}
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Dane do tagowania"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {arr&&arr.map((d,i) =>
                            <li key={i}>ID:{d.id}, Value: {d.attributes.q_value.value}</li>
                        )}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Disagree
                    </Button>
                    <Button onClick={openTagDialog} color="primary" autoFocus>
                        Agree
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
