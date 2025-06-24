import React from 'react'
import { Card } from './Card'
import './Main.css'

export const Main = () => {
  return (
    <main className='main'>
        <div className='main-content'>
            <div className='card-grid'>
                <Card />
                <Card />
                <Card />
            </div>
            
        </div>
        
    </main>
  )
}
