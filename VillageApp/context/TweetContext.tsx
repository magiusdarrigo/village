import { PropsWithChildren, createContext, useContext } from "react";
import { API_URL } from "../lib/api/config";
import { useAuth } from "./AuthContext";
import { useUser } from "./UserContext";
import { getFileType } from "../lib/helpers";
import { NeighborhoodType } from "../types";

const DEFAULT_IMAGE_BASE_URL =
  "https://zgsgsszttvkptdpijrzb.supabase.co/storage/v1/object/public/profile_pictures/defaults";

interface TweetsApiContextType {
  createComment: (data: {
    postID: string;
    textContent: string;
    parentCommentID?: string;
  }) => Promise<any>;
  followUser: (id: string) => Promise<any>;
  unFollowUser: (id: string) => Promise<any>;
  getUserProfile: (id: string) => Promise<any>;
  reportComment: (id: string) => Promise<any>;
  reportTweet: (id: string) => Promise<any>;
  deleteComment: (data: { id: string; postID: string }) => Promise<any>;
  deleteTweet: (id: string) => Promise<any>;
  hideTweet: (id: string) => Promise<any>;
  likeComment: (data: {
    commentID: string;
    isDislike: boolean;
  }) => Promise<any>;
  likeTweet: (data: { postID: string; isDislike: boolean }) => Promise<any>;
  unlikeComment: (data: {
    commentID: string;
    isDislike: boolean;
  }) => Promise<any>;
  unlikeTweet: (data: { postID: string; isDislike: boolean }) => Promise<any>;
  listComments: (
    postID: string,
    lastLikesCount: string,
    lastCommentID: string
  ) => Promise<any>;
  listTweetsForProfile: (userID: string, page: number) => Promise<any>;
  listUserFollowers: (userID: string, page: number) => Promise<any>;
  listUserFollowing: (userID: string, page: number) => Promise<any>;
  listTweets: (page: number, isHot: boolean) => Promise<any>;
  listNotifications: (page: number) => Promise<any>;
  updateNotifications: (data: {
    notificationIDs: number[];
    read: boolean;
  }) => Promise<any>;
  getTweet: (id: string) => Promise<any>;
  createTweet: (data: {
    neighborhoodID: number;
    textContent?: string;
    imageURL?: string;
    imageWidth: number;
    imageHeight: number;
  }) => Promise<any>;
  updateUserAttributes: (data: {
    username?: string;
    profileImage?: string;
    buildingID?: string;
    neighborhoodID?: string;
    fcmToken?: string;
    selectedNeighborhoods?: NeighborhoodType[];
  }) => Promise<any>;
  checkIfUserAccountWasDeleted: () => Promise<any>;
  uploadProfileWithCustomPic: (formData: FormData) => Promise<any>;
  getBuilding: (address: string) => Promise<any>;
  createBuilding: (
    buildingAddress: string,
    selectedNeighborhood: string
  ) => Promise<any>;
  addBuildingChangeRequest: (address: string) => Promise<any>;
  accountDeletionRequest: () => Promise<any>;
  blockUser: (userID: string) => Promise<any>;
}

const TweetsApiContext = createContext<TweetsApiContextType>({
  createComment: async () => {},
  followUser: async () => {},
  unFollowUser: async () => {},
  getUserProfile: async () => {},
  reportComment: async () => {},
  reportTweet: async () => {},
  deleteComment: async () => {},
  deleteTweet: async () => {},
  hideTweet: async () => {},
  likeComment: async () => {},
  likeTweet: async () => {},
  unlikeComment: async () => {},
  unlikeTweet: async () => {},
  listComments: async () => {},
  listTweetsForProfile: async () => {},
  listUserFollowers: async () => {},
  listUserFollowing: async () => {},
  listTweets: async () => {},
  listNotifications: async () => {},
  updateNotifications: async () => {},
  getTweet: async () => {},
  createTweet: async () => {},
  updateUserAttributes: async () => {},
  checkIfUserAccountWasDeleted: async () => {},
  uploadProfileWithCustomPic: async () => {},
  getBuilding: async () => {},
  createBuilding: async () => {},
  addBuildingChangeRequest: async () => {},
  accountDeletionRequest: async () => {},
  blockUser: async () => {},
});

