import React, { useContext, useState } from 'react';
import './LoginPopup.css';
import { assets } from '../../assets/assets';
import { StoreContext } from './../context/StoreContext';
import axios from 'axios';

const LoginPopup = ({ setShowLogin }) => {
  const { setToken } = useContext(StoreContext);
  
  // Use environment URL with fallback
  const url = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000';
  
  const [currentState, setCurrentState] = useState('Login');
  const [data, setData] = useState({
    name: '',
    email: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const onLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    
    // Construct endpoint URL
    const endpoint = `${url}/api/user/${currentState === 'Login' ? 'login' : 'register'}`;
    
    console.log('Attempting to connect to:', endpoint); // Debug log
    
    try {
      const response = await axios.post(endpoint, data, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });

      console.log('Response:', response.data); // Debug log

      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
        setShowLogin(false);
        alert(`${currentState} successful!`);
      } else {
        alert(response.data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error("Login/Register Error:", error);
      
      if (error.code === 'ECONNABORTED') {
        alert("Request timed out. Please check your internet connection.");
      } else if (error.response) {
        // Server responded with error status
        console.error('Error Response:', error.response.data);
        alert(error.response.data.message || `Server error: ${error.response.status}`);
      } else if (error.request) {
        // Network error
        alert("Cannot connect to server. Please make sure the backend is running.");
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='login-popup'>
      <form onSubmit={onLogin} className="login-popup-container">
        <div className="login-popup-title">
          <h2>{currentState}</h2>
          <img
            onClick={() => setShowLogin(false)}
            src={assets.cross_icon}
            alt="close"
          />
        </div>

        <div className="login-popup-inputs">
          {currentState === 'Sign Up' && (
            <input
              name='name'
              onChange={onChangeHandler}
              value={data.name}
              type="text"
              placeholder='Your name'
              required
              disabled={loading}
            />
          )}
          <input
            name='email'
            onChange={onChangeHandler}
            value={data.email}
            type="email"
            placeholder='Your email'
            required
            disabled={loading}
          />
          <input
            name='password'
            onChange={onChangeHandler}
            value={data.password}
            type="password"
            placeholder='Password'
            required
            disabled={loading}
          />
        </div>

        <button type='submit' disabled={loading}>
          {loading ? 'Please wait...' : (currentState === 'Sign Up' ? 'Create account' : 'Login')}
        </button>

        <div className="login-popup-condition">
          <input type="checkbox" required disabled={loading} />
          <p>By continuing, I agree to the terms of use & privacy policy</p>
        </div>

        {currentState === 'Login' ? (
          <p>
            Create a new account?{' '}
            <span onClick={() => !loading && setCurrentState('Sign Up')}>Click here</span>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <span onClick={() => !loading && setCurrentState('Login')}>Login here</span>
          </p>
        )}
      </form>
    </div>
  );
};

export default LoginPopup;