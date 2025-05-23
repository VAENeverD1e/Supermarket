import { RollerShades } from "@mui/icons-material";
import { createContext, useContext, useReducer } from "react";
import { useEffect } from "react";
const initialState = {
  isAuthenticated: false,
  isInitialized: true,
  user: null,
};

const INITIALIZE = "INITIALIZE";
const LOGIN_SUCCESS = "LOGIN_SUCCESS";
const LOGOUT = "LOGOUT";

const reducer = (state, action) => {
  switch (action.type) {
    case INITIALIZE:
      const { isAuthenticated, user } = action.payload;
      return {
        ...state,
        isAuthenticated,
        isInitialized: true,
        user,
      };
    case LOGIN_SUCCESS:
      console.log(!state.isAuthenticated);
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
      };
    case LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    default:
      return state;
  }
};

export const AuthContext = createContext({ ...initialState });

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  useEffect(() => {
    const initialize = async () => {
      try {
        const username = window.localStorage.getItem("username");
        const role = window.localStorage.getItem("role");

        if (username && role) {
          dispatch({
            type: INITIALIZE,
            payload: { isAuthenticated: true, user: { username, role} },
          });
        } else {
          dispatch({
            type: INITIALIZE,
            payload: { isAuthenticated: false, user: null },
          });
        }
      } catch (err) {
        console.error(err);
        dispatch({
          type: INITIALIZE,
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    };
    initialize();
  }, []);

  const login = async (username, password, callback) => {
    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
  
      if (!res.ok) throw new Error("Invalid login");
  
      const data = await res.json();
  
      localStorage.setItem("username", data.user.username);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("employeeId", data.user.employeeid);
      dispatch({ type: LOGIN_SUCCESS, payload: { user: data.user } });
      if (data.user.role === "Cashier") {
        callback("/cashier-dashboard");
      } else if (data.user.role === "Consultant") {
        callback("/consultant-dashboard");
      } else {
        callback("/"); // fallback to home
      }
      } catch (err) {
      alert("Login failed: " + err.message);
    }
  };
  
  const signup = async ({ username, password, email, phonenumber,address }, callback) => {
    try {
      const res = await fetch("http://localhost:5000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email, phonenumber, address }),
      });
  
      if (!res.ok) throw new Error("Signup failed");
  
      callback(); // navigate to login
    } catch (err) {
      alert("Signup failed: " + err.message);
    }
  };
  
  

  const logout = async (callback) => {
    window.localStorage.removeItem("username");
    dispatch({ type: LOGOUT });
    callback(); 
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};