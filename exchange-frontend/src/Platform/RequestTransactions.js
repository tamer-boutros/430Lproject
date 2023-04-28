import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { MenuItem, Select } from '@mui/material';
import React, { useState } from "react";
import "./RequestTransactions.css";

// Component that presents a dialog to collect credentials from the user
export default function RequestTransactions({
    open,
    onSubmit,
    onClose,
    recipientName,
}) {
    let [UsdAmount, setUsdAmount] = useState("");
    let [LbpAmount, setLbpAmount] = useState("");
    let [transactionType, setTransactionType] = useState(true)
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <div className="dialog-container">
                <DialogTitle>Record Transaction with Friend</DialogTitle>
                <div className="form-item">
                    <TextField
                        fullWidth
                        label="UsdAmount"
                        type="number"
                        value={UsdAmount}
                        onChange={({ target: { value } }) => setUsdAmount(value)}
                    />
                </div>
                <div className="form-item">
                    <TextField
                        fullWidth
                        label="LbpAmount"
                        type="number"
                        value={LbpAmount}
                        onChange={({ target: { value } }) => setLbpAmount(value)}
                    />
                </div>
                <Select id="transaction-type" style={{ color: '#2c2c6c', marginBottom: '10px',  }}  defaultValue={transactionType===true?"usd-to-lbp":"lbp-to-usd"} onChange={e => setTransactionType(e.target.value === "usd-to-lbp")}>
                            <MenuItem value="usd-to-lbp">USD to LBP</MenuItem>
                            <MenuItem value="lbp-to-usd">LBP to USD</MenuItem>
                        </Select>
                <Button
                    color="primary"
                    variant="contained"
                    onClick={() => onSubmit(recipientName, UsdAmount, LbpAmount, transactionType)}
                >
                    Submit
                </Button>
            </div>
        </Dialog>
    );
}