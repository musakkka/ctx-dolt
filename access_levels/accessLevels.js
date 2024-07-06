// utils/accessLevels.js

const accessLevels = {
    SUPER_ADMINS: ["fabulousmochama@gmail.com"],
    CREATOR: ["berryhopkinns@gmail.com"],
    CURATORS: ["fabbymochs@gmail.com"],
  };
  
  export const getAccessLevel = (email) => {
    if (accessLevels.SUPER_ADMINS.includes(email)) {
      return 'SUPER_ADMIN';
    }
    if (accessLevels.CURATORS.includes(email)) {
      return 'CURATOR';
    }
    return 'USER';
  };
  