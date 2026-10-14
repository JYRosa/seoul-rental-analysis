import { useEffect, useState } from 'react'
import { NAV_ITEMS, PROJECT } from '../constants/content'

function useActiveSection(ids, ready) {
  const [activeId, setActiveId] = useState(ids[0])

  useEffect(() => {
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean)
    if (elements.length === 0) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-72px 0px -60% 0px' },
    )

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [ids, ready])

  return activeId
}

const SECTION_IDS = NAV_ITEMS.map((item) => item.id)

function Header({ ready }) {
  const activeId = useActiveSection(SECTION_IDS, ready)

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="site-header__brand" href="#overview">
          Seoul Rental Analysis
        </a>
        <nav aria-label="섹션 이동">
          <ul className="site-nav">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={activeId === item.id ? 'true' : undefined}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a
          className="site-header__link"
          href={PROJECT.githubUrl}
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      </div>
    </header>
  )
}

export default Header
