import React, { useEffect, useState } from 'react'
import '../App.css'
import './Predictions.css'
import {BiTimeFive} from 'react-icons/bi'
import Typography from '@mui/material/Typography'
import Chart from './ChartPrediction'
import TextField from '@mui/material/TextField'



const Predictions = () => {
    var SERVER_URL = "http://127.0.0.1:5000"


    let [predictionDays, setPredictionDays] = useState(3);
    let [bestBuyTime, setBestBuyTime] = useState();
    let [bestSellTime, setBestSellTime] = useState();

        function fetchBestTime() {
        fetch(`${SERVER_URL}/best_time`)
            .then(response => response.json())
            .then(data => {
                setBestBuyTime(data.best_buy_time);
                setBestSellTime(data.best_sell_time);
            });
    }
    useEffect(fetchBestTime, []);

    return (
        <div id="predictions" className='wrapper'>
            <Typography variant="h5">Best Time to Buy and Sell</Typography>
            <div className="predictions__card">
                <article className='predictions__cards'>
                    <BiTimeFive className='predictions__icon' />
                    <h5>Best Time to Buy</h5>
                    <small>{bestBuyTime}</small>
                </article>
                <article className='predictions__cards'>
                    <BiTimeFive className='predictions__icon' />
                    <h5>Best Time to Sell</h5>
                    <small>{bestSellTime}</small>
                </article>
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
                                label="Prediction Days"
                                type="number"
                                value={predictionDays}
                                onChange={({ target: { value } }) => setPredictionDays(value)}
                            />
                        </div>
            <div className="predictions__chart__cards">
                <Chart/>
            </div>
            <div className="predictions__chart__cards">
                <Chart/>
            </div>
        </div>
    ) 
}

export default Predictions