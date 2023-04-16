import React from 'react'
import '../App.css';
import { useState, useEffect, useCallback } from "react";
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import UserCredentialsDialog from '../UserCredentialsDialog/UserCredentialsDialog';
import { getUserToken, saveUserToken, clearUserToken } from "../localStorage";
import Calculator from '../rateCalculator/Calculator';
import { DataGrid } from "@mui/x-data-grid";
import TextField from "@mui/material/TextField";
import Select from '@mui/material/Select';
import { MenuItem } from '@mui/material';
import Statistics from '../statistics/Statistics';



var SERVER_URL = "http://127.0.0.1:5000"

const ExchangeRates = () => {
    let [buyUsdRate, setBuyUsdRate] = useState(null);
    let [sellUsdRate, setSellUsdRate] = useState(null);
    let [lbpInput, setLbpInput] = useState("");
    let [usdInput, setUsdInput] = useState("");
    let [transactionType, setTransactionType] = useState("usd-to-lbp");
    let [errorMsg, setErrorMsg] = useState("");//this one is used when adding a transaction with an input missing
    let [userToken, setUserToken] = useState(getUserToken());
    let [userTransactions, setUserTransactions] = useState([]);

    const States = {
        PENDING: "PENDING",
        USER_CREATION: "USER_CREATION",
        USER_LOG_IN: "USER_LOG_IN",
        USER_AUTHENTICATED: "USER_AUTHENTICATED",
    };

    const dataGridColumns = [
        {
            field: "id",
            headerName: "Transaction Id",
            flex: 1
        },

        {
            field: "lbp_amount",
            headerName: "LBP Amount",
            flex: 1,
        },

        {
            field: "usd_amount",
            headerName: "USD Amount",
            flex: 1,
        },

        {
            field: "usd_to_lbp",
            headerName: "USD to LBP",
            flex: 1,
        },

        {
            field: "added_date",
            headerName: "Date",
            flex: 1,
        }

    ]

    let [authState, setAuthState] = useState(States.PENDING);


    const fetchUserTransactions = useCallback(() => {
        fetch(`${SERVER_URL}/transaction`, {
            headers: {
                Authorization: `bearer ${userToken}`,
            },
        })
            .then((response) => response.json())
            .then((transactions) => setUserTransactions(transactions));
    }, [userToken]);
    useEffect(() => {
        if (userToken) {
            fetchUserTransactions();
        }
    }, [fetchUserTransactions, userToken]);


    function fetchRates() {
        fetch(`${SERVER_URL}/exchangeRate`)
            .then(response => response.json())
            .then(data => {
                setBuyUsdRate(data.lbp_to_usd);
                setSellUsdRate(data.usd_to_lbp);
                console.log(data.usd_to_lbp)
            });
    }
    useEffect(fetchRates, []);

    function addItem() {
        if (lbpInput != "" && lbpInput != NaN && usdInput != "" && usdInput != NaN) {

            let usd_to_lbp = true;
            if (transactionType == "lbp-to-usd") {
                usd_to_lbp = false;
            }
            let transactionToSend = {
                usd_amount: usdInput,
                lbp_amount: lbpInput,
                usd_to_lbp: usd_to_lbp,
            }
            let header = { "Content-Type": "application/json" };
            if (userToken) {
                header["Authorization"] = `Bearer ${userToken}`;
            }
            fetch(`${SERVER_URL}/transaction`, {
                method: "POST",
                headers: header,
                body: JSON.stringify(transactionToSend),
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data);//success
                })
                .catch((err) => {
                    console.error("something went wrong while sending the transaction");//error
                });


            //reset the values in the fields
            setLbpInput("");
            setUsdInput("");

            fetchRates();
            fetchUserTransactions();
            setErrorMsg("");
        } else {
            setErrorMsg("Please Enter All Amounts");
        }


    }
    fetchRates();
    fetchUserTransactions();

    function login(username, password) {
        return fetch(`${SERVER_URL}/authentication`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_name: username,
                password: password,
            }),
        })
            .then((response) => response.json())
            .then((body) => {
                setAuthState(States.USER_AUTHENTICATED);
                setUserToken(body.token);
                saveUserToken(userToken);
            });
    }

    function createUser(username, password) {
        return fetch(`${SERVER_URL}/user`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_name: username,
                password: password,
            }),
        }).then((response) => login(username, password));
    }

    function logout() {
        setUserToken(null);
        clearUserToken()
    }

    return (
        <div>
            <AppBar position="static" style={{ backgroundColor: "#2c2c6c" }} >
                <Toolbar classes={{ root: "nav" }}>
                    <div style={{ display: "flex" }}>
                        <Typography variant="h5" style={{ marginRight: "20px" }} >Exchange Rate App</Typography>
                        <a className="nav_anchor" variant="h5" style={{ marginRight: "20px" }} href="#statistics">Statistics</a>
                    </div>

                    <div>
                        {userToken !== null ? (
                            <Button color="inherit" onClick={logout}>
                                Logout
                            </Button>
                        ) : (
                            <div>
                                <Button
                                    color="inherit"
                                    onClick={() => setAuthState(States.USER_CREATION)}
                                >
                                    Register
                                </Button>
                                <Button
                                    color="inherit"
                                    onClick={() => setAuthState(States.USER_LOG_IN)}
                                >
                                    Login
                                </Button>
                            </div>
                        )}
                    </div>
                </Toolbar>
            </AppBar>
            <div className="wrapper">
                <Typography variant="h4">Today's Exchange Rate</Typography>
                <p>LBP to USD Exchange Rate</p>
                <Typography variant="h6">
                    Buy USD: <span id="buy-usd-rate">{buyUsdRate != null ? buyUsdRate : "Not Available"}</span>
                </Typography>
                <Typography variant="h6">
                    Sell USD: <span id="sell-usd-rate">{sellUsdRate != null ? sellUsdRate : "Not Available"}</span>
                </Typography>
                <hr />
                <Calculator
                    buyUsdRate={buyUsdRate}
                    sellUsdRate={sellUsdRate}
                />
            </div>

            <div className="wrapper">
                <Typography variant="h5">Record a recent transaction</Typography>
                <form name="transaction-entry">
                    <div className="form-item">
                        <TextField
                            InputLabelProps={{
                                style: { color: 'white' },
                            }}
                            InputProps={{
                                style: { color: 'white' },
                            }}
                            fullWidth
                            label="LBP Amount"
                            type="number"
                            value={lbpInput}
                            onChange={({ target: { value } }) => setLbpInput(value)}
                        />
                    </div>
                    <div className="form-item">
                        <TextField
                            InputLabelProps={{
                                style: { color: 'white' },
                            }}
                            InputProps={{
                                style: { color: 'white' },
                            }}
                            fullWidth
                            label="USD Amount"
                            type="number"
                            value={usdInput}
                            onChange={({ target: { value } }) => setUsdInput(value)}
                        />
                    </div>
                    <Select id="transaction-type" style={{ color: 'white' }} defaultValue={transactionType} size="small" onChange={e => setTransactionType(e.target.value)}>
                        <MenuItem value="usd-to-lbp">USD to LBP</MenuItem>
                        <MenuItem value="lbp-to-usd">LBP to USD</MenuItem>
                    </Select>
                </form>

                <Button className='button' color="primary" variant="contained" onClick={addItem} style={{ marginTop: "20px" }}>Add</Button>
                <p style={{ color: "red" }}>{errorMsg}</p>
            </div>
            <UserCredentialsDialog
                open={authState === States.USER_CREATION}
                onClose={() => setAuthState(States.PENDING)}
                onSubmit={createUser}
                title="Enter your credentials"
                submitText="Sign Up"
            />
            <UserCredentialsDialog
                open={authState === States.USER_LOG_IN}
                onClose={() => setAuthState(States.PENDING)}
                onSubmit={login}
                title="Enter your credentials"
                submitText="Login"
            />
            <Snackbar
                elevation={6}
                variant="filled"
                open={authState === States.USER_AUTHENTICATED}
                autoHideDuration={2000}
                onClose={() => setAuthState(States.PENDING)}
            >
                <Alert severity="success">Success</Alert>
            </Snackbar>

            {userToken && (
                <div className="wrapper">
                    <Typography variant="h5">Your Transactions</Typography>
                    <DataGrid
                        columns={dataGridColumns}
                        rows={userTransactions}
                        autoHeight />
                </div>
            )}
            <Statistics />

        </div>
    );
}

export default ExchangeRates