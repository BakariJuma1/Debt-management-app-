//import { useContext } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthProvider"; // Assuming you have a context for authentication

const Navbar = () => {
  const { user, logout } = useAuth(); // Get user and logout function from the context

  return (
    <nav>
      <ul>
        <li>
          <Link to="/signup">Sign Up</Link>
        </li>
        <li>
          <Link to="/login">Login</Link>
        </li>
        {user ? (
          <>
            <li>
              <Link to="/dashboard">Dashboard</Link>
            </li>
            <li>
              <button onClick={logout}>Logout</button>
            </li>
          </>
        ) : null}
      </ul>
    </nav>
  );
};

export default Navbar;
