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
import { MdCurrencyExchange } from 'react-icons/md'
import { BsCurrencyExchange } from 'react-icons/bs'
import Tooltip from '@mui/material/Tooltip';
import Statistics from '../statistics/Statistics';
import Predictions from '../predictions/Predictions';
import Platform from '../Platform/Platform';
import RateGraphs from '../rateGraphs/RateGraphs'
import { AiOutlineInfoCircle } from 'react-icons/ai'
import { IconButton } from '@mui/material';




var SERVER_URL = "http://127.0.0.1:5000"

const ExchangeRates = () => {
    let [buyUsdRate, setBuyUsdRate] = useState(null);//buy usd rate to be displayed
    let [sellUsdRate, setSellUsdRate] = useState(null);//sell usd rate to be displayed
    let [lbpInput, setLbpInput] = useState("");//lpb input for recording a transaction
    let [usdInput, setUsdInput] = useState("");//usd input for recording a transaction
    let [transactionType, setTransactionType] = useState("usd-to-lbp");//transaction type for recording a transaction
    let [errorMsg, setErrorMsg] = useState("");//this one is used when adding a transaction with a missing input
    let [userToken, setUserToken] = useState(getUserToken());// userToken
    let [userTransactions, setUserTransactions] = useState([]);//user transactions to be displayed
    let [errorMsgLogin, setErrorMsgLogin] = useState("");//error message when someone enters wrong credentials

    const States = {
        PENDING: "PENDING",
        USER_CREATION: "USER_CREATION",
        USER_LOG_IN: "USER_LOG_IN",
        USER_AUTHENTICATED: "USER_AUTHENTICATED",
    };//states for login/logout

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

    ]//for user transactiosn

    let [authState, setAuthState] = useState(States.PENDING);

    // function to fetch user transactions
    //user token is used as header
    const fetchUserTransactions = useCallback(() => {
        fetch(`${SERVER_URL}/transaction`, {
            headers: {
                Authorization: `bearer ${userToken}`,
            },
        })
            .then((response) => response.json())
            .then((transactions) => {
                setUserTransactions(transactions);
                userTransactions = transactions;
            });
    }, [userToken]);
    useEffect(() => {
        if (userToken) {
            fetchUserTransactions();
        }
    }, [fetchUserTransactions, userToken]);

    // function to fetch the buy and sell rates
    function fetchRates() {
        fetch(`${SERVER_URL}/exchangerate`)
            .then(response => response.json())
            .then(data => {
                setBuyUsdRate(data.lbp_to_usd);
                setSellUsdRate(data.usd_to_lbp);
                buyUsdRate = (data.lbp_to_usd);
                sellUsdRate = (data.usd_to_lbp);
            });
    }
    useEffect(fetchRates, [addItem]);

    //function to add a transaction
    // it uses the token in the header, and takes 3 fields, usd,lbp, and transaction type
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
    // fetchRates();
    // fetchUserTransactions();


    //function to login and authenticate the user
    function login(username, password) {
        return fetch(`${SERVER_URL}/authenticate`, {
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
                saveUserToken(body.token);
                setErrorMsgLogin("");
            })
            .catch((err) => {
                setErrorMsgLogin("incorrect username or password")
            });;
    }

    //function to register the user
    function createUser(username, password) {
        return fetch(`${SERVER_URL}/newuser`, {
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

    //function to logout the user and clear the token
    function logout() {
        setUserToken(null);
        clearUserToken()
    }


    return (
        <div>
            <AppBar className='app_bar' position="fixed" >
                <Toolbar classes={{ root: "nav" }}>
                    <div style={{ display: "flex" }}>
                        <a className="nav_anchor" variant="h5" href="#home">Home</a>
                        <a className="nav_anchor" variant="h5" href="#statistics">Statistics</a>
                        <a className="nav_anchor" variant="h5" href="#predictions">Predictions</a>
                        <a className="nav_anchor" variant="h5" href="#graphRates">Rates Graph</a>
                        {userToken && <a className="nav_anchor" variant="h5" href="#platform">Platform</a>}
                    </div>

                    <div className="nav_anchor">
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
            <div id='home' className="wrapper">
                <Typography variant="h4">Today's Exchange Rate</Typography>
                <p>LBP to USD Exchange Rate</p>

                <div className="rates__card">
                    <Tooltip title="the following rate is based on the transactions entered by the users in the last 100 days">
                        <article className='rates__cards'>
                            <BsCurrencyExchange className='rates__icon' />
                            <h5>Buy USD</h5>
                            <small><span id="buy-usd-rate">{buyUsdRate != null ? buyUsdRate : "Not Available"}</span></small>
                        </article>
                    </Tooltip>

                    <MdCurrencyExchange className="rates__icon" />

                    <Tooltip title="the following rate is based on the transactions entered by the users in the last 100 days">
                        <article className='rates__cards'>
                            <BsCurrencyExchange className='rates__icon' />
                            <h5>Sell USD</h5>
                            <small><span id="sell-usd-rate">{sellUsdRate != null ? sellUsdRate : "Not Available"}</span></small>
                        </article>
                    </Tooltip>
                </div>


                <hr style={{ backgroundColor: "white", height: "1px" }} />
                <Calculator
                    buyUsdRate={buyUsdRate}
                    sellUsdRate={sellUsdRate}
                />
            </div>

            <div className="wrapper">
                <Typography variant="h5">
                    <span>Record a recent transaction</span>
                    <Tooltip title="You can add your transactions here:  enter your Usd amount, your LBP amount, choose your transaction type and press add">
                        <IconButton >
                            <AiOutlineInfoCircle className='icon_button_design' />
                        </IconButton>
                    </Tooltip>
                </Typography>
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
                            onChange={({ target: { value } }) => {
                                if (value < 0 || value > 1e12) {
                                    setLbpInput("")
                                }
                                else {
                                    setLbpInput(value)
                                }
                            }}
                            inputProps={{
                                min: 0,
                            }}
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
                            onChange={({ target: { value } }) => {
                                if (value < 0 || value > 1e12) {
                                    setUsdInput("")
                                }
                                else {
                                    setUsdInput(value)
                                }
                            }}
                            inputProps={{
                                min: 0,
                            }}

                        />
                    </div>
                    <Select id="transaction-type" style={{ color: 'white' }} defaultValue={transactionType} size="small" onChange={e => setTransactionType(e.target.value)}>
                        <MenuItem value="usd-to-lbp">USD to LBP</MenuItem>
                        <MenuItem value="lbp-to-usd">LBP to USD</MenuItem>
                    </Select>
                </form>
                <Button className='button' color="primary" variant="contained" onClick={addItem} style={{ marginTop: "20px", backgroundColor: "white", color: "#2c2c6c", fontWeight: "bold" }}>Add</Button>
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
                errorMsgLogin={errorMsgLogin}
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
                    <Typography variant="h5">
                        <span>You Transaction</span>
                        <Tooltip title="You can view your past transactions in details in this section">
                            <IconButton >
                                <AiOutlineInfoCircle className='icon_button_design' />
                            </IconButton>
                        </Tooltip>
                    </Typography>
                    <DataGrid
                        style={{ color: 'white' }}
                        columns={dataGridColumns}
                        rows={userTransactions}
                        autoHeight />
                </div>
            )}
            <Statistics />
            <Predictions />
            <RateGraphs />
            <Platform userToken={userToken} />

        </div>
    );
}

export default ExchangeRates