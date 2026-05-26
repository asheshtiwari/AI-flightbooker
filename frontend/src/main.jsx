import { createRoot } from 'react-dom/client';
import App from './App';
import { setupAxiosInterceptors } from './utils/apiSetup';
import './index.css';

// Initialize global API security configuration before rendering the app
setupAxiosInterceptors();

// Initialize React application in the root DOM element
const container = document.getElementById('root');
const root = createRoot(container);

root.render(<App />);