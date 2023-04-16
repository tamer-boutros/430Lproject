import React from 'react'
import '../App.css';
import Typography from '@mui/material/Typography'
import './Statistics.css'
import { ImStatsDots } from 'react-icons/im'



const Statistics = () => {
    return (
        <div id= "statistics" className='wrapper'>
            <Typography variant="h5">Statistics and Insights</Typography>
            <div className="statistics__card">
                <article className='statistics__cards'>
                    <ImStatsDots className='statistics__icon'/>
                    <h5>Median</h5>
                    <small>1000</small>
                </article>

                <article className='statistics__cards'>
                <ImStatsDots className='statistics__icon'/>
                    <h5>Standard Deviation</h5>
                    <small>100</small>
                </article>

                <article className='statistics__cards'>
                <ImStatsDots className='statistics__icon'/>
                    <h5>Total LBP Volume</h5>
                    <small>100</small>
                </article>
                <article className='statistics__cards'>
                <ImStatsDots className='statistics__icon'/>
                    <h5>Total Number of Transactions</h5>
                    <small>10</small>
                </article>
                <article className='statistics__cards'>
                <ImStatsDots className='statistics__icon'/>
                    <h5>Total USD Volume</h5>
                    <small>1000</small>
                </article>
                <article className='statistics__cards'>
                <ImStatsDots className='statistics__icon'/>
                    <h5>Volatility</h5>
                    <small>10000</small>
                </article>
            </div>
        </div>
    )
}

export default Statistics