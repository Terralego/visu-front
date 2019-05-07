import search from '../../services/search';

export const SearchProvider = ({ children, env: { API_HOST } }) => {
  search.host = API_HOST.replace(/api$/, 'elasticsearch');
  return children;
};

export default SearchProvider;
