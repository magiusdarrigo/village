export const usernameAllowed = (username: string) => {
  // ensure username is not empty
  if (username.includes(" ")) {
    return false;
  }
  // ensure username is not too long
  if (username.length > 16) {
    return false;
  }
  // ensure username is not racist with regex
  if (username.match(/^(n|N)(i|I)(g|G)(g|G)(e|E|3)(r|R)/)) {
    return false;
  }
  return true;
};

export const postTextContentAllowed = (content: string) => {
  // ensure content is not empty
  if (content.length === 0) {
    return false;
  }
  // ensure content is not too long
  if (content.length > 400) {
    return false;
  }
  // ensure content is not racist with regex
  if (content.match(/^(n|N)(i|I)(g|G)(g|G)(e|E|3)(r|R)/)) {
    return false;
  }
  return true;
};

export const commentTextContentAllowed = (content: string) => {
  // ensure content is not empty
  if (content.length === 0) {
    return false;
  }
  // ensure content is not too long
  if (content.length > 200) {
    return false;
  }
  // ensure content is not racist with regex
  if (content.match(/^(n|N)(i|I)(g|G)(g|G)(e|E|3)(r|R)/)) {
    return false;
  }
  return true;
};
