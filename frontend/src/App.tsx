import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import OnboardingFlow from './components/onboarding/OnboardingFlow';

function App() {
    return (
          <Router>
                <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/onboarding" element={<OnboardingFlow />} />
                        <Route path="/" element={<LoginPage />} />
                </Routes>
          </Router>
        );
}

export default App;
