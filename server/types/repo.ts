export interface Repo {
  repos: Array<{
    /** Unique identifier of the repository */
    id: number
    /** Name of the repository */
    name: string
    /** Full name of the repository including owner */
    repo: string
    /** Short description of the repository */
    description: string
    /** Date and time when the repository was created */
    createdAt: string
    /** Date and time when the repository was last updated */
    updatedAt: string
    /** Date and time of the last push to the repository */
    pushedAt: string
    /** Number of stars the repository has */
    stars: number
    /** Number of watchers the repository has */
    watchers: number
    /** Number of forks the repository has */
    forks: number
    /** Name of the default branch */
    defaultBranch: string
  }>
}
