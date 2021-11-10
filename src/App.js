import logo from './logo.svg';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Login from './login';
import Home from './home';
import { Container, Navbar, Nav, Image, Badge } from "react-bootstrap";
import { auth, SignIn, SignOut } from './Firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

const Header = () => {
  return (
    <Navbar bg="dark" variant="dark">
      <Container>
        <Navbar.Brand><Image width={50} src={process.env.PUBLIC_URL + "/logo.png"} roundedCircle /> Smart Parking</Navbar.Brand>
        <Nav className="ms-auto">
          <Nav.Item style={{ display: 'grid', placeItems: 'center' }}><SignOut /></Nav.Item>
        </Nav>
      </Container>
    </Navbar>
  )
}

const App = () => {
  const [user] = useAuthState(auth);

  return (
    <Container fluid className={`${user ? 'animated-bg' : 'animated-bg'}`}>
      {/* <div class="area" >
        <ul class="circles">
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
      </div > */}
      <Header />
      {user ? <Home user={user} /> : <Login SignInButton={SignIn} />}
      <p className='footer fst-italic'>Made by️ <strong>Brig. Himanshu Bhatnagar</strong></p>
    </Container>
  );
}

export default App;