import React from 'react'
import './Main.css';

export const Card = () => {
  return (
    <div className='card'>
        <div className='card-content'>
            <div className='format card-title'>
                <span>ICON</span>
                <h4 className='text-xl'>Record Pushups</h4>
            </div>
            <div className='format'>
              <div className='card-body text-xs'>
                <div className='card-info'>
                  <div>Current Streak:</div>
                  <span>x days</span>
                </div>
                
                <div className='card-info'>
                  <div>Today's Goal:</div>
                  <span>x</span>
                </div>
              </div>
              
            </div>
            <div className='format'>
              <div className="input-row">
                <input
                  type="number"
                  className="card-input"
                  placeholder="Enter count"
                />
                <button className="btn-icon">
                  <span className="material-icons">add_circle</span>
                </button>
              </div>
            </div>
            <div className='format'>
              <span className='text-xs card-footer'>misc</span>
            </div>
        </div>
    </div>
  )
}
