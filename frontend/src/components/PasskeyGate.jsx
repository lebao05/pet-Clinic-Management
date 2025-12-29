import React, { useState } from "react";
import Button from "../shared/components/ui/Button";

// Simple passkey gate: stores session flag in sessionStorage per role
const PasskeyGate = ({ role = "default", children }) => {
  const keyName = `passkey-validated-${role}`;
  const [validated, setValidated] = useState(() => {
    try {
      return sessionStorage.getItem(keyName) === "1";
    } catch {
      return false;
    }
  });
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  if (validated) return <>{children}</>;

  const submit = (e) => {
    e && e.preventDefault();
    setError("");
    if (input === "123") {
      try {
        sessionStorage.setItem(keyName, "1");
      } catch {
        // ignore storage errors
      }
      setValidated(true);
    } else {
      setError("Invalid passkey");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded shadow p-6">
        <h2 className="text-lg font-semibold mb-2">Enter passkey to continue</h2>
        <p className="text-sm text-neutral-600 mb-4">This area requires a passkey. Enter the passkey to proceed.</p>
        <form onSubmit={submit} className="space-y-3">
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="Passkey"
            autoFocus
          />
          {error && <div className="text-danger-600 text-sm">{error}</div>}
          <div className="flex justify-end">
            <Button type="submit" variant="dark">Enter</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasskeyGate;
