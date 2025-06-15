import React, { useState } from "react";
const Register = ({ Classplus, handleSwitch }) => {
  const [Username, setUsername] = useState("");
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [ConfirmPassword, setConfirmPassword] = useState("");
  const [Error, setError] = useState(null);
  const [Success, setSuccess] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [verifyotp, setVerifyotp] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState(null);
  const [otpSuccess, setOtpSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!termsAccepted) {
      setError("You must accept the terms and conditions.");
      return;
    }

    if (Password !== ConfirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Username, Email, Password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Registration failed");
        throw new Error(errorData.message || "Registration failed");
      }

      const data = await response.json();
      setSuccess(data.message);
      setVerifyotp(true);
    } catch (error) {
      console.error("Error during registration:", error);
    }
  };

  const sendotp = async (e) => {
    setOtpSuccess("Otp is on the way");
    e.preventDefault();
    setOtpError(null);
    try {
      const response = await fetch("http://127.0.0.1:5000/register/otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Email }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        setOtpError(errorData.message || "Failed to send OTP");
        throw new Error(errorData.message || "Failed to send OTP");
      }
      const data = await response.json();
      setOtpSuccess(data.message);
      setVerifyotp(true);
    } catch (error) {
      console.error("Error sending OTP:", error);
    }
  };

  const verify_otp = async (e) => {
    setOtpSuccess(null);
    e.preventDefault();
    setOtpError(null);
    try {
      const response = await fetch("http://127.0.0.1:5000/register/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Email, otp }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        setOtpError(errorData.message || "OTP verification failed");
        throw new Error(errorData.message || "OTP verification failed");
      }
      const data = await response.json();
      setOtpSuccess(data.message);
      window.location.href = "/"; 
    } catch (error) {
      console.error("Error verifying OTP:", error);
    }
  };

  if (verifyotp) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6 text-center">Verify OTP</h1>
        <form onSubmit={verify_otp}>
          <div className="mb-4 bg-gray-900 p-7 rounded-2xl">
            <label htmlFor="otp">
              Enter OTP
              <input
                onChange={(e) => setOtp(e.target.value)}
                value={otp}
                type="text"
                id="otp"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter the OTP sent to your email"
              />
            </label>
             {otpError && (
                <p className="text-red-500 text-sm mt-2">{otpError}</p>
              )}
              {otpSuccess && (
                <p className="text-green-500 text-sm mt-2">{otpSuccess}</p>
              )}
            <div className="w-[75vw] max-w-sm flex flex-row mt-8 justify-around items-center">
             
              <button
                className="p-2 rounded-2xl w-1/3 bg-blue-600 "
                onClick={sendotp}
                value="Send otp"
              >
                sendotp
              </button>
              <button
                className="p-2 bg-blue-600 w-1/3 rounded-2xl"
                type="submit"
                value="Verify"
              >
                verify
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }
  return (
    <div
      className={
        " flex flex-col items-center justify-center min-h-screen bg-gray-800 " +
        Classplus
      }
    >
      <h1 className="text-3xl font-bold mb-6">Register</h1>
      <form
        onSubmit={handleSubmit}
        className="w-[75vw] max-w-sm bg-gray-900 p-8 rounded-lg shadow-md"
      >
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
            id="username"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-white-500"
            placeholder="Enter your username"
            autoComplete="username"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-sm font-medium text-gray-100 mb-2"
            htmlFor="email"
          >
            Email
          </label>
          <input
            value={Email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            id="email"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
            autoComplete="email"
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
            id="password"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your password"
            autoComplete="new-password"
          />
          <p className="text-xs text-gray-400 mt-2">
            Password must be at least 8 characters, include an uppercase letter,
            a lowercase letter and a special character.
          </p>
        </div>
        <div>
          <label
            className="block text-sm font-medium text-gray-100 mb-2"
            htmlFor="confirm-password"
          >
            Confirm Password
          </label>
          <input
            value={ConfirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
            id="confirm-password"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Confirm your password"
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className="inline-flex items-center">
            <input
              checked={termsAccepted}
              type="checkbox"
              className="form-checkbox h-4 w-4 text-blue-600"
              id="terms"
              onChange={() => setTermsAccepted(!termsAccepted)}
            />
            <span className="ml-2 text-sm text-gray-300">
              I agree to the terms and conditions
            </span>
          </label>
        </div>

        <div>
          {Error && <p className="text-red-500 text-sm mb-4">{Error}</p>}
          {Success && <p className="text-green-500 text-sm mb-4">{Success}</p>}
        </div>
        <button
          disabled={!Username || !Email || !Password || !ConfirmPassword}
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200"
        >
          Register
        </button>
      </form>

      <div className="mt-4">
        <p className="text-sm text-gray-300">
          Already have an account?{" "}
          <button
            onClick={handleSwitch}
            className="text-blue-500 hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};
export default Register;
