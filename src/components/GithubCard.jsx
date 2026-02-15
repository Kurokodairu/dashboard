import { useState, useEffect } from 'react'
import { Github, Star, GitFork } from 'lucide-react'
import './GithubCard.css'

const GithubCard = ({ username }) => {
  const [profile, setProfile] = useState(null)
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!username) {
      setProfile(null)
      setRepos([])
      setError(null)
      return
    }

    const fetchGithubData = async () => {
      setLoading(true)
      setError(null)

      try {
        const encodedUsername = encodeURIComponent(username)
        const baseUrl = `/api/github?username=${encodedUsername}`

        const profileRes = await fetch(baseUrl)
        if (!profileRes.ok) throw new Error('User not found')
        const profileData = await profileRes.json()

        const reposRes = await fetch(`/api/github?username=${encodedUsername}&repos=true`)
        if (!reposRes.ok) throw new Error('Failed to load repositories')
        const reposData = await reposRes.json()

        setProfile(profileData)
        setRepos(reposData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchGithubData()
  }, [username])

  if (!username) {
    return (
      <div className="glass-card">
        <h2 className="card-title">
          <Github size={24} />
          GitHub
        </h2>
        <div className="no-github">
          <Github size={48} />
          <p>Set your GitHub username in settings</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="glass-card">
        <h2 className="card-title">
          <Github size={24} />
          GitHub
        </h2>
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading GitHub data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-card">
        <h2 className="card-title">
          <Github size={24} />
          GitHub
        </h2>
        <div className="error">
          <p>Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card">
      <h2 className="card-title">
        <Github size={24} />
        GitHub
      </h2>

      {profile && (
        <div className="github-content">
          <div className="profile-section">
            <img 
              src={profile.avatar_url} 
              alt={profile.name} 
              className="avatar"
            />
            <div className="profile-info">
              <h3 className="name">{profile.name || profile.login}</h3>
              <p className="username">@{profile.login}</p>
              {profile.bio && <p className="bio">{profile.bio}</p>}

            </div>
          </div>
          <img
                src={`https://ghchart.rshah.org/${profile.login}`}
                alt="GitHub contributions"
                className="heatmap"
              />

          {repos.length > 0 && (
            <div className="repos-section">
              <h4>Top Repositories</h4>
              {repos.map(repo => (
                <div key={repo.id} className="repo">
                  <div className="repo-info">
                    <span className="repo-name">{repo.name}</span>
                    {repo.description && (
                      <p className="repo-desc">{repo.description}</p>
                    )}
                  </div>
                  <div className="repo-stats">
                    <div className="repo-stat">
                      <Star size={12} />
                      <span>{repo.stargazers_count}</span>
                    </div>
                    <div className="repo-stat">
                      <GitFork size={12} />
                      <span>{repo.forks_count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default GithubCard
