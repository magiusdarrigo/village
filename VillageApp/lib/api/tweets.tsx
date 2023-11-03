import { PropsWithChildren, createContext, useContext } from "react";
import { API_URL } from "./config";
import { useAuth } from "../../context/AuthContext";

interface TweetsApiContextType {
  listTweets: () => Promise<any>;
  getTweet: (id: string) => Promise<any>;
  createTweet: (data: {
    neighborhoodID: number;
    textContent?: string;
    imageURL?: string;
  }) => Promise<any>;
  uploadProfileWithDefaultPic: (data: {
    username: string;
    profileImage: string;
  }) => Promise<any>;
  uploadProfileWithCustomPic: (formData: FormData) => Promise<any>;
}

const TweetsApiContext = createContext<TweetsApiContextType>({
  listTweets: async () => {},
  getTweet: async () => {},
  createTweet: async () => {},
  uploadProfileWithDefaultPic: async () => {},
  uploadProfileWithCustomPic: async () => {},
});

const TweetsApiContextProvider = ({ children }: PropsWithChildren) => {
  const { authToken, removeAuthToken } = useAuth();

  const listTweets = async () => {
    if (!authToken) {
      return {};
    }
    const url = `${API_URL}/v1/neighborhoods/1/posts`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (res.status === 403) {
      removeAuthToken();
      return {};
    }

    if (res.status !== 200) {
      throw new Error("Error fetching posts");
    }

    return await res.json();
  };

  const getTweet = async (id: string) => {
    if (!authToken) {
      return {};
    }
    const url = `${API_URL}/v1/posts/${id}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (res.status === 403) {
      removeAuthToken();
      return {};
    }

    if (res.status !== 200) {
      throw new Error("Error fetching post");
    }

    const body = await res.json();
    return body;
  };

  const createTweet = async (data: {
    neighborhoodID: number;
    textContent?: string;
    imageURL?: string;
  }) => {
    if (!authToken) {
      return {};
    }
    const url = `${API_URL}/v1/posts`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-type": "Application/json",
      },
      body: JSON.stringify(data),
    });

    if (res.status === 403) {
      removeAuthToken();
      return {};
    }

    if (res.status !== 200) {
      throw new Error("Error creating post");
    }

    const body = await res.json();
    console.log(body);

    return body;
  };

  const uploadProfileWithDefaultPic = async (data: {
    username: string;
    profileImage: string;
  }) => {
    if (!authToken) {
      return {};
    }
    const url = `${API_URL}/v1/users`;

    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-type": "Application/json",
      },
      body: JSON.stringify(data),
    });

    if (res.status === 403) {
      removeAuthToken();
      return {};
    }

    if (res.status !== 200) {
      throw new Error("Error Uploading profile");
    }

    return await res.json();
  };

  const uploadProfileWithCustomPic = async (formData: FormData) => {
    if (!authToken) {
      return {};
    }
    const url = `${API_URL}/v1/users/upload`;

    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    });

    if (res.status === 403) {
      removeAuthToken();
      return {};
    }

    if (res.status !== 200) {
      throw new Error("Error Uploading profile");
    }

    return await res.json();
  };

  return (
    <TweetsApiContext.Provider
      value={{
        listTweets,
        getTweet,
        createTweet,
        uploadProfileWithDefaultPic,
        uploadProfileWithCustomPic,
      }}
    >
      {children}
    </TweetsApiContext.Provider>
  );
};

export default TweetsApiContextProvider;

export const useTweetsApi = () => useContext(TweetsApiContext);
