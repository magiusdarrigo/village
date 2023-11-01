import { API_URL } from "./config";

export const login = async (data: { phoneNumber: string }) => {
  const res = await fetch(`${API_URL}/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-type": "Application/json",
    },
    body: JSON.stringify(data),
  });
  if (res.status !== 200) {
    throw new Error("Error during the login process");
  }
};

export const authenticate = async (data: {
  phoneNumber: string;
  phoneToken: string;
}) => {
  const res = await fetch(`${API_URL}/v1/auth/authenticate`, {
    method: "POST",
    headers: {
      "Content-type": "Application/json",
    },
    body: JSON.stringify(data),
  });
  if (res.status !== 200) {
    throw new Error("Error during the login process");
  }
  return res.json();
};
