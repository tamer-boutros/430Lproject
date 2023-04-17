import React from 'react'
import ExchangeRates from './exchangeRates/ExchangeRates'
import Statistics from './statistics/Statistics'
import Predictions from './predictions/Predictions'

const App = () => {
  return (
    <div>
        <ExchangeRates/>
        <Statistics/>
        <Predictions/>
    </div>
  )
}

export default App