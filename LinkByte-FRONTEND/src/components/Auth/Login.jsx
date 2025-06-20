import React, { useState } from "react";
const Login = ({Classplus="" , handleSwitch}) => {
  const [Username, setUsername] = useState("");
  const [Password, setPassword] = useState("");
  const [Error, setError] = useState(null);
  const [Success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const signin_type = "local";

    try {
      const response = await fetch("http://127.0.0.1:5000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Username, Password ,signin_type}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Login failed");
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      setSuccess(data.message);
      const token = data['token'];
      if (!token) {
        setError("No token received");
        throw new Error("No token received");
      }
      localStorage.setItem('jwtToken', token);
      localStorage.setItem('username', Username);
      window.location.href = "/home";
    } catch (error) {

      console.error("Error during login:", error);
    }
  };
  return (
    <div className={"flex flex-col items-center justify-center min-h-screen bg-gray-800 " + Classplus} >
      <h1 className="text-3xl font-bold mb-6">Login</h1>
      <form onSubmit={handleSubmit} className="w-[75vw] max-w-sm bg-gray-900 p-8 rounded-lg shadow-md">
        <div className="mb-4">
          <label
            className="block text-sm font-medium text-gray-100 mb-2"
            htmlFor="username"
          >
            Username
          </label>
          <input
            onChange={(e) => setUsername(e.target.value)}
            value={Username}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2
            focus:ring-blue-500"
            placeholder="Enter your username"
            autoComplete="username"
          />
        </div>
        <div className="mb-6">
          <label
            className="block text-sm font-medium text-gray-100 mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <input
            value={Password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2
            focus:ring-blue-500"
            placeholder="Enter your password"
            autoComplete="current-password"
          />
        </div>

        <div>
          {Error && <p className="text-red-500 text-sm mb-4">{Error}</p>}
          {Success && <p className="text-green-500 text-sm mb-4">{Success}</p>}
        </div>
        <button
          disabled={!Username || !Password}
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200"
        >
          Login
        </button>
      </form>
      <div className="mt-4 text-sm text-gray-400">
        Don't have an account?{" "}
        <button
          onClick={handleSwitch}
          className="text-blue-500 hover:underline"
        >
          Register
        </button></div>
    </div>
  );
};
export default Login;
