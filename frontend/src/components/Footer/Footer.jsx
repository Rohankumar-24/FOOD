import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'

const Footer = () => {
  return (
    <div className='footer' id='footer'>
        <div className="footer-content">
            <div className="footer-content-left">
                {/* <img src={assets.logo} alt="" /> */}
                <h1 className="footer-logo">Zesty Bite</h1>
                
                <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum in, beatae dolorem non optio cupiditate, quam sunt dicta dolores minima exercitationem ducimus totam aut asperiores inventore harum laudantium. Distinctio, libero.</p>
                {/* <div className="footer-social-icons">
                    <img src={assets.facebook_icon} alt="" />
                    <img src={assets.twitter_icon} alt="" />
                    <img src={assets.linkedin_icon} alt="" />
                </div> */}

                <div className="footer-social-icons">
  <a href="https://www.facebook.com/yourpage" target="_blank" rel="noopener noreferrer">
    <img src={assets.facebook_icon} alt="Facebook" />
  </a>
  <a href="https://twitter.com/yourhandle" target="_blank" rel="noopener noreferrer">
    <img src={assets.twitter_icon} alt="Twitter" />
  </a>
  <a href="https://www.linkedin.com/in/yourprofile" target="_blank" rel="noopener noreferrer">
    <img src={assets.linkedin_icon} alt="LinkedIn" />
  </a>
</div>

            </div>
            <div className="footer-content-center">
                <h2>COMPANY</h2>
                <ul>
                    <li>Home</li>
                    <li>About us</li>
                    <li>Delivery</li>
                    <li>Privacy Policy</li>
                </ul>
            </div>
            <div className="footer-content-right">
                <h2>GET IN TOUCH</h2>
                <ul>
                    <li>+91 7009910497</li>
                    <li>rohanbhagat6806@gmail.com</li>
                </ul>
            </div>
           
        </div>
        <hr />
        <p className="footer-copyright">
            Copyright 2025 &copy; RohanKumar - All Right Reserved.
        </p>
    </div>
  )
}

export default Footer