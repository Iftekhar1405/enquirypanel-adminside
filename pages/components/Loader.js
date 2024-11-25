export const Loader = ({ children, isLoading }) => {
  return isLoading ? "Loading..." : children;
};
