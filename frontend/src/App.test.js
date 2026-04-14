import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { AuthContext } from './context/AuthContext';

jest.mock('./components/Navbar', () => () => <div>Navbar</div>);
jest.mock('./components/AllPosts', () => () => <div>All Jobs</div>);
jest.mock('./components/Login', () => () => <div>Login Page</div>);
jest.mock('./components/Register', () => () => <div>Register Page</div>);
jest.mock('./components/MyApplications', () => () => <div>My Applications</div>);
jest.mock('./components/Create', () => () => <div>Create Job</div>);
jest.mock('./components/Edit', () => () => <div>Edit Job</div>);
jest.mock('./components/ApplicantReview', () => () => <div>Applicant Review</div>);

test('renders the home route', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <AuthContext.Provider value={{ user: null, token: null, login: jest.fn(), logout: jest.fn() }}>
        <App />
      </AuthContext.Provider>
    </MemoryRouter>
  );

  expect(screen.getByText(/all jobs/i)).toBeInTheDocument();
  expect(screen.getByText(/navbar/i)).toBeInTheDocument();
});
