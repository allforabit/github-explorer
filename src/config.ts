export interface Config {
  apiUrl: string;
  owner: string;
  repository: string;
}

export const config: Config = {
  apiUrl: "https://api.github.com",
  owner: "facebook",
  repository: "react"
};
