import './App.css';
import AllPosts from './components/AllPosts';
import { Routes, Route } from "react-router-dom";
import Create from './components/Create';
import Navbar from './components/Navbar';
import Edit from './components/Edit';
import Login from './components/Login';
import Register from './components/Register';
import MyApplications from './components/MyApplications'; 
import ApplicantReview from './components/ApplicantReview';
import ProtectedRoute from './components/ProtectedRoute';
import JobDetails from './components/JobDetails';
import Spline from '@splinetool/react-spline';

function App() {
  return (
    <div className="app-shell">
      <div className="spline-bg" aria-hidden="true">
        <Spline scene="https://prod.spline.design/u2iRitSLrmQwIn5u/scene.splinecode" />
      </div>
      <div className="bg-text-mask" aria-hidden="true" />
      <div className="bg-overlay" aria-hidden="true" />
      <div className="app-content">
        <Navbar />
        <Routes>
          <Route path='/' element={<AllPosts/>}/>
          <Route path='/jobs/:id' element={<JobDetails/>}/>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute allowedRoles={['CANDIDATE']} />}>
            <Route path="/my-applications" element={<MyApplications />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['RECRUITER']} />}>
            <Route path="/create" element={<Create />} />
            <Route path="/edit/:id" element={<Edit />} />
            <Route path="/applicants/:jobId" element={<ApplicantReview />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
}

export default App;
