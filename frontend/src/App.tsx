import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';

function App() {
      return (
              <Router>
                    <Routes>
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/onboarding" element={<div style={{ padding: '20px' }}><h1>Onboarding</h1>h1></div>div>} />
                                    <Route path="/" element={<LoginPage />} />
                            </Route>Routes>
                    </Routes>Router>
                );
                  }
              
              export default App;
              </Router>
