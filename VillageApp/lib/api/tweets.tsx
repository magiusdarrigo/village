import { PropsWithChildren, createContext, useContext } from "react";
import { API_URL } from "./config";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../context/UserContext";

interface TweetsApiContextType {
  followUser: (id: string) => Promise<any>;
  unFollowUser: (id: string) => Promise<any>;
  getUserProfile: (id: string) => Promise<any>;
  reportTweet: (id: string) => Promise<any>;
  deleteTweet: (id: string) => Promise<any>;
  likeTweet: (id: string) => Promise<any>;
  unlikeTweet: (id: string) => Promise<any>;
  listComments: (
    postID: string,
    lastLikesCount: string,
    lastCommentID: string
  ) => Promise<any>;
  listTweets: (page: number) => Promise<any>;
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
  followUser: async () => {},
  unFollowUser: async () => {},
  getUserProfile: async () => {},
  reportTweet: async () => {},
  deleteTweet: async () => {},
  likeTweet: async () => {},
  unlikeTweet: async () => {},
  listComments: async () => {},
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
  const { user } = useUser();

  const followUser = async (id: string) => {
    if (!authToken) {
      return {};
    }

    const url = `${API_URL}/v1/users/${id}/follow`;

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
      throw new Error("Error following user");
    }

    const body = await res.json();
    return body;
  };

  const unFollowUser = async (id: string) => {
    if (!authToken) {
      return {};
    }

    const url = `${API_URL}/v1/users/${id}/follow`;

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
      throw new Error("Error unfollowing user");
    }

    const body = await res.json();
    return body;
  };

  const getUserProfile = async (id: string) => {
    if (!authToken) {
      return {};
    }

    const url = `${API_URL}/v1/users/${id}`;

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
      throw new Error("Error fetching user profile");
    }

    const body = await res.json();
    return body;
  };

  const reportTweet = async (id: string) => {
    if (!authToken) {
      return {};
    }

    const url = `${API_URL}/v1/posts/${id}/report`;

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
      throw new Error("Error reporting post");
    }

    const body = await res.json();
    return body;
  };

  const deleteTweet = async (id: string) => {
    if (!authToken) {
      return {};
    }

    const url = `${API_URL}/v1/posts/${id}`;

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
      throw new Error("Error deleting post");
    }

    const body = await res.json();
    return body;
  };

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

  const listComments = async (
    postID: string,
    lastLikesCount: string,
    lastCommentID: string
  ) => {
    if (!authToken) {
      return {};
    }

    console.log("listComments API params: ", {
      lastLikesCount,
      lastCommentID,
    });

    const url = `${API_URL}/v1/posts/${postID}/comments?lastLikesCount=${lastLikesCount}&lastCommentID=${lastCommentID}`;

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
      throw new Error(`Error fetching comments for post ${postID}`);
    }

    const body = await res.json();
    console.log("comments API body: ", body);
    return body;
  };

  const listTweets = async (page: number) => {
    if (!authToken) {
      return {};
    }
    const url = `${API_URL}/v1/neighborhoods/${user?.neighborhood_id}/posts?cursor=${page}`;

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

    const body = await res.json();
    return body;
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

    if (res.status === 400) {
      const body = await res.json();
      throw new Error(JSON.stringify({ status: res.status, body }));
    }

    if (res.status !== 200) {
      throw new Error("Error creating post");
    }

    const body = await res.json();
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

    if (res.status === 400) {
      const body = await res.json();
      throw new Error(JSON.stringify({ status: res.status, body }));
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
    return body;
  };

  return (
    <TweetsApiContext.Provider
      value={{
        followUser,
        unFollowUser,
        getUserProfile,
        reportTweet,
        deleteTweet,
        likeTweet,
        unlikeTweet,
        listComments,
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
