export const KM_TO_MILES = 0.621371;
export const getInitials = (userFullName: string) => {
  if (userFullName && typeof userFullName == "string") {
    const split = userFullName.split(" ");
    if (split.length == 1) {
      return split[0][0].toLocaleUpperCase();
    } else if (split.length > 1) {
      return `${split[0][0] + split[1][0]}`.toLocaleUpperCase();
    }
  }
};
