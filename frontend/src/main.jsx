import { createRoot } from 'react-dom/client';
import App from './App';
import { setupAxiosInterceptors } from './utils/apiSetup';
import './index.css';

// axios interceptors  setup first, otherwise on the first request token not included
setupAxiosInterceptors();

const container = document.getElementById('root');
const root = createRoot(container);

root.render(<App />);