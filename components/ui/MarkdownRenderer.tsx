import { marked } from 'marked'

type Props = {
  content: string
  className?: string
}

// Server component — renders markdown to HTML, no client JS needed.
// marked is configured to NOT allow raw HTML in input (safe for user bios).
function MarkdownRenderer({ content, className = '' }: Props) {
  marked.setOptions({ gfm: true, breaks: true })

  // Use marked with a custom renderer that strips raw HTML
  const renderer = new marked.Renderer()
  renderer.html = () => '' // drop any raw HTML tags users might type

  const html = marked.parse(content, { renderer }) as string

  return (
    <div
      className={`prose-terminal ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export { MarkdownRenderer }
