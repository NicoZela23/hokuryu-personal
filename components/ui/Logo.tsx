import Link from 'next/link'

function Logo() {
  return (
    <Link
      href="/garden"
      className="font-display text-3xl text-phosphor glow tracking-widest uppercase hover:text-phosphor-bright transition-colors focus:outline-none"
    >
      ◈ HOKURYU
    </Link>
  )
}

export { Logo }
