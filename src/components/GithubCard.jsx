import { useState, useEffect } from 'react'
import { Github, Star, GitFork } from 'lucide-react'

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
        const baseUrl = `/api/github?username=${username}`

        const profileRes = await fetch(baseUrl)
        if (!profileRes.ok) throw new Error('User not found')
        const profileData = await profileRes.json()

        const reposRes = await fetch(`${baseUrl}/repos?sort=stars&per_page=3`)
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
        <style>{`
          .no-github {
            text-align: center;
            padding: 2rem;
            opacity: 0.6;
          }
        `}</style>
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

      <style>{`
        .github-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .profile-section {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .profile-info {
          flex: 1;
        }

        .name {
          font-size: 1.2rem;
          font-weight: 600;
          margin: 0 0 0.25rem 0;
        }

        .username {
          font-size: 0.9rem;
          opacity: 0.7;
          margin: 0 0 0.5rem 0;
        }

        .bio {
          font-size: 0.85rem;
          opacity: 0.8;
          margin: 0;
          line-height: 1.4;
        }

        .heatmap {
          margin-top: 1rem;
          max-width: 100%;
          border-radius: 8px;
          opacity: 0.85;
          justify-self: flex;
        }

        .repos-section h4 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 0.75rem 0;
        }

        .repo {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 0.5rem;
        }

        .repo:last-child {
          margin-bottom: 0;
        }

        .repo-info {
          flex: 1;
        }

        .repo-name {
          font-size: 0.9rem;
          font-weight: 600;
          display: block;
          margin-bottom: 0.25rem;
        }

        .repo-desc {
          font-size: 0.8rem;
          opacity: 0.7;
          margin: 0;
          line-height: 1.3;
        }

        .repo-stats {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .repo-stat {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.8rem;
          opacity: 0.7;
        }

        .loading, .error {
          text-align: center;
          padding: 2rem;
          opacity: 0.6;
        }

        .spinner {
          width: 24px;
          height: 24px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          .profile-section {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  )
}

export default GithubCard