const TweetsApiContextProvider = ({ children }: PropsWithChildren) => {
  const { authToken, removeAuthToken } = useAuth();
  const { user } = useUser();

  const createComment = async (data: {
    postID: string;
    textContent: string;
    parentCommentID?: string;
  }) => {
    if (!authToken) {
      return {};
    }

    const url = `${API_URL}/v1/comments`;

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
      throw new Error("Error creating comment");
    }

    const body = await res.json();
    return body;
  };

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

  const reportComment = async (id: string) => {
    if (!authToken) {
      return {};
    }

    const url = `${API_URL}/v1/comments/${id}/report`;

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
      throw new Error("Error reporting comment");
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

  const deleteComment = async (data: { id: string; postID: string }) => {
    const { id, postID } = data;
    if (!authToken) {
      return {};
    }

    const url = `${API_URL}/v1/comments/${id}?postID=${postID}`;

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
      throw new Error("Error deleting comment");
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

  const hideTweet = async (id: string) => {
    if (!authToken) {
      return {};
    }

    const url = `${API_URL}/v1/posts/${id}/hide`;

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
      throw new Error("Error hiding post");
    }

    const body = await res.json();
    return body;
  };

  const likeComment = async (data: {
    commentID: string;
    isDislike: boolean;
  }) => {
    const { commentID: id, isDislike } = data;
    if (!authToken) {
      return {};
    }

    const url = `${API_URL}/v1/comments/${id}/likes?is_dislike=${isDislike}`;

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
      throw new Error("Error liking comment");
    }

    const body = await res.json();
    return body;
  };

  const likeTweet = async (data: { postID: string; isDislike: boolean }) => {
    const { postID: id, isDislike } = data;
    if (!authToken) {
      return {};
    }

    const url = `${API_URL}/v1/posts/${id}/likes?is_dislike=${isDislike}`;

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

  const unlikeComment = async (data: {
    commentID: string;
    isDislike: boolean;
  }) => {
    const { commentID: id, isDislike } = data;
    if (!authToken) {
      return {};
    }

    const url = `${API_URL}/v1/comments/${id}/likes?is_dislike=${isDislike}`;

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
      throw new Error("Error unliking comment");
    }

    const body = await res.json();
    return body;
  };

  const unlikeTweet = async (data: { postID: string; isDislike: boolean }) => {
    const { postID: id, isDislike } = data;
    if (!authToken) {
      return {};
    }

    const url = `${API_URL}/v1/posts/${id}/likes?is_dislike=${isDislike}`;

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
    return body;
  };

  const listTweetsForProfile = async (userID: string, page: number) => {
    if (!authToken) {
      return {};
    }

    const url = `${API_URL}/v1/users/${userID}/posts?cursor=${page}`;

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
      throw new Error("Error fetching posts for user");
    }

    const body = await res.json();
    return body;
  };

  const listUserFollowers = async (userID: string, page: number) => {
    if (!authToken) {
      return {};
    }

    const url = `${API_URL}/v1/userfollowing/${userID}/followers?cursor=${page}`;

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
      throw new Error("Error fetching followers for user");
    }

    const body = await res.json();
    return body;
  };

  const listUserFollowing = async (userID: string, page: number) => {
    if (!authToken) {
      return {};
    }

    const url = `${API_URL}/v1/userfollowing/${userID}/following?cursor=${page}`;

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
      throw new Error("Error fetching who the user is following");
    }

    const body = await res.json();
    return body;
  };

  const listTweets = async (page: number, isHot: boolean) => {
    if (!authToken) {
      return {};
    }
    const url = `${API_URL}/v1/neighborhoods/${user?.neighborhood_id}/posts?cursor=${page}&is_hot=${isHot}`;

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

  const listNotifications = async (page: number) => {
    if (!authToken) {
      return {};
    }

    const url = `${API_URL}/v1/users/${user?.id}/notifications?cursor=${page}`;

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
      throw Error("Error fetching notifications");
    }

    const body = await res.json();
    return body;
  };

  const updateNotifications = async (data: {
    notificationIDs: number[];
    read: boolean;
  }) => {
    if (!authToken) {
      return {};
    }

    const url = `${API_URL}/v1/users/${user?.id}/notifications`;

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
      throw Error("Error updating notifications");
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
    imageWidth: number;
    imageHeight: number;
  }) => {
    if (!authToken) {
      return {};
    }

    const imageType = getFileType(data.imageURL);

    const formData = new FormData();
    if (imageType !== "") {
      formData.append("image", {
        uri: data.imageURL,
        type: imageType,
        name: `upload.${imageType.split("/").pop()}`,
      } as any);
      formData.append("imageWidth", data.imageWidth.toString());
      formData.append("imageHeight", data.imageHeight.toString());
    }
    formData.append("textContent", data.textContent || "");
    formData.append("neighborhoodID", data.neighborhoodID.toString());

    const url = `${API_URL}/v1/posts`;

    const res = await fetch(url, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "multipart/form-data",
      },
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
    fcmToken?: string;
    selectedNeighborhoods?: NeighborhoodType[];
  }) => {
    if (!authToken) {
      return {};
    }

    const formData = new FormData();

    const hasDefaultImageBeenChosen =
      data.profileImage?.includes(DEFAULT_IMAGE_BASE_URL) || false;

    if (hasDefaultImageBeenChosen) {
      formData.append("defaultImage", data.profileImage ?? "");
    }

    if (data.profileImage && !hasDefaultImageBeenChosen) {
      const imageType = getFileType(data.profileImage);
      if (imageType !== "") {
        formData.append("image", {
          uri: data.profileImage,
          type: imageType,
          name: `upload.${imageType.split("/").pop()}`,
        } as any);
      }
    }

    if (data.username) {
      formData.append("username", data.username);
    }

    if (data.buildingID) {
      formData.append("buildingID", data.buildingID);
    }

    if (data.neighborhoodID) {
      formData.append("neighborhoodID", data.neighborhoodID);
    }

    if (data.fcmToken) {
      formData.append("fcmToken", data.fcmToken);
    }

    if (data.selectedNeighborhoods) {
      formData.append(
        "selectedNeighborhoods",
        JSON.stringify(data.selectedNeighborhoods)
      );
    }

    const url = `${API_URL}/v1/users`;

    const res = await fetch(url, {
      method: "PUT",
      body: formData,
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "multipart/form-data",
      },
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

  const checkIfUserAccountWasDeleted = async () => {
    if (!authToken) {
      return {};
    }

    const url = `${API_URL}/v1/accountdeletionrequest`;

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
      throw new Error("Error Checking if account previously existed.");
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

  const addBuildingChangeRequest = async (address: string) => {
    if (!authToken) {
      return {};
    }

    const url = `${API_URL}/v1/buildings`;

    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-type": "Application/json",
      },
      body: JSON.stringify({
        address,
      }),
    });

    if (res.status === 403) {
      removeAuthToken();
      return {};
    }

    if (res.status !== 200) {
      throw Error("Error adding building change request");
    }

    const body = await res.json();
    return body;
  };

  const accountDeletionRequest = async () => {
    if (!authToken) {
      return {};
    }

    const url = `${API_URL}/v1/users`;

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
      throw Error("Error requesting account deletion");
    }

    const body = await res.json();
    return body;
  };

  const blockUser = async (userID: string) => {
    if (!authToken) {
      return {};
    }

    const url = `${API_URL}/v1/users/${userID}/block`;

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
      throw Error("Error blocking user");
    }

    const body = await res.json();
    return body;
  };

  return (
    <TweetsApiContext.Provider
      value={{
        createComment,
        followUser,
        unFollowUser,
        getUserProfile,
        reportComment,
        reportTweet,
        deleteComment,
        deleteTweet,
        hideTweet,
        likeComment,
        likeTweet,
        unlikeComment,
        unlikeTweet,
        listComments,
        listTweetsForProfile,
        listUserFollowers,
        listUserFollowing,
        listTweets,
        listNotifications,
        updateNotifications,
        getTweet,
        createTweet,
        updateUserAttributes,
        checkIfUserAccountWasDeleted,
        uploadProfileWithCustomPic,
        getBuilding,
        createBuilding,
        addBuildingChangeRequest,
        accountDeletionRequest,
        blockUser,
      }}
    >
      {children}
    </TweetsApiContext.Provider>
  );
};

export default TweetsApiContextProvider;

export const useTweetsApi = () => useContext(TweetsApiContext);
