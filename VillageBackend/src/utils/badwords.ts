export const usernameAllowed = (username: string) => {
  // ensure username is not empty
  if (!username) {
    return false;
  }
  // ensure username is not too long
  if (username.length > 30) {
    return false;
  }
  // ensure username is not racist with regex
  if (username.match(/^(n|N)(i|I)(g|G)(g|G)(e|E|3)(r|R)/)) {
    return false;
  }
  return true;
};
