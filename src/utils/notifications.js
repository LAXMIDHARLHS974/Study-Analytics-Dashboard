export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

export const sendNotification = (title, options = {}) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }
  try {
    new Notification(title, {
      icon: '/assets/student_avatar.jpg',
      badge: '/assets/cute_star_mascot.jpg',
      ...options,
    });
  } catch (e) {
    console.warn('Notification display failed', e);
  }
};
