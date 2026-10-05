import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Đảm bảo không lưu dữ liệu nhạy cảm hoặc giao dịch trong localStorage
try {
  localStorage.clear();
} catch (e) {
  console.warn('Cannot clear localStorage:', e);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
