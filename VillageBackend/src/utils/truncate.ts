export const truncateNotificationMessage = (message: string) => {
  return message.length > 50 ? `${message.slice(0, 50)}...` : message;
};
