import React from 'react'
import './footer.css'

const year = new Date().getFullYear()

const Footer = () => {
  return (
    <div className='footer Flex'>
      <p>&copy; {year} shutterOn. All rights reserved.</p>
    </div>
  )
}

export default Footer
