export type GithubFindMyUserResponse = {
  id?: number | string;
  login?: string;
  type?: string;
};

export type GithubUserRepoResponseData = {
  owner?: {
    id?: number | string;
    type?: string;
  };
  fork?: boolean;
  forks_count?: number;
  stargazers_url?: string;
  stargazers_count?: number;
};

export type GithubRepoRequestResponse = {
  data?: GithubUserRepoResponseData[];
  status?: number;
};
