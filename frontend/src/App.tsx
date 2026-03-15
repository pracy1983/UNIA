import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';

function App() {
              return (
                              <Router>
                                    <Routes>
                                            <Route path="/login" element={<LoginPage />} />
                                            <Route path="/" element={<LoginPage />} />
                                    </Routes>Routes>
                              </Router>Router>
                            );
}

export default App;
</Router>
