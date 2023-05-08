import React, { useEffect, useState } from 'react'
import '../App.css';
import Typography from '@mui/material/Typography'
import './Statistics.css'
import { ImStatsDots } from 'react-icons/im'
import { BiStats } from 'react-icons/bi'
import { AiOutlineFieldNumber, AiFillCaretUp } from 'react-icons/ai'
import { AiOutlinePercentage } from 'react-icons/ai'
import { AiOutlineInfoCircle } from 'react-icons/ai'
import { IconButton } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';




var SERVER_URL = "http://127.0.0.1:5000"


const Statistics = () => {
    let [buyUsdStats, setBuyUsdStats] = useState(null);//buy usd statistics to be displayed
    let [sellUsdStats, setSellUsdStats] = useState(null);//sell usd statistics to be diaplyed
    let [totalStats, setTotalStats] = useState(null);//general statistics and insights

    //function to fetch all statistic types mentioned above
    function fetchStats() {
        fetch(`${SERVER_URL}/stats`)
            .then(response => response.json())
            .then(data => {
                setBuyUsdStats(data.buyusd);
                setSellUsdStats(data.sellusd);
                setTotalStats(data.total)
            });
    }
    useEffect(fetchStats, []);

    return (
        <div>
        <div id="statistics" className='wrapper'>
        <Typography variant="h5">
                        <span>Total Statistics and Insights</span>
                        <Tooltip title="You can get a general overview about what transactions had been recorded in the past">
                            <IconButton >
                                <AiOutlineInfoCircle className='icon_button_design' />
                            </IconButton>
                        </Tooltip>
                    </Typography>
            <div className="statistics__card">
                <article className='statistics__cards'>
                    <AiOutlinePercentage className='statistics__icon' />
                    <h5>% Buy Transactions</h5>
                    <small><span id="sell-usd-stats">{totalStats != null ? totalStats['% buy transactions'] : "Not Available"}</span></small>
                </article>

                <article className='statistics__cards'>
                    <AiOutlinePercentage className='statistics__icon' />
                    <h5>% Sell Transactions</h5>
                    <small><span id="sell-usd-stats">{totalStats != null ? totalStats['% sell transactions'] : "Not Available"}</span></small>
                </article>

                <article className='statistics__cards'>
                    <AiOutlineFieldNumber className='statistics__icon' />
                    <h5>Total LBP Volume</h5>
                    <small><span id="sell-usd-stats">{totalStats != null ? totalStats.total_lbp_volume : "Not Available"}</span></small>
                </article>
                <article className='statistics__cards'>
                    <AiOutlineFieldNumber className='statistics__icon' />
                    <h5>Total Number of Transactions</h5>
                    <small><span id="sell-usd-stats">{totalStats != null ? totalStats.total_number_of_transactions : "Not Available"}</span></small>
                </article>
                <article className='statistics__cards'>
                    <AiOutlineFieldNumber className='statistics__icon' />
                    <h5>Total USD Volume</h5>
                    <small><span id="sell-usd-stats">{totalStats != null ? totalStats.total_usd_volume : "Not Available"}</span></small>
                </article>
            </div>
        </div>

            <div id="statistics2" className='wrapper'>
            <Typography variant="h5">
                        <span>Sell Statistics and Insights</span>
                        <Tooltip title="You can get a general overview about what sell transactions had been recorded in the past">
                            <IconButton >
                                <AiOutlineInfoCircle className='icon_button_design' />
                            </IconButton>
                        </Tooltip>
                    </Typography>
            <div className="statistics__card">
                <article className='statistics__cards'>
                    <ImStatsDots className='statistics__icon' />
                    <h5>Median</h5>
                    <small><span id="sell-usd-stats">{sellUsdStats != null ? sellUsdStats.median : "Not Available"}</span></small>
                </article>

                <article className='statistics__cards'>
                    <BiStats className='statistics__icon' />
                    <h5>Standard Deviation</h5>
                    <small><span id="sell-usd-stats">{sellUsdStats != null ? sellUsdStats.stddev : "Not Available"}</span></small>
                </article>

                <article className='statistics__cards'>
                    <AiOutlineFieldNumber className='statistics__icon' />
                    <h5>Total LBP Volume</h5>
                    <small><span id="sell-usd-stats">{sellUsdStats != null ? sellUsdStats.total_lbp_volume : "Not Available"}</span></small>
                </article>
                <article className='statistics__cards'>
                    <AiOutlineFieldNumber className='statistics__icon' />
                    <h5>Total Number of Transactions</h5>
                    <small><span id="sell-usd-stats">{sellUsdStats != null ? sellUsdStats.total_number_of_transactions : "Not Available"}</span></small>
                </article>
                <article className='statistics__cards'>
                    <AiOutlineFieldNumber className='statistics__icon' />
                    <h5>Total USD Volume</h5>
                    <small><span id="sell-usd-stats">{sellUsdStats != null ? sellUsdStats.total_usd_volume : "Not Available"}</span></small>
                </article>
                <article className='statistics__cards'>
                    <AiFillCaretUp className='statistics__icon' />
                    <h5>Volatility</h5>
                    <small><span id="sell-usd-stats">{sellUsdStats != null ? sellUsdStats.volatility : "Not Available"}</span></small>
                </article>
            </div>

            </div>

            <div id="statistics3" className='wrapper'>
            <Typography variant="h5">
                        <span>Buy Statistics and Insights</span>
                        <Tooltip title="You can get a general overview about what buy transactions had been recorded in the past">
                            <IconButton >
                                <AiOutlineInfoCircle className='icon_button_design' />
                            </IconButton>
                        </Tooltip>
                    </Typography>            <div className="statistics__card">
                <article className='statistics__cards'>
                    <ImStatsDots className='statistics__icon' />
                    <h5>Median</h5>
                    <small><span id="sell-usd-stats">{buyUsdStats != null ? buyUsdStats.median : "Not Available"}</span></small>
                </article>

                <article className='statistics__cards'>
                    <BiStats className='statistics__icon' />
                    <h5>Standard Deviation</h5>
                    <small><span id="sell-usd-stats">{buyUsdStats != null ? buyUsdStats.stddev : "Not Available"}</span></small>
                </article>

                <article className='statistics__cards'>
                    <AiOutlineFieldNumber className='statistics__icon' />
                    <h5>Total LBP Volume</h5>
                    <small><span id="sell-usd-stats">{buyUsdStats != null ? buyUsdStats.total_lbp_volume : "Not Available"}</span></small>
                </article>
                <article className='statistics__cards'>
                    <AiOutlineFieldNumber className='statistics__icon' />
                    <h5>Total Number of Transactions</h5>
                    <small><span id="sell-usd-stats">{buyUsdStats != null ? buyUsdStats.total_number_of_transactions : "Not Available"}</span></small>
                </article>
                <article className='statistics__cards'>
                    <AiOutlineFieldNumber className='statistics__icon' />
                    <h5>Total USD Volume</h5>
                    <small><span id="sell-usd-stats">{buyUsdStats != null ? buyUsdStats.total_usd_volume : "Not Available"}</span></small>
                </article>
                <article className='statistics__cards'>
                    <AiFillCaretUp className='statistics__icon' />
                    <h5>Volatility</h5>
                    <small><span id="sell-usd-stats">{buyUsdStats != null ? buyUsdStats.volatility : "Not Available"}</span></small>
                </article>
            </div>
        </div>
        </div>
    )
}

export default Statistics