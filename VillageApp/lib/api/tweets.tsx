import { PropsWithChildren, createContext, useContext } from "react";
import { API_URL } from "./config";
import { useAuth } from "../../context/AuthContext";

interface TweetsApiContextType {
  likeTweet: (id: string) => Promise<any>;
  unlikeTweet: (id: string) => Promise<any>;
  listTweets: () => Promise<any>;
  getTweet: (id: string) => Promise<any>;
  createTweet: (data: {
    neighborhoodID: number;
    textContent?: string;
    imageURL?: string;
  }) => Promise<any>;
  updateUserAttributes: (data: {
    username?: string;
    profileImage?: string;
    buildingID?: string;
    neighborhoodID?: string;
  }) => Promise<any>;
  uploadProfileWithCustomPic: (formData: FormData) => Promise<any>;
  getBuilding: (address: string) => Promise<any>;
  createBuilding: (
    buildingAddress: string,
    selectedNeighborhood: string
  ) => Promise<any>;
}

const TweetsApiContext = createContext<TweetsApiContextType>({
  likeTweet: async () => {},
  unlikeTweet: async () => {},
  listTweets: async () => {},
  getTweet: async () => {},
  createTweet: async () => {},
  updateUserAttributes: async () => {},
  uploadProfileWithCustomPic: async () => {},
  getBuilding: async () => {},
  createBuilding: async () => {},
});

const TweetsApiContextProvider = ({ children }: PropsWithChildren) => {
  const { authToken, removeAuthToken } = useAuth();

  const likeTweet = async (id: string) => {
    if (!authToken) {
      return {};
    }

    const url = `${API_URL}/v1/posts/${id}/likes`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (res.status === 403) {
      removeAuthToken();
      return {};
    }

    if (res.status !== 200) {
      throw new Error("Error liking post");
    }

    const body = await res.json();
    return body;
  };

  const unlikeTweet = async (id: string) => {
    if (!authToken) {
      return {};
    }

    const url = `${API_URL}/v1/posts/${id}/likes`;

    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (res.status === 403) {
      removeAuthToken();
      return {};
    }

    if (res.status !== 200) {
      throw new Error("Error unliking post");
    }

    const body = await res.json();
    return body;
  };

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

  const updateUserAttributes = async (data: {
    username?: string;
    profileImage?: string;
    buildingID?: string;
    neighborhoodID?: string;
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

  const getBuilding = async (address: string) => {
    if (!authToken) {
      return {};
    }
    const url = `${API_URL}/v1/buildings?address=${address}`;

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
      throw new Error("Error fetching building");
    }

    const body = await res.json();
    return body;
  };

  const createBuilding = async (
    buildingAddress: string,
    selectedNeighborhood: string
  ) => {
    if (!authToken) {
      return {};
    }
    const url = `${API_URL}/v1/buildings`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-type": "Application/json",
      },
      body: JSON.stringify({
        address: buildingAddress,
        neighborhood: selectedNeighborhood,
      }),
    });

    if (res.status === 403) {
      removeAuthToken();
      return {};
    }

    if (res.status !== 200) {
      throw new Error("Error creating building");
    }

    const body = await res.json();
    console.log(body);
    return body;
  };

  return (
    <TweetsApiContext.Provider
      value={{
        likeTweet,
        unlikeTweet,
        listTweets,
        getTweet,
        createTweet,
        updateUserAttributes,
        uploadProfileWithCustomPic,
        getBuilding,
        createBuilding,
      }}
    >
      {children}
    </TweetsApiContext.Provider>
  );
};

export default TweetsApiContextProvider;

export const useTweetsApi = () => useContext(TweetsApiContext);
